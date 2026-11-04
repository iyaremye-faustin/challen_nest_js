import { Reflector } from '@nestjs/core';
import {
  IS_PUBLIC_KEY,
  PERMISSIONS_KEY,
  Public,
  RequirePermissions,
} from './require-permissions.decorator';

describe('require-permissions decorator', () => {
  describe('constants', () => {
    it('PERMISSIONS_KEY should equal "permissions"', () => {
      expect(PERMISSIONS_KEY).toBe('permissions');
    });

    it('IS_PUBLIC_KEY should equal "isPublic"', () => {
      expect(IS_PUBLIC_KEY).toBe('isPublic');
    });
  });

  describe('RequirePermissions', () => {
    it('should return a decorator function', () => {
      expect(RequirePermissions('CAN_VIEW_USER')).toBeInstanceOf(Function);
    });

    it('should set permissions metadata on the target class', () => {
      class TestHandler {}
      RequirePermissions('CAN_VIEW_USER', 'CAN_CREATE_USER')(TestHandler);

      const reflector = new Reflector();
      const permissions = reflector.get<string[]>(PERMISSIONS_KEY, TestHandler);
      expect(permissions).toEqual(['CAN_VIEW_USER', 'CAN_CREATE_USER']);
    });

    it('should handle a single permission', () => {
      class TestHandler {}
      RequirePermissions('CAN_DELETE_USER')(TestHandler);

      const reflector = new Reflector();
      const permissions = reflector.get<string[]>(PERMISSIONS_KEY, TestHandler);
      expect(permissions).toEqual(['CAN_DELETE_USER']);
    });
  });

  describe('Public', () => {
    it('should return a decorator function', () => {
      expect(Public()).toBeInstanceOf(Function);
    });

    it('should set isPublic metadata to true on the target class', () => {
      class TestHandler {}
      Public()(TestHandler);

      const reflector = new Reflector();
      const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, TestHandler);
      expect(isPublic).toBe(true);
    });
  });
});
