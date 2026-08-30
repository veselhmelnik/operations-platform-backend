import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @ApiProperty()
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty()
  name!: string;

  @IsString()
  @MinLength(8)
  @ApiProperty()
  password!: string;
}
