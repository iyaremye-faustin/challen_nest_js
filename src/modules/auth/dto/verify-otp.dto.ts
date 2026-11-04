import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
