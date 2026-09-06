import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from 'src/generated/prisma/enums';
import { CreateProjectDto } from 'src/projects/dto/create-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getProjectOrThrow(organizationId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }
  async createProject(organizationId: string, dto: CreateProjectDto) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return await this.prisma.project.create({
      data: {
        name: dto.name,
        organizationId,
        description: dto.description,
      },
    });
  }

  getAllProjects(organizationId: string) {
    return this.prisma.project.findMany({
      where: {
        organizationId,
      },
    });
  }

  async getSingleProject(organizationId: string, projectId: string) {
    return this.getProjectOrThrow(organizationId, projectId);
  }

  async getProjectBoard(organizationId: string, projectId: string) {
    await this.getProjectOrThrow(organizationId, projectId);
    const tasks = await this.prisma.task.findMany({
      where: {
        projectId,
      },
      orderBy: {
        position: 'asc',
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
    const board: Record<TaskStatus, typeof tasks> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.REVIEW]: [],
      [TaskStatus.DONE]: [],
    };
    for (const task of tasks) {
      board[task.status].push(task);
    }
    return board;
  }
}
