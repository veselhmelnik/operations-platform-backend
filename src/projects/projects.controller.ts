import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { RequirePermission } from 'src/authorization/require-permission.decorator';
import { CreateProjectDto } from 'src/organizations/dto/create-project.dto';

@Controller('/organizations/:organizationId/projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}

  @Get(':projectId/board')
  @RequirePermission('task.read')
  getBoard(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.projectService.getProjectBoard(organizationId, projectId);
  }

  @Get()
  @RequirePermission('project.read')
  getAllProjects(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.projectService.getAllProjects(organizationId);
  }

  @Post()
  @RequirePermission('project.create')
  create(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectService.createProject(organizationId, dto);
  }
}
