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
