import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
  Body,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from 'src/invitations/dto/create-invitation.dto';
import { RequirePermission } from 'src/authorization/require-permission.decorator';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get(':token')
  getInvitation(@Param('token') token: string) {
    return this.invitationsService.getInvitationByToken(token);
  }

  @UseGuards(AuthGuard)
  @Post(':token/accept')
  acceptInvitation(@Param('token') token: string, @Req() request: Request) {
    return this.invitationsService.acceptInvitation(token, request['user'].id);
  }

  @RequirePermission('member.add')
  @Post(':organizationId/invitations')
  createInvitation(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Body() dto: CreateInvitationDto,
    @Req() request: Request,
  ) {
    return this.invitationsService.createInvitation(
      organizationId,
      dto,
      request['user'].id,
    );
  }
}
