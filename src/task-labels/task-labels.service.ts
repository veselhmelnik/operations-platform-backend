import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTaskLabelDto } from './dto/update-task-label.dto';
import { CreateTaskLabelDto } from './dto/create-task-label.dto';

@Injectable()
export class TaskLabelsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(organizationId: string) {
    return this.prisma.taskLabel.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  create(organizationId: string, dto: CreateTaskLabelDto) {
    return this.prisma.taskLabel.create({
      data: {
        organizationId,
        name: dto.name,
        color: dto.color,
      },
    });
  }

  async update(
    organizationId: string,
    labelId: string,
    dto: UpdateTaskLabelDto,
  ) {
    await this.getLabelOrThrow(organizationId, labelId);

    return this.prisma.taskLabel.update({
      where: {
        id: labelId,
      },
      data: dto,
    });
  }

  async delete(organizationId: string, labelId: string) {
    await this.getLabelOrThrow(organizationId, labelId);

    return this.prisma.taskLabel.delete({
      where: {
        id: labelId,
      },
    });
  }

  private async getLabelOrThrow(organizationId: string, labelId: string) {
    const label = await this.prisma.taskLabel.findFirst({
      where: {
        id: labelId,
        organizationId,
      },
    });

    if (!label) {
      throw new NotFoundException('Task label not found');
    }

    return label;
  }
}
