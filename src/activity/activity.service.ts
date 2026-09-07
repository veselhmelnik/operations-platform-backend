import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateActivityInput } from './types/create-activity-input';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateActivityInput) {
    return this.prisma.activity.create({
      data: input,
    });
  }

  getAll(organizationId: string) {
    return this.prisma.activity.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
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
}
