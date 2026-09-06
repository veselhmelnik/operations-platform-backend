import { IsEnum } from 'class-validator';
import { OrganizationRole } from 'src/generated/prisma/enums';

export class UpdateOrganizationMemberDto {
  @IsEnum(OrganizationRole)
  role!: OrganizationRole;
}
