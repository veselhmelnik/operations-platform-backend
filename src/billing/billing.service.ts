import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private readonly stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  private mapStripeStatus(
    status: Stripe.Subscription.Status,
  ): SubscriptionStatus {
    switch (status) {
      case 'active':
      case 'trialing':
        return SubscriptionStatus.ACTIVE;

      case 'past_due':
      case 'unpaid':
        return SubscriptionStatus.PAST_DUE;

      case 'canceled':
        return SubscriptionStatus.CANCELED;

      default:
        return SubscriptionStatus.PAST_DUE;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const organizationId = session.metadata?.organizationId;

    if (!organizationId) {
      throw new Error('Missing organizationId');
    }

    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    if (!subscriptionId) {
      throw new Error('Missing Stripe subscription');
    }

    const stripeSubscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);

    const periodEnd = stripeSubscription.items.data[0]?.current_period_end;

    await this.prisma.subscription.update({
      where: {
        organizationId,
      },
      data: {
        plan: SubscriptionPlan.PRO,
        status: SubscriptionStatus.ACTIVE,

        stripeSubscriptionId: subscriptionId,

        stripeCustomerId:
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id,

        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,

        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const periodEnd = subscription.items.data[0]?.current_period_end;

    await this.prisma.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: this.mapStripeStatus(subscription.status),

        cancelAtPeriodEnd: subscription.cancel_at_period_end,

        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    });
  }

  private async handleSubscriptionDeleted(
    stripeSubscription: Stripe.Subscription,
  ) {
    await this.prisma.subscription.update({
      where: {
        stripeSubscriptionId: stripeSubscription.id,
      },
      data: {
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.CANCELED,
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
      },
    });
  }

  async createCheckoutSession(organizationId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        organizationId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    if (subscription.plan === SubscriptionPlan.PRO) {
      throw new ConflictException('Your Plan is alrready PRO');
    }
    let customerId = subscription.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        metadata: {
          organizationId,
        },
      });

      customerId = customer.id;

      await this.prisma.subscription.update({
        where: {
          organizationId,
        },
        data: {
          stripeCustomerId: customerId,
        },
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID!,
          quantity: 1,
        },
      ],

      success_url:
        `${process.env.FRONTEND_URL}` +
        `/organizations/${organizationId}` +
        `?checkout=success`,

      cancel_url:
        `${process.env.FRONTEND_URL}` +
        `/organizations/${organizationId}` +
        `?checkout=cancelled`,

      metadata: {
        organizationId,
      },

      subscription_data: {
        metadata: {
          organizationId,
        },
      },
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
    }
  }

  async createCustomerPortalSession(organizationId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        organizationId,
      },
    });

    if (!subscription?.stripeCustomerId) {
      throw new NotFoundException('Stripe cutomer not found');
    }
    const session = await this.stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url:
        `${process.env.FRONTEND_URL}` + `/organizations/${organizationId}`,
    });

    return { url: session.url };
  }
}
