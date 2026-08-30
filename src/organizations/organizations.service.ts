import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { AddOrganizationMemberDto } from 'src/organizations/dto/add-organization-member.dto';
import { CreateOrganizationDto } from 'src/organizations/dto/create-organization.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async createOneOrganization(dto: CreateOrganizationDto) {
    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: dto.name,
        },
      });
      await tx.organizationMember.create({
        data: {
          userId: dto.ownerId,
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
  }

  async addMemberToOrganization(
    dto: AddOrganizationMemberDto,
    organizationId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });
    if (!organization) throw new NotFoundException('Organization not found');
    try {
      return await this.prisma.organizationMember.create({
        data: {
          organizationId,
          userId: dto.userId,
          role: dto.role,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'User is already a member of this organization',
        );
      }
      throw error;
    }
  }
}
