import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskStatus } from 'src/generated/prisma/enums';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @ApiPropertyOptional()
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @ApiPropertyOptional({
    type: String,
    nullable: true,
  })
  description?: string | null;

  @IsOptional()
  @IsEnum(TaskStatus)
  @ApiPropertyOptional({
    enum: TaskStatus,
  })
  status?: TaskStatus;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    type: String,
    nullable: true,
  })
  assigneeId?: string | null;
}
