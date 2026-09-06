import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from 'src/generated/prisma/enums';
import { MoveTaskDto } from './dto/move-task.dto';
import { ActivityService } from 'src/activity/activity.service';
import {
  ActivityActions,
  ActivityEntityType,
} from 'src/activity/activityActions';

@Injectable()
export class TasksService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  private async getProjectOrThrow(organizationId: string, projectId: string) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
      select: {
        id: true,
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }
  private async getTaskOrThrow(
    organizationId: string,
    projectId: string,
    taskId: string,
  ) {
    const task = await this.prismaService.task.findFirst({
      where: {
        id: taskId,
        projectId,
        project: {
          organizationId,
        },
      },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }
  private async ensureAssigneeIsOrganizationMember(
    organizationId: string,
    assigneeId: string,
  ) {
    const membership = await this.prismaService.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: assigneeId,
          organizationId,
        },
      },
      select: {
        id: true,
      },
    });
    if (!membership)
      throw new NotFoundException(
        'Assignee is not a member of this organization',
      );
  }

  async getAllTasks(organizationId: string, projectId: string) {
    await this.getProjectOrThrow(organizationId, projectId);

    return this.prismaService.task.findMany({
      where: {
        projectId,
      },
      orderBy: [
        {
          status: 'asc',
        },
        {
          position: 'asc',
        },
      ],
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
  async getOneTask(organizationId: string, projectId: string, taskId: string) {
    const task = await this.prismaService.task.findFirst({
      where: {
        id: taskId,
        projectId,
        project: {
          organizationId,
        },
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async addNewTask(
    userId: string,
    organizationId: string,
    projectId: string,
    dto: CreateTaskDto,
  ) {
    await this.getProjectOrThrow(organizationId, projectId);
    if (dto.assigneeId) {
      await this.ensureAssigneeIsOrganizationMember(
        organizationId,
        dto.assigneeId,
      );
    }
    const lastTask = await this.prismaService.task.findFirst({
      where: {
        projectId,
        status: TaskStatus.TODO,
      },
      orderBy: {
        position: 'desc',
      },
      select: {
        position: true,
      },
    });
    const position = lastTask ? lastTask.position + 1 : 0;
    const task = await this.prismaService.task.create({
      data: {
        title: dto.title,
        projectId,
        assigneeId: dto.assigneeId,
        description: dto.description,
        position,
      },
    });

    await this.activityService.create({
      organizationId,
      userId,
      action: ActivityActions.TASK_CREATED,
      entityType: ActivityEntityType.TASK,
      entityId: task.id,
    });
    return task;
  }

  async updateTask(
    organizationId: string,
    projectId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ) {
    await this.getTaskOrThrow(organizationId, projectId, taskId);
    if (dto.assigneeId) {
      await this.ensureAssigneeIsOrganizationMember(
        organizationId,
        dto.assigneeId,
      );
    }
    return this.prismaService.task.update({
      where: {
        id: taskId,
      },
      data: {
        title: dto.title,
        description: dto.description,
        assigneeId: dto.assigneeId,
        status: dto.status,
      },
    });
  }

  async moveTask(
    organizationId: string,
    projectId: string,
    taskId: string,
    dto: MoveTaskDto,
  ) {
    const task = await this.getTaskOrThrow(organizationId, projectId, taskId);

    const oldStatus = task.status;
    const oldPosition = task.position;
    const newStatus = dto.status;
    const newPosition = dto.position;

    if (oldStatus === newStatus && oldPosition === newPosition) {
      return task;
    }

    return this.prismaService.$transaction(async (tx) => {
      if (oldStatus === newStatus) {
        if (newPosition < oldPosition) {
          await tx.task.updateMany({
            where: {
              projectId,
              status: oldStatus,
              position: {
                gte: newPosition,
                lt: oldPosition,
              },
            },
            data: {
              position: {
                increment: 1,
              },
            },
          });
        } else {
          await tx.task.updateMany({
            where: {
              projectId,
              status: oldStatus,
              position: {
                gt: oldPosition,
                lte: newPosition,
              },
            },
            data: {
              position: {
                decrement: 1,
              },
            },
          });
        }
      } else {
        await tx.task.updateMany({
          where: {
            projectId,
            status: oldStatus,
            position: {
              gt: oldPosition,
            },
          },
          data: {
            position: {
              decrement: 1,
            },
          },
        });

        await tx.task.updateMany({
          where: {
            projectId,
            status: newStatus,
            position: {
              gte: newPosition,
            },
          },
          data: {
            position: {
              increment: 1,
            },
          },
        });
      }
      return tx.task.update({
        where: {
          id: taskId,
        },
        data: {
          status: newStatus,
          position: newPosition,
        },
      });
    });
  }
  async deleteTask(organizationId: string, projectId: string, taskId: string) {
    const task = await this.getTaskOrThrow(organizationId, projectId, taskId);
    return this.prismaService.$transaction(async (tx) => {
      await tx.task.delete({
        where: {
          id: taskId,
        },
      });
      await tx.task.updateMany({
        where: {
          projectId,
          status: task.status,
          position: {
            gt: task.position,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });
      return { message: 'Task deleted successfully' };
    });
  }
}
