import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from 'src/organizations/dto/create-organization.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActivityService } from 'src/activity/activity.service';
import {
  ActivityActions,
  ActivityEntityType,
} from 'src/activity/activityActions';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  getAllOrganizations() {
    return this.prisma.organization.findMany({
      include: {
        members: {
          select: {
            id: true,
            role: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async getUserOrganizations(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });
  }

  async getSingleOrganization(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: id,
      },
      include: {
        members: {
          select: {
            id: true,
            role: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async createSingleOrganization(ownerId, dto: CreateOrganizationDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: dto.name,
        },
      });
      await tx.organizationMember.create({
        data: {
          userId: ownerId,
          organizationId: organization.id,
          role: 'OWNER',
        },
      });
      return tx.organization.findUnique({
        where: {
          id: organization.id,
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });
    });
    if (!result) {
      throw new BadRequestException('Something went wrong');
    }
    await this.activityService.create({
      organizationId: result.id,
      userId: ownerId,
      action: ActivityActions.ORGANIZATION_CREATED,
      entityType: ActivityEntityType.ORGANIZATION,
      entityId: result.id,
    });

    return result;
  }
}
