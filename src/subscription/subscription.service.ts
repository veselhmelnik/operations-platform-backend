import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const PLAN_LIMITS = {
  FREE: {
    projects: 3,
    members: 5,
  },

  PRO: {
    projects: Infinity,
    members: Infinity,
  },
} as const;

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  getOrganizationSubscription(organizationId: string) {
    const subscription = this.prisma.subscription.findUnique({
      where: {
        organizationId,
      },
    });
    return subscription;
  }

  async getSubscriptionSummary(organizationId: string) {
    const subscription = await this.getOrganizationSubscription(organizationId);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const [projects, members] = await Promise.all([
      this.prisma.project.count({
        where: { organizationId },
      }),
      this.prisma.organizationMember.count({
        where: { organizationId },
      }),
    ]);

    const limits = PLAN_LIMITS[subscription.plan];

    return {
      plan: subscription.plan,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      currentPeriodEnd: subscription.currentPeriodEnd,
      usage: {
        projects,
        members,
      },

      limits: {
        projects: limits.projects,
        members: limits.members,
      },
    };
  }

  async assertCanCreateProject(organizationId: string) {
    const subscription = await this.getOrganizationSubscription(organizationId);
    if (!subscription)
      throw new NotFoundException('Cannot find current subscription');
    const count = await this.prisma.project.count({
      where: {
        organizationId,
      },
    });
    const limit = PLAN_LIMITS[subscription.plan].projects;
    if (count >= limit) {
      throw new ForbiddenException(
        `Your ${subscription.plan} plan allows up to ${limit} projects`,
      );
    }
  }

  async assertCanAddMember(organizationId: string) {
    const subscription = await this.getOrganizationSubscription(organizationId);
    if (!subscription)
      throw new NotFoundException('Cannot find current subscription');
    const count = await this.prisma.organizationMember.count({
      where: {
        organizationId,
      },
    });
    const limit = PLAN_LIMITS[subscription.plan].members;
    if (count >= limit) {
      throw new ForbiddenException(
        `Your ${subscription.plan} plan allows up to ${limit} members`,
      );
    }
  }
}
