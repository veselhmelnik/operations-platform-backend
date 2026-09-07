import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionGuard } from 'src/authorization/permission.guard';
import { RequirePermission } from 'src/authorization/require-permission.decorator';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('organizations/:organizationId/subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @RequirePermission('subscription.read')
  @Get()
  getSubscription(
    @Param('organizationId', ParseUUIDPipe)
    organizationId: string,
  ) {
    return this.subscriptionService.getSubscriptionSummary(organizationId);
  }
}
