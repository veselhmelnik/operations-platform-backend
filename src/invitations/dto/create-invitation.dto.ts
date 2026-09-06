import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { OrganizationRole } from 'src/generated/prisma/enums';

export class CreateInvitationDto {
  @IsEmail()
  @ApiProperty()
  email!: string;

  @IsEnum(OrganizationRole)
  @ApiProperty()
  role!: OrganizationRole;
}
