import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserHelper } from '../../../helpers/userHelper';
import { UserRepository } from '../../../modules/users/user.repository';
import { RoleRepository } from '../../../modules/roles/role.repository';
import { USER_STATUS } from '../../../constants/general';

const mockReflector = { getAllAndOverride: jest.fn() };
const mockUserHelper = {
  verifyToken: jest.fn(),
  getAuthUserInRedis: jest.fn(),
};
const mockUserRepository = { findById: jest.fn() };
const mockRoleRepository = { findByIdWithPrivileges: jest.fn() };

function buildContext(headers: Record<string, string> = {}): ExecutionContext {
  const req = { headers, user: undefined as unknown };
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(req),
    }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: Reflector, useValue: mockReflector },
        { provide: UserHelper, useValue: mockUserHelper },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: RoleRepository, useValue: mockRoleRepository },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for public routes', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);
      expect(await guard.canActivate(buildContext())).toBe(true);
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      await expect(guard.canActivate(buildContext({}))).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for an invalid token', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockUserHelper.verifyToken.mockReturnValue({ success: false });
      await expect(
        guard.canActivate(buildContext({ authorization: 'Bearer bad-token' })),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token has no userId', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockUserHelper.verifyToken.mockReturnValue({ success: true, data: {} });
      await expect(
        guard.canActivate(buildContext({ authorization: 'Bearer token' })),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should authenticate user from Redis and attach to request', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockUserHelper.verifyToken.mockReturnValue({
        success: true,
        data: { userId: 'user-id' },
      });
      mockUserHelper.getAuthUserInRedis.mockResolvedValue({
        success: true,
        user: { id: 'user-id', status: USER_STATUS.ACTIVE },
      });

      const result = await guard.canActivate(
        buildContext({ authorization: 'Bearer valid-token' }),
      );
      expect(result).toBe(true);
    });

    it('should authenticate user from DB when not in Redis cache', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockUserHelper.verifyToken.mockReturnValue({
        success: true,
        data: { userId: 'user-id' },
      });
      mockUserHelper.getAuthUserInRedis.mockResolvedValue({ success: false });
      mockUserRepository.findById.mockResolvedValue({
        id: 'user-id',
        name: 'John',
        email: 'j@example.com',
        phone: '+250700000000',
        status: USER_STATUS.ACTIVE,
        address: {},
        account_verified: true,
        role_id: 'role-id',
      });
      mockRoleRepository.findByIdWithPrivileges.mockResolvedValue({
        id: 'role-id',
        privileges: [{ privilege: 'CAN_VIEW_USER' }],
      });

      const result = await guard.canActivate(
        buildContext({ authorization: 'Bearer valid-token' }),
      );
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when user is not found in DB', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockUserHelper.verifyToken.mockReturnValue({
        success: true,
        data: { userId: 'user-id' },
      });
      mockUserHelper.getAuthUserInRedis.mockResolvedValue({ success: false });
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        guard.canActivate(
          buildContext({ authorization: 'Bearer valid-token' }),
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user account is blocked', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockUserHelper.verifyToken.mockReturnValue({
        success: true,
        data: { userId: 'user-id' },
      });
      mockUserHelper.getAuthUserInRedis.mockResolvedValue({
        success: true,
        user: { id: 'user-id', status: USER_STATUS.BLOCKED },
      });

      await expect(
        guard.canActivate(
          buildContext({ authorization: 'Bearer valid-token' }),
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should extract token correctly when no Bearer prefix is present', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockUserHelper.verifyToken.mockReturnValue({
        success: true,
        data: { userId: 'user-id' },
      });
      mockUserHelper.getAuthUserInRedis.mockResolvedValue({
        success: true,
        user: { id: 'user-id', status: USER_STATUS.ACTIVE },
      });

      await guard.canActivate(buildContext({ authorization: 'bare-token' }));
      expect(mockUserHelper.verifyToken).toHaveBeenCalledWith('bare-token');
    });
  });
});
