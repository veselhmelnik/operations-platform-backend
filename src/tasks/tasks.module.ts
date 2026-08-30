import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [AuthModule, AuthorizationModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
