import { Module } from '@nestjs/common';
import { TaskLabelsService } from './task-labels.service';
import { TaskLabelsController } from './task-labels.controller';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule, AuthorizationModule],
  providers: [TaskLabelsService],
  controllers: [TaskLabelsController],
})
export class TaskLabelsModule {}
