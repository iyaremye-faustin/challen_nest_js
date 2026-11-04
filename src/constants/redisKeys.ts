export const RedisPrefix = 'challenge:';

export const RedisKeys = {
  AuthUser: `${RedisPrefix}AuthUser`,
  UserOtp: `${RedisPrefix}UserOtp`,

  UserLoginAttempt: `${RedisPrefix}UserLoginAttempt`,
  OtpResendCooldown: `${RedisPrefix}OtpResendCooldown`,
  OtpResendCount: `${RedisPrefix}OtpResendCount`,
  UsedPasswordResetToken: `${RedisPrefix}UsedPasswordResetToken`
} as const;

export type RedisKey = (typeof RedisKeys)[keyof typeof RedisKeys];
