import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendActivationEmailDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
