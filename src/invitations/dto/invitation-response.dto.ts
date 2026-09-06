import { ApiProperty } from '@nestjs/swagger';
import { OrganizationRole } from 'src/generated/prisma/enums';

class InvitationOrganizationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class InvitationResponseDto {
  @ApiProperty({
    type: InvitationOrganizationDto,
  })
  organization!: InvitationOrganizationDto;

  @ApiProperty()
  email!: string;

  @ApiProperty({
    enum: OrganizationRole,
  })
  role!: OrganizationRole;

  @ApiProperty()
  expiresAt!: Date;

  @ApiProperty()
  accepted!: boolean;
}
