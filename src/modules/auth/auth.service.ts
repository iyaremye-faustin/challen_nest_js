import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  CreateAuthDto,
  VerifyAccountDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/create-auth.dto';
import { UserRepository } from '../users/user.repository';
import { UtilityService } from '../utility/utility.service';
import { UserHelper } from '../../helpers/userHelper';
import { RoleRepository } from '../roles/role.repository';
import {
  USER_STATUS,
  CountryAddress,
  OTP_EXPIRY_SECONDS,
} from '../../constants/general';
import { EmailHelper } from '../../helpers/emailHelper';
import { RedisService } from '../../helpers/redis';
import { logger } from '../../helpers/logger';
import { UserTokenRepository } from './user-token.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly utilityService: UtilityService,
    private readonly userHelper: UserHelper,
    private readonly roleRepository: RoleRepository,
    private readonly emailHelper: EmailHelper,
    private readonly redisService: RedisService,
    private readonly userTokenRepository: UserTokenRepository,
  ) {}

  async login(createAuthDto: CreateAuthDto): Promise<{
    success: boolean;
    message?: string;
    data?: { userId: string };
    status?: number;
  }> {
    try {
      const user = await this.userRepository.findByEmail(createAuthDto.email);
      if (!user) {
        throw new HttpException(
          { success: false, message: 'Invalid email or password' },
          HttpStatus.UNAUTHORIZED,
        );
      }
      const isPasswordValid = this.utilityService.passwordCompare(
        createAuthDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new HttpException(
          { success: false, message: 'Invalid email or password' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (user.status !== USER_STATUS.ACTIVE) {
        throw new HttpException(
          { success: false, message: 'No active account found for this user' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const otp = this.userHelper.generateOtp();
      const otpResult = await this.userHelper.setUserOtpInRedis(
        user.id,
        otp,
        user.email,
        createAuthDto.password,
        OTP_EXPIRY_SECONDS,
      );

      if (!otpResult.success) {
        throw new HttpException(
          { success: false, message: 'Failed to send OTP' },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.emailHelper.sendOtpEmail({
        to: user.email,
        name: user.name,
        otp,
      });

      return {
        success: true,
        data: { userId: user.id },
        message: 'OTP sent successfully',
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        { success: false, message: 'Login failed' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resendOtp(userId: string): Promise<{
    success: boolean;
    message?: string;
    data?: { userId: string };
    retryAfterSec?: number;
    status?: number;
  }> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new HttpException(
          { success: false, message: 'Invalid user' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const existingOtp = await this.userHelper.getUserOtpFromRedis(userId);
      if (!existingOtp.success || !existingOtp.payload) {
        throw new HttpException(
          {
            success: false,
            message:
              'Your login has been expired. Please login again to receive a new OTP',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const resendCheck = await this.userHelper.checkOtpResendAllowed(userId);
      if (!resendCheck.allowed) {
        throw new HttpException(
          {
            success: false,
            message:
              resendCheck.message ??
              'Please wait before requesting another OTP',
            retryAfterSec: resendCheck.retryAfterSec,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      const otp = this.userHelper.generateOtp();
      const otpResult = await this.userHelper.setUserOtpInRedis(
        userId,
        otp,
        existingOtp.payload.email,
        existingOtp.payload.password,
        OTP_EXPIRY_SECONDS,
      );

      if (!otpResult.success) {
        throw new HttpException(
          { success: false, message: 'Failed to resend OTP' },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.emailHelper.sendOtpEmail({
        to: existingOtp.payload.email,
        name: user.name,
        otp,
      });

      return {
        success: true,
        data: { userId },
        message: 'OTP resent successfully',
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        { success: false, message: 'Failed to resend OTP' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyOtp(
    userId: string,
    otp: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    email: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    password: string,
  ): Promise<{
    success: boolean;
    data?: {
      access_token?: string;
      refresh_token?: string;
      user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        status?: string;
        address?: CountryAddress | null;
        account_verified: boolean;
        role: {
          id: string;
          name: string;
          privileges: string[];
        };
      };
    };
    message?: string;
    status?: number;
  }> {
    try {
      const otpResult = await this.userHelper.getUserOtpFromRedis(userId);
      if (!otpResult.success || otpResult.payload?.otp !== otp) {
        throw new HttpException(
          { success: false, message: 'Invalid or expired OTP' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const otpKey = this.userHelper.getUserOtpKey(
        otpResult.payload?.userId ?? userId,
      );
      await this.redisService.del(otpKey);

      const user = await this.userRepository.findById(
        otpResult.payload?.userId ?? userId,
      );
      if (!user) {
        throw new HttpException(
          { success: false, message: 'User not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.status !== USER_STATUS.ACTIVE) {
        throw new HttpException(
          { success: false, message: 'No active account found for this user' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const userWithoutPassword = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        address: user.address,
        account_verified: user.account_verified,
      };

      const tokenResponse = this.userHelper.generateAccessToken(user.id);
      if (!tokenResponse.success) {
        throw new HttpException(
          { success: false, message: 'Failed to generate access token' },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const refreshTokenResponse = await this.userHelper.generateRefreshToken(
        user.id,
      );
      if (!refreshTokenResponse.success) {
        throw new HttpException(
          { success: false, message: 'Failed to generate refresh token' },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.userTokenRepository.deleteByUserId(user.id);
      await this.userTokenRepository.create({
        user_id: user.id,
        access_token: refreshTokenResponse.token,
      });

      const role = user.role_id
        ? await this.roleRepository.findByIdWithPrivileges(user.role_id)
        : null;
      const privilegeNames = role?.privileges?.map((p) => p.privilege) ?? [];

      const userPayload = {
        ...userWithoutPassword,
        role_id: user.role_id ?? null,
        priviles: privilegeNames,
      };

      await this.userHelper.setAuthUserInRedis(userPayload);

      return {
        success: true,
        data: {
          access_token: tokenResponse.token,
          refresh_token: refreshTokenResponse.token,
          user: {
            ...userWithoutPassword,
            role: {
              id: role?.id ?? '',
              name: role?.name ?? '',
              privileges: privilegeNames,
            },
          },
        },
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        { success: false, message: 'OTP verification failed' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyAccount(verifyAccountDto: VerifyAccountDto, token: string) {
    try {
      const tokenResult = this.userHelper.verifyToken(token);
      if (!tokenResult.success || !tokenResult.data) {
        throw new HttpException(
          { success: false, message: 'Invalid or expired verification token' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const { userId } = tokenResult.data;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'Invalid token data' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new HttpException(
          { success: false, message: 'User not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.account_verified) {
        throw new HttpException(
          { success: false, message: 'Account is already verified' },
          HttpStatus.CONFLICT,
        );
      }

      const salt = this.utilityService.passwordSalt();
      const hashedPassword = this.utilityService.passwordHash(
        verifyAccountDto.password,
        salt,
      );

      await this.userRepository.update(userId, {
        account_verified: true,
        password: hashedPassword,
        status: USER_STATUS.ACTIVE,
      });

      this.emailHelper
        .sendAccountVerifiedEmail({ to: user.email, name: user.name })
        .catch((error) => {
          logger.error(
            { error, userId },
            'Failed to send account verified email (non-blocking)',
          );
        });

      return { success: true, message: 'Account verified successfully' };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        { success: false, message: 'Failed to verify account' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.userRepository.findByEmail(
        forgotPasswordDto.email,
      );
      if (!user) {
        throw new HttpException(
          {
            success: false,
            message: 'Account with this email does not exist!',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (!user.account_verified) {
        throw new HttpException(
          { success: false, message: 'Account is not verified' },
          HttpStatus.FORBIDDEN,
        );
      }

      await this.emailHelper.sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        userId: user.id,
      });

      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        { success: false, message: 'Failed to process password reset request' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, token: string) {
    try {
      const tokenResult = this.userHelper.verifyToken(token);
      if (!tokenResult.success || !tokenResult.data) {
        throw new HttpException(
          { success: false, message: 'Invalid or expired reset token' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const { userId, expires } = tokenResult.data;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'Invalid token data' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const tokenAlreadyUsed =
        await this.userHelper.isPasswordResetTokenUsed(token);
      if (tokenAlreadyUsed) {
        throw new HttpException(
          { success: false, message: 'This reset link has already been used' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new HttpException(
          { success: false, message: 'User not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      const salt = this.utilityService.passwordSalt();
      const hashedPassword = this.utilityService.passwordHash(
        resetPasswordDto.password,
        salt,
      );

      await this.userRepository.update(userId, {
        password: hashedPassword,
        salt,
      });

      await this.userHelper.markPasswordResetTokenAsUsed(token, expires);

      return { success: true, message: 'Password reset successfully' };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        { success: false, message: 'Failed to reset password' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refreshToken(token: string): Promise<{
    success: boolean;
    data: {
      access_token: string | undefined;
      user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        status: string;
        account_verified: boolean;
        role: { id: string; name: string; privileges: string[] };
      };
    };
  }> {
    try {
      const tokenResult = this.userHelper.verifyToken(token);
      if (!tokenResult.success || !tokenResult.data) {
        throw new HttpException(
          { success: false, message: 'Invalid or expired refresh token' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const storedToken = await this.userTokenRepository.findOne({
        access_token: token,
      });
      if (!storedToken) {
        throw new HttpException(
          { success: false, message: 'Refresh token not recognised' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.userRepository.findById(tokenResult.data.userId);
      if (!user) {
        throw new HttpException(
          { success: false, message: 'User not found' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (user.status !== USER_STATUS.ACTIVE) {
        throw new HttpException(
          { success: false, message: 'No active account found for this user' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const tokenResponse = this.userHelper.generateAccessToken(user.id);
      if (!tokenResponse.success) {
        throw new HttpException(
          { success: false, message: 'Failed to generate access token' },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const role = user.role_id
        ? await this.roleRepository.findByIdWithPrivileges(user.role_id)
        : null;
      const privilegeNames = role?.privileges?.map((p) => p.privilege) ?? [];

      const userWithoutPassword = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        address: user.address,
        account_verified: user.account_verified,
      };

      const userPayload = {
        ...userWithoutPassword,
        role_id: user.role_id ?? null,
        priviles: privilegeNames,
      };

      await this.userHelper.setAuthUserInRedis(userPayload);

      return {
        success: true,
        data: {
          access_token: tokenResponse.token,
          user: {
            ...userWithoutPassword,
            role: {
              id: role?.id ?? '',
              name: role?.name ?? '',
              privileges: privilegeNames,
            },
          },
        },
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        { success: false, message: 'Failed to refresh token' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
