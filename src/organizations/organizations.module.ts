import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [AuthModule, AuthorizationModule, ProjectsModule, ActivityModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
})
export class OrganizationsModule {}
