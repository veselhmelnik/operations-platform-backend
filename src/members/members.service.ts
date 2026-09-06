import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { AddOrganizationMemberDto } from 'src/members/dto/add-member.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateOrganizationMemberDto } from './dto/update-member.dto';
import { OrganizationRole } from 'src/generated/prisma/enums';

@Injectable()
export class MembersService {
  constructor(private readonly prismaService: PrismaService) {}
  private async getMemberOrThrow(memberId: string) {
    const member = await this.prismaService.organizationMember.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!member) {
      throw new NotFoundException('Organization member not found');
    }

    return member;
  }
  async addMemberToOrganization(
    dto: AddOrganizationMemberDto,
    organizationId: string,
  ) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: dto.userId,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const organization = await this.prismaService.organization.findUnique({
      where: {
        id: organizationId,
      },
    });
    if (!organization) throw new NotFoundException('Organization not found');
    try {
      return await this.prismaService.organizationMember.create({
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

  getOrganizationMembers(organizationId: string) {
    return this.prismaService.organizationMember.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteOrganizationMember(memberId: string) {
    const member = await this.getMemberOrThrow(memberId);

    if (member.role === OrganizationRole.OWNER) {
      const ownersCount = await this.prismaService.organizationMember.count({
        where: {
          organizationId: member.organizationId,
          role: OrganizationRole.OWNER,
        },
      });

      if (ownersCount === 1) {
        throw new BadRequestException('The only OWNER cannot be removed');
      }
    }

    return this.prismaService.organizationMember.delete({
      where: {
        id: memberId,
      },
    });
  }

  async updateOrganizationMember(
    memberId: string,
    dto: UpdateOrganizationMemberDto,
  ) {
    const member = await this.getMemberOrThrow(memberId);

    if (dto.role === OrganizationRole.OWNER) {
      throw new BadRequestException('OWNER role cannot be assigned directly');
    }

    if (member.role === OrganizationRole.OWNER) {
      const ownersCount = await this.prismaService.organizationMember.count({
        where: {
          organizationId: member.organizationId,
          role: OrganizationRole.OWNER,
        },
      });

      if (ownersCount === 1) {
        throw new BadRequestException('The only OWNER cannot be downgraded');
      }
    }
    return this.prismaService.organizationMember.update({
      where: {
        id: memberId,
      },
      data: {
        role: dto.role,
      },
    });
  }
}
