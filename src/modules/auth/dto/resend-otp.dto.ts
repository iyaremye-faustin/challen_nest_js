import { IsString, IsNotEmpty } from 'class-validator';

export class ResendOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'User id is required' })
  userId: string;
}
