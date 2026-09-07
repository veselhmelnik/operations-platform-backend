import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionGuard } from 'src/authorization/permission.guard';
import { RequirePermission } from 'src/authorization/require-permission.decorator';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('organizations/:organizationId/activity')
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @RequirePermission('activity.read')
  @Get()
  getAll(@Param('organizationId', new ParseUUIDPipe()) organizationId: string) {
    return this.activity.getAll(organizationId);
  }
}
