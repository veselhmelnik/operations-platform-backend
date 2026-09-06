import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { OrganizationRole } from 'src/generated/prisma/enums';
import { CreateInvitationDto } from 'src/invitations/dto/create-invitation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActivityService } from 'src/activity/activity.service';
import {
  ActivityActions,
  ActivityEntityType,
} from 'src/activity/activityActions';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  async createInvitation(
    organizationId: string,
    dto: CreateInvitationDto,
    userId?: string,
  ) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    if (dto.role === OrganizationRole.OWNER) {
      throw new BadRequestException(
        'OWNER role cannot be assigned through invitation',
      );
    }
    const email = dto.email.trim().toLowerCase();
    const existingMember = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        user: {
          email,
        },
      },
    });
    if (existingMember) {
      throw new ConflictException(
        'User is already a member of this organization',
      );
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const existingInvitation =
      await this.prisma.organizationInvitation.findFirst({
        where: {
          organizationId,
          email,
          acceptedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

    let invitation;
    if (existingInvitation) {
      const invitation = await this.prisma.organizationInvitation.update({
        where: { id: existingInvitation.id },
        data: {
          token,
          expiresAt,
          role: dto.role,
        },
      });
    } else {
      invitation = await this.prisma.organizationInvitation.create({
        data: {
          email,
          role: dto.role,
          organizationId,
          token,
          expiresAt,
        },
      });
    }

    if (userId) {
      await this.activityService.create({
        organizationId,
        userId,
        action: ActivityActions.MEMBER_INVITED,
        entityType: ActivityEntityType.INVITATION,
        entityId: invitation.id,
      });
    }

    return invitation;
  }

  async getInvitationByToken(token: string) {
    const invitation = await this.prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException('Invitation has already been accepted');
    }

    return {
      organization: invitation.organization,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      accepted: false,
    };
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException('Invitation has already been accepted');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new BadRequestException(
        'Your email does not match the invitation email',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const accepted = await tx.organizationInvitation.updateMany({
        where: {
          id: invitation.id,
          acceptedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        data: {
          acceptedAt: new Date(),
        },
      });

      if (accepted.count === 0) {
        throw new ConflictException('Invitation is no longer available');
      }
      await tx.organizationMember.create({
        data: {
          userId,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      });

      await tx.organizationInvitation.update({
        where: { id: invitation.id },
        data: {
          acceptedAt: new Date(),
        },
      });

      return {
        organization: invitation.organization,
      };
    });

    await this.activityService.create({
      organizationId: invitation.organizationId,
      userId,
      action: ActivityActions.MEMBER_JOINED,
      entityType: ActivityEntityType.MEMBER,
      entityId: userId,
    });

    return result;
  }
}
