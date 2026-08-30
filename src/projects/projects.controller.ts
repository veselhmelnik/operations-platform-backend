import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { RequirePermission } from 'src/authorization/require-permission.decorator';

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
}
