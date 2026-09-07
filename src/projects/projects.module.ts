import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ActivityModule } from 'src/activity/activity.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
  imports: [ActivityModule, SubscriptionModule],
  providers: [ProjectsService],
  exports: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
