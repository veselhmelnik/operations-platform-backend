import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { ActivityModule } from 'src/activity/activity.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
  imports: [
    AuthModule,
    AuthorizationModule,
    ActivityModule,
    SubscriptionModule,
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
