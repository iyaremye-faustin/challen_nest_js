import * as crypto from 'node:crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { config as configuration } from '../config';
import { RedisService } from './redis';
import { RedisKeys } from '../constants/redisKeys';
import {
  type CountryAddress,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_RESEND_MAX_ATTEMPTS,
  OTP_RESEND_WINDOW_SECONDS,
} from '../constants/general';
import { type AuthUser } from '../types/common.types';

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  address?: CountryAddress | null;
  account_verified: boolean;
  role_id: string | null;
}

export interface ITokenGenerationResponse {
  success: boolean;
  token?: string;
}

export interface IVerifyUserTokenResponse {
  success: boolean;
  data?: { userId: string; expires?: number };
}

export interface IOtpPayload {
  otp: string;
  userId: string;
  email: string;
  password: string;
}

@Injectable()
export class UserHelper {
  private readonly config = configuration();

  constructor(private readonly redisService: RedisService) {}

  public generateAccessToken = (userId: string): ITokenGenerationResponse => {
    try {
      const secretKey = this.config.jwt.secretKey;
      if (!secretKey) throw new Error('Secret key not configured');

      const token = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
      return { success: true, token };
    } catch {
      return { success: false };
    }
  };

  public generateRefreshToken = (
    userId: string,
  ): Promise<ITokenGenerationResponse> => {
    try {
      const secretKey = this.config.jwt.secretKey;
      if (!secretKey) throw new Error('Secret key not configured');

      const token = jwt.sign({ userId }, secretKey, { expiresIn: '30 days' });
      return Promise.resolve({ success: true, token });
    } catch {
      return Promise.resolve({ success: false });
    }
  };

  public generateGeneralAccessToken = (
    userId: string,
  ): ITokenGenerationResponse => {
    try {
      const secretKey = this.config.jwt.secretKey;
      if (!secretKey) throw new Error('Secret key not configured');

      const token = jwt.sign({ userId }, secretKey, { expiresIn: '2h' });
      return { success: true, token };
    } catch {
      return { success: false };
    }
  };

  public verifyToken = (token: string): IVerifyUserTokenResponse => {
    try {
      const secretKey = this.config.jwt.secretKey;
      if (!secretKey) throw new Error('Secret key not configured');

      const decoded = jwt.verify(token, secretKey) as JwtPayload;

      return {
        success: true,
        data: {
          userId: decoded.userId,
          expires: decoded.exp,
        },
      };
    } catch {
      return { success: false };
    }
  };

  public setAuthToken = (user: IUser) => {
    try {
      const access = this.generateAccessToken(user.id);
      if (!access.success) {
        return { success: false };
      }

      return {
        success: true,
        data: {
          access_token: access.token,
          user: user,
        },
      };
    } catch {
      return { success: false };
    }
  };

  public setAuthUserInRedis = async (user: IUser) => {
    try {
      const payload = JSON.stringify(user);

      const userKey = this.getAuthUserKey(String(user.id));

      const time = 60 * 60;

      await this.redisService.set(userKey, payload, time);
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  public getAuthUserInRedis = async (
    userId: string,
  ): Promise<{ success: boolean; user?: AuthUser }> => {
    try {
      const userKey = this.getAuthUserKey(userId);

      const get = await this.redisService.get(userKey);

      if (!get) {
        return { success: false };
      }

      const user = JSON.parse(get);

      return { success: true, user };
    } catch {
      return { success: false };
    }
  };
  public getAuthUserKey = (userId: string): string => {
    const userKey = RedisKeys.AuthUser + ':' + userId;

    return userKey;
  };

  public generateOtp = (): string => {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return String(buffer[0] % 1000000).padStart(6, '0');
  };

  public setUserOtpInRedis = async (
    userId: string,
    otp: string,
    email: string,
    password: string,
    expirySec = 300,
  ): Promise<{ success: boolean }> => {
    try {
      const otpKey = this.getUserOtpKey(userId);
      const payload: IOtpPayload = { otp, userId, email, password };
      await this.redisService.set(otpKey, JSON.stringify(payload), expirySec);
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  public getUserOtpFromRedis = async (
    userId: string,
  ): Promise<{ success: boolean; payload?: IOtpPayload }> => {
    try {
      const otpKey = this.getUserOtpKey(userId);
      const payloadString = await this.redisService.get(otpKey);
      if (!payloadString) {
        return { success: false };
      }
      const payload = JSON.parse(payloadString) as IOtpPayload;
      return { success: true, payload };
    } catch {
      return { success: false };
    }
  };

  public getUserOtpKey = (userId: string): string => {
    return `${RedisKeys.UserOtp}:${userId}`;
  };

  public getUsedPasswordResetTokenKey = (token: string): string => {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    return `${RedisKeys.UsedPasswordResetToken}:${tokenHash}`;
  };

  public markPasswordResetTokenAsUsed = async (
    token: string,
    expiresAt?: number,
  ): Promise<void> => {
    const key = this.getUsedPasswordResetTokenKey(token);
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const ttl =
      expiresAt && expiresAt > nowInSeconds ? expiresAt - nowInSeconds : 7200;

    await this.redisService.set(key, '1', ttl);
  };

  public isPasswordResetTokenUsed = async (token: string): Promise<boolean> => {
    const key = this.getUsedPasswordResetTokenKey(token);
    const value = await this.redisService.get(key);
    return value !== null;
  };

  public getOtpResendCooldownKey = (userId: string): string => {
    return `${RedisKeys.OtpResendCooldown}:${userId}`;
  };

  public getOtpResendCountKey = (userId: string): string => {
    return `${RedisKeys.OtpResendCount}:${userId}`;
  };

  public checkOtpResendAllowed = async (
    userId: string,
  ): Promise<{
    allowed: boolean;
    message?: string;
    retryAfterSec?: number;
  }> => {
    try {
      const cooldownKey = this.getOtpResendCooldownKey(userId);
      const cooldownTtl = await this.redisService.ttl(cooldownKey);
      if (cooldownTtl > 0) {
        return {
          allowed: false,
          message: `Please wait ${cooldownTtl}s before requesting another OTP`,
          retryAfterSec: cooldownTtl,
        };
      }

      const countKey = this.getOtpResendCountKey(userId);
      const attempts = await this.redisService.incr(countKey);
      if (attempts === 1) {
        await this.redisService.expire(countKey, OTP_RESEND_WINDOW_SECONDS);
      }

      if (attempts > OTP_RESEND_MAX_ATTEMPTS) {
        const windowTtl = await this.redisService.ttl(countKey);
        return {
          allowed: false,
          message:
            'Maximum OTP resend attempts reached, please try again later',
          retryAfterSec: windowTtl > 0 ? windowTtl : OTP_RESEND_WINDOW_SECONDS,
        };
      }

      await this.redisService.set(
        cooldownKey,
        '1',
        OTP_RESEND_COOLDOWN_SECONDS,
      );

      return { allowed: true };
    } catch {
      return { allowed: false, message: 'Failed to process OTP resend' };
    }
  };
}
