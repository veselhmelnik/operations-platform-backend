import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TaskLabelsService } from './task-labels.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionGuard } from 'src/authorization/permission.guard';
import { CreateTaskLabelDto } from './dto/create-task-label.dto';
import { UpdateTaskLabelDto } from './dto/update-task-label.dto';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('/organizations/:organizationId/labels')
export class TaskLabelsController {
  constructor(private readonly taskLabelsService: TaskLabelsService) {}

  @Get()
  getAll(@Param('organizationId', new ParseUUIDPipe()) organizationId: string) {
    return this.taskLabelsService.getAll(organizationId);
  }

  @Post()
  create(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Body() dto: CreateTaskLabelDto,
  ) {
    return this.taskLabelsService.create(organizationId, dto);
  }

  @Patch(':labelId')
  update(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Param('labelId', new ParseUUIDPipe()) labelId: string,
    @Body() dto: UpdateTaskLabelDto,
  ) {
    return this.taskLabelsService.update(organizationId, labelId, dto);
  }

  @Delete(':labelId')
  delete(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Param('labelId', new ParseUUIDPipe()) labelId: string,
  ) {
    return this.taskLabelsService.delete(organizationId, labelId);
  }
}
