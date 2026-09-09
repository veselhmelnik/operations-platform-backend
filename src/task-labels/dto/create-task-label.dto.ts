import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTaskLabelDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name!: string;

  @IsString()
  color!: string;
}
