import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty()
  name!: string;

  @IsUUID()
  @ApiProperty()
  ownerId!: string;
}
