import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateAuthDto,
  VerifyAccountDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/create-auth.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { Public } from '../../common/guards/permission-guard/require-permissions.decorator';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.login(createAuthDto);
  }

  @Public()
  @Post('verify-account/:token')
  @HttpCode(HttpStatus.OK)
  verifyAccount(
    @Param('token') token: string,
    @Body() verifyAccountDto: VerifyAccountDto,
  ) {
    return this.authService.verifyAccount(verifyAccountDto, token);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('forgot-password/:token')
  @HttpCode(HttpStatus.OK)
  confirmForgotPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(resetPasswordDto, token);
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  otpVerify(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(
      verifyOtpDto.userId,
      verifyOtpDto.otp,
      verifyOtpDto.email,
      verifyOtpDto.password,
    );
  }

  @Public()
  @Post('otp/resend')
  @HttpCode(HttpStatus.OK)
  otpResend(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto.userId);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    schema: {
      properties: { refresh_token: { type: 'string' } },
      required: ['refresh_token'],
    },
  })
  refreshToken(@Body('refresh_token') token: string) {
    return this.authService.refreshToken(token);
  }
}
