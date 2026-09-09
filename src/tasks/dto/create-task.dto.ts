import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskPriority } from 'src/generated/prisma/enums';

export class CreateTaskDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @ApiProperty()
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    type: String,
    nullable: true,
  })
  assigneeId?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  @ApiPropertyOptional({
    enum: TaskPriority,
  })
  priority?: TaskPriority;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  labelIds?: string[];
}
