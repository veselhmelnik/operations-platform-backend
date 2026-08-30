import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Min } from 'class-validator';
import { TaskStatus } from 'src/generated/prisma/enums';

export class MoveTaskDto {
  @IsEnum(TaskStatus)
  @ApiProperty()
  status!: TaskStatus;

  @IsInt()
  @Min(0)
  @ApiProperty()
  position!: number;
}
