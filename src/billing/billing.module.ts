import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import {
  BillingController,
  BillingWebhookController,
} from './billing.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';

@Module({
  imports: [AuthModule, AuthorizationModule],
  providers: [BillingService],
  controllers: [BillingController, BillingWebhookController],
  exports: [BillingService],
})
export class BillingModule {}
