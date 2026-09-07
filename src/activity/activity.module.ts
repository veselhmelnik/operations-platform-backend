import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';

@Module({
  imports: [AuthModule, AuthorizationModule],
  providers: [ActivityService],
  controllers: [ActivityController],
  exports: [ActivityService],
})
export class ActivityModule {}
