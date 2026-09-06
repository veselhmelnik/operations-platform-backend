import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { RequirePermission } from 'src/authorization/require-permission.decorator';
import { AddOrganizationMemberDto } from './dto/add-member.dto';
import { MembersService } from './members.service';
import { UpdateOrganizationMemberDto } from './dto/update-member.dto';

@Controller('organizations/:organizationId/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @RequirePermission('member.add')
  @Post('')
  addMember(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Body() dto: AddOrganizationMemberDto,
  ) {
    return this.membersService.addMemberToOrganization(dto, organizationId);
  }

  @RequirePermission('member.read')
  @Get('')
  findAllMembers(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
  ) {
    return this.membersService.getOrganizationMembers(organizationId);
  }

  @RequirePermission('member.remove')
  @Delete(':memberId')
  deleteMember(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Param('memberId', new ParseUUIDPipe()) memberId: string,
  ) {
    return this.membersService.deleteOrganizationMember(memberId);
  }

  @RequirePermission('member.role.update')
  @Patch(':memberId')
  updateMember(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Param('memberId', new ParseUUIDPipe()) memberId: string,
    @Body() dto: UpdateOrganizationMemberDto,
  ) {
    return this.membersService.updateOrganizationMember(memberId, dto);
  }
}
