import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  @ApiProperty()
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional()
  description?: string;
}
