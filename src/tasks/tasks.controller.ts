import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionGuard } from 'src/authorization/permission.guard';
import { TasksService } from './tasks.service';
import { RequirePermission } from 'src/authorization/require-permission.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('organizations/:organizationId/projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Get()
  @RequirePermission('task.read')
  getAll(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ) {
    return this.taskService.getAllTasks(organizationId, projectId);
  }
  @Get(':taskId')
  @RequirePermission('task.read')
  getOne(
    @Param('organizationId', ParseUUIDPipe) organitionId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return this.taskService.getOneTask(organitionId, projectId, taskId);
  }

  @Post()
  @RequirePermission('task.create')
  create(
    @Req() request: Request,
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.taskService.addNewTask(
      request['user'].id,
      organizationId,
      projectId,
      dto,
    );
  }

  @Patch(':taskId')
  @RequirePermission('task.update')
  update(
    @Param('organizationId', ParseUUIDPipe) organitionId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(organitionId, projectId, taskId, dto);
  }

  @Patch(':taskId/move')
  @RequirePermission('task.update')
  move(
    @Param('organizationId', ParseUUIDPipe) organitionId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.taskService.moveTask(organitionId, projectId, taskId, dto);
  }

  @Delete(':taskId')
  @RequirePermission('task.delete')
  delete(
    @Param('organizationId', ParseUUIDPipe) organitionId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return this.taskService.deleteTask(organitionId, projectId, taskId);
  }
}
