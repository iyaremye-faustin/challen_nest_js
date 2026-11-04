import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard } from './permission-guard.guard';

const mockReflector = { getAllAndOverride: jest.fn() };

function buildContext(user?: object): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('PermissionGuard', () => {
  let guard: PermissionGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<PermissionGuard>(PermissionGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when no permissions are required (null)', () => {
      mockReflector.getAllAndOverride.mockReturnValue(null);
      expect(guard.canActivate(buildContext())).toBe(true);
    });

    it('should return true when required permissions array is empty', () => {
      mockReflector.getAllAndOverride.mockReturnValue([]);
      expect(guard.canActivate(buildContext())).toBe(true);
    });

    it('should throw ForbiddenException when request has no user', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['CAN_VIEW_USER']);
      expect(() => guard.canActivate(buildContext(undefined))).toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when user has no priviles', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['CAN_VIEW_USER']);
      expect(() =>
        guard.canActivate(buildContext({ id: 'user-id', priviles: undefined })),
      ).toThrow(ForbiddenException);
    });

    it('should return true when user has all required permissions', () => {
      mockReflector.getAllAndOverride.mockReturnValue([
        'CAN_VIEW_USER',
        'CAN_CREATE_USER',
      ]);

      const result = guard.canActivate(
        buildContext({
          id: 'user-id',
          priviles: ['CAN_VIEW_USER', 'CAN_CREATE_USER', 'CAN_DELETE_USER'],
        }),
      );
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user is missing a required permission', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['CAN_DELETE_USER']);

      expect(() =>
        guard.canActivate(
          buildContext({ id: 'user-id', priviles: ['CAN_VIEW_USER'] }),
        ),
      ).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user has none of the required permissions', () => {
      mockReflector.getAllAndOverride.mockReturnValue([
        'CAN_VIEW_USER',
        'CAN_CREATE_USER',
      ]);

      expect(() =>
        guard.canActivate(buildContext({ id: 'user-id', priviles: [] })),
      ).toThrow(ForbiddenException);
    });
  });
});
