import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { OrganizationRole } from 'src/generated/prisma/enums';

export class AddOrganizationMemberDto {
  @IsUUID()
  @ApiProperty()
  userId!: string;

  @IsEnum(OrganizationRole)
  @ApiProperty()
  role!: OrganizationRole;
}
