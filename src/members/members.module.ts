import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [AuthModule, AuthorizationModule, ActivityModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
