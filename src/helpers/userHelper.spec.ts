import { Test, TestingModule } from '@nestjs/testing';
import * as jwtModule from 'jsonwebtoken';
import * as crypto from 'node:crypto';
import { UserHelper } from './userHelper';
import { RedisService } from './redis';
import { RedisKeys } from '../constants/redisKeys';

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockUser = {
  id: 'user-id',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+250700000000',
  status: 'ACTIVE',
  address: {
    province: 'Kigali',
    district: 'Gasabo',
    sector: 'S',
    cell: 'C',
    village: 'V',
  },
  account_verified: true,
  role_id: 'role-id',
};

async function buildModule(withSecretKey: boolean): Promise<UserHelper> {
  if (withSecretKey) {
    process.env.JWT_SECRET_KEY = 'test-secret-key';
  } else {
    delete process.env.JWT_SECRET_KEY;
  }
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      UserHelper,
      { provide: RedisService, useValue: mockRedisService },
    ],
  }).compile();
  return module.get<UserHelper>(UserHelper);
}

describe('UserHelper', () => {
  let userHelper: UserHelper;

  beforeEach(async () => {
    userHelper = await buildModule(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userHelper).toBeDefined();
  });

  describe('generateAccessToken', () => {
    it('should return a signed token', () => {
      const result = userHelper.generateAccessToken('user-id');
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
    });

    it('should return failure when secret key is not configured', async () => {
      const helper = await buildModule(false);
      const result = helper.generateAccessToken('user-id');
      expect(result.success).toBe(false);
      expect(result.token).toBeUndefined();
    });
  });

  describe('generateGeneralAccessToken', () => {
    it('should return a token', () => {
      const result = userHelper.generateGeneralAccessToken('user-id');
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
    });

    it('should return failure when secret key is not configured', async () => {
      const helper = await buildModule(false);
      const result = helper.generateGeneralAccessToken('user-id');
      expect(result.success).toBe(false);
    });
  });

  describe('generateRefreshToken', () => {
    it('should return a signed token with userId', async () => {
      const result = await userHelper.generateRefreshToken('user-id');
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();

      const decoded = jwtModule.decode(result.token!) as jwtModule.JwtPayload;
      expect(decoded.userId).toBe('user-id');
    });

    it('should return failure when secret key is not configured', async () => {
      const helper = await buildModule(false);
      const result = await helper.generateRefreshToken('user-id');
      expect(result.success).toBe(false);
      expect(result.token).toBeUndefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return decoded payload', () => {
      const { token } = userHelper.generateAccessToken('user-id');
      const result = userHelper.verifyToken(token!);
      expect(result.success).toBe(true);
      expect(result.data?.userId).toBe('user-id');
    });

    it('should return failure for a tampered token', () => {
      const result = userHelper.verifyToken('invalid.token.value');
      expect(result.success).toBe(false);
    });

    it('should return failure when secret key is not configured', async () => {
      const helper = await buildModule(false);
      const result = helper.verifyToken('some-token');
      expect(result.success).toBe(false);
    });

    it('should return failure for an expired token', () => {
      const now = Math.floor(Date.now() / 1000);
      const expiredToken = jwtModule.sign(
        { userId: 'user-id', iat: now - 200, exp: now - 100 },
        'test-secret-key',
      );

      const result = userHelper.verifyToken(expiredToken);

      expect(result.success).toBe(false);
    });
  });

  describe('setAuthToken', () => {
    it('should return user with access token', () => {
      const result = userHelper.setAuthToken(mockUser);
      expect(result.success).toBe(true);
      expect(result.data?.access_token).toBeDefined();
      expect(result.data?.user).toEqual(mockUser);
    });

    it('should handle null role_id', () => {
      const result = userHelper.setAuthToken({
        ...mockUser,
        role_id: null,
      });
      expect(result.success).toBe(true);
    });

    it('should return failure when token generation fails', async () => {
      const helper = await buildModule(false);
      const result = helper.setAuthToken(mockUser);
      expect(result.success).toBe(false);
    });

    it('should return failure when generateAccessToken throws unexpectedly', () => {
      const spy = jest
        .spyOn(userHelper, 'generateAccessToken')
        .mockImplementationOnce(() => {
          throw new Error('Unexpected error');
        });

      const result = userHelper.setAuthToken(mockUser);

      expect(result.success).toBe(false);
      spy.mockRestore();
    });
  });

  describe('setAuthUserInRedis', () => {
    it('should store user in redis with 1 hour TTL', async () => {
      mockRedisService.set.mockResolvedValue('OK');
      const result = await userHelper.setAuthUserInRedis(mockUser);
      expect(result).toEqual({ success: true });
      expect(mockRedisService.set).toHaveBeenCalledWith(
        userHelper.getAuthUserKey(mockUser.id),
        JSON.stringify(mockUser),
        3600,
      );
    });

    it('should return failure on redis error', async () => {
      mockRedisService.set.mockRejectedValue(new Error('Redis error'));
      const result = await userHelper.setAuthUserInRedis(mockUser);
      expect(result).toEqual({ success: false });
    });
  });

  describe('getAuthUserInRedis', () => {
    it('should return parsed user from redis', async () => {
      mockRedisService.get.mockResolvedValue(JSON.stringify(mockUser));
      const result = await userHelper.getAuthUserInRedis('user-id');
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should return failure when key does not exist', async () => {
      mockRedisService.get.mockResolvedValue(null);
      const result = await userHelper.getAuthUserInRedis('user-id');
      expect(result).toEqual({ success: false });
    });

    it('should return failure on redis error', async () => {
      mockRedisService.get.mockRejectedValue(new Error('Redis error'));
      const result = await userHelper.getAuthUserInRedis('user-id');
      expect(result).toEqual({ success: false });
    });
  });

  describe('getAuthUserKey', () => {
    it('should return the correct redis key', () => {
      const key = userHelper.getAuthUserKey('user-123');
      expect(key).toBe(`${RedisKeys.AuthUser}:user-123`);
    });
  });

  describe('generateOtp', () => {
    it('should generate a 6-digit numeric string', () => {
      const otp = userHelper.generateOtp();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate different values on repeated calls', () => {
      const otps = new Set(
        Array.from({ length: 20 }, () => userHelper.generateOtp()),
      );
      expect(otps.size).toBeGreaterThan(1);
    });
  });

  describe('setUserOtpInRedis', () => {
    it('should store OTP payload with default 5 minute TTL', async () => {
      mockRedisService.set.mockResolvedValue('OK');
      const result = await userHelper.setUserOtpInRedis(
        'user-id',
        '123456',
        'user@example.com',
        'hashed-pwd',
      );
      expect(result).toEqual({ success: true });
      expect(mockRedisService.set).toHaveBeenCalledWith(
        userHelper.getUserOtpKey('user-id'),
        JSON.stringify({
          otp: '123456',
          userId: 'user-id',
          email: 'user@example.com',
          password: 'hashed-pwd',
        }),
        300,
      );
    });

    it('should store OTP payload with custom TTL', async () => {
      mockRedisService.set.mockResolvedValue('OK');
      await userHelper.setUserOtpInRedis(
        'user-id',
        '654321',
        'u@example.com',
        'pwd',
        600,
      );
      expect(mockRedisService.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        600,
      );
    });

    it('should return failure on redis error', async () => {
      mockRedisService.set.mockRejectedValue(new Error('Redis error'));
      const result = await userHelper.setUserOtpInRedis(
        'user-id',
        '123456',
        'u@example.com',
        'pwd',
      );
      expect(result).toEqual({ success: false });
    });
  });

  describe('getUserOtpFromRedis', () => {
    it('should return parsed OTP payload', async () => {
      const payload = {
        otp: '123456',
        userId: 'user-id',
        email: 'u@example.com',
        password: 'pwd',
      };
      mockRedisService.get.mockResolvedValue(JSON.stringify(payload));
      const result = await userHelper.getUserOtpFromRedis('user-id');
      expect(result.success).toBe(true);
      expect(result.payload).toEqual(payload);
    });

    it('should return failure when key does not exist', async () => {
      mockRedisService.get.mockResolvedValue(null);
      const result = await userHelper.getUserOtpFromRedis('user-id');
      expect(result).toEqual({ success: false });
    });

    it('should return failure on redis error', async () => {
      mockRedisService.get.mockRejectedValue(new Error('Redis error'));
      const result = await userHelper.getUserOtpFromRedis('user-id');
      expect(result).toEqual({ success: false });
    });
  });

  describe('getUserOtpKey', () => {
    it('should return the correct redis key', () => {
      const key = userHelper.getUserOtpKey('user-123');
      expect(key).toBe(`${RedisKeys.UserOtp}:user-123`);
    });
  });

  describe('getUsedPasswordResetTokenKey', () => {
    it('should return a redis key derived from a hash of the token', () => {
      const token = 'reset-token-123';
      const expectedHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const key = userHelper.getUsedPasswordResetTokenKey(token);

      expect(key).toBe(`${RedisKeys.UsedPasswordResetToken}:${expectedHash}`);
    });
  });

  describe('markPasswordResetTokenAsUsed', () => {
    it('should store the token hash in redis with a ttl derived from the expiry', async () => {
      mockRedisService.set.mockResolvedValue('OK');
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const expiresAt = nowInSeconds + 3600;

      await userHelper.markPasswordResetTokenAsUsed(
        'reset-token-123',
        expiresAt,
      );

      const key = userHelper.getUsedPasswordResetTokenKey('reset-token-123');
      expect(mockRedisService.set).toHaveBeenCalledWith(
        key,
        '1',
        expect.any(Number),
      );
      const ttlUsed = mockRedisService.set.mock.calls[0][2];
      expect(ttlUsed).toBeGreaterThan(0);
      expect(ttlUsed).toBeLessThanOrEqual(3600);
    });

    it('should fall back to a default ttl when no expiry is provided', async () => {
      mockRedisService.set.mockResolvedValue('OK');

      await userHelper.markPasswordResetTokenAsUsed('reset-token-123');

      const key = userHelper.getUsedPasswordResetTokenKey('reset-token-123');
      expect(mockRedisService.set).toHaveBeenCalledWith(key, '1', 7200);
    });
  });

  describe('isPasswordResetTokenUsed', () => {
    it('should return true when the token hash exists in redis', async () => {
      mockRedisService.get.mockResolvedValue('1');

      const result =
        await userHelper.isPasswordResetTokenUsed('reset-token-123');

      expect(result).toBe(true);
    });

    it('should return false when the token hash does not exist in redis', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const result =
        await userHelper.isPasswordResetTokenUsed('reset-token-123');

      expect(result).toBe(false);
    });
  });
});
