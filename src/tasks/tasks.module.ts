import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { TasksService } from './tasks.service';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [AuthModule, AuthorizationModule, ActivityModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
