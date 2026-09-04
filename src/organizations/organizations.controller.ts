import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from 'src/organizations/dto/create-organization.dto';
import { AddOrganizationMemberDto } from 'src/organizations/dto/add-organization-member.dto';
import { RequirePermission } from 'src/authorization/require-permission.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionGuard } from 'src/authorization/permission.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from 'src/projects/projects.service';
import { Request } from 'express';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly projectService: ProjectsService,
  ) {}

  // @Get()
  // findAll() {
  //   return this.organizationsService.getAllOrganizations();
  // }

  @Get()
  getAll(@Req() request: Request) {
    return this.organizationsService.getUserOrganizations(request['user'].id);
  }

  @Get(':organizationId')
  findOne(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
  ) {
    return this.organizationsService.getSingleOrganization(organizationId);
  }

  @Post()
  create(@Req() request: Request, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.createOneOrganization(
      request['user'].id,
      dto,
    );
  }

  @RequirePermission('member.add')
  @Post(':organizationId/members')
  addMember(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Body() dto: AddOrganizationMemberDto,
  ) {
    return this.organizationsService.addMemberToOrganization(
      dto,
      organizationId,
    );
  }

  @RequirePermission('project.create')
  @Post(':organizationId/projects')
  createProject(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectService.createProject(organizationId, dto);
  }

  @RequirePermission('project.read')
  @Get(':organizationId/projects/:projectId')
  findOneProject(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ) {
    return this.projectService.getSingleProject(organizationId, projectId);
  }

  @RequirePermission('project.read')
  @Get(':organizationId/projects')
  findAllProjects(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
  ) {
    return this.projectService.getAllProjects(organizationId);
  }
}
