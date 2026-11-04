import { Test, TestingModule } from '@nestjs/testing';
import { UtilityService } from './utility.service';

describe('UtilityService', () => {
  let service: UtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UtilityService],
    }).compile();

    service = module.get<UtilityService>(UtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('passwordSalt', () => {
    it('should return a non-empty string', () => {
      const salt = service.passwordSalt();
      expect(typeof salt).toBe('string');
      expect(salt.length).toBeGreaterThan(0);
    });

    it('should return a unique salt on each call', () => {
      const salt1 = service.passwordSalt();
      const salt2 = service.passwordSalt();
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('passwordHash', () => {
    it('should return a hashed string that differs from the original password', () => {
      const salt = service.passwordSalt();
      const hash = service.passwordHash('mypassword', salt);
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe('mypassword');
    });

    it('should produce the same hash for the same password and salt', () => {
      const salt = service.passwordSalt();
      const hash1 = service.passwordHash('mypassword', salt);
      const hash2 = service.passwordHash('mypassword', salt);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different passwords with the same salt', () => {
      const salt = service.passwordSalt();
      const hash1 = service.passwordHash('password1', salt);
      const hash2 = service.passwordHash('password2', salt);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('passwordCompare', () => {
    it('should return true when the password matches the hash', () => {
      const salt = service.passwordSalt();
      const hash = service.passwordHash('mypassword', salt);
      expect(service.passwordCompare('mypassword', hash)).toBe(true);
    });

    it('should return false when the password does not match the hash', () => {
      const salt = service.passwordSalt();
      const hash = service.passwordHash('mypassword', salt);
      expect(service.passwordCompare('wrongpassword', hash)).toBe(false);
    });
  });

  describe('deleteProps', () => {
    it('should delete a single specified property', () => {
      const obj = {
        name: 'John',
        password: 'secret',
        email: 'john@example.com',
      };
      const result = service.deleteProps(obj, ['password']);
      expect(result).toEqual({ name: 'John', email: 'john@example.com' });
      expect(result).not.toHaveProperty('password');
    });

    it('should delete multiple specified properties', () => {
      const obj = {
        name: 'John',
        password: 'secret',
        salt: 'abc',
        email: 'john@example.com',
      };
      const result = service.deleteProps(obj, ['password', 'salt']);
      expect(result).toEqual({ name: 'John', email: 'john@example.com' });
    });

    it('should return a full copy when no props are specified', () => {
      const obj = { name: 'John', email: 'john@example.com' };
      const result = service.deleteProps(obj, []);
      expect(result).toEqual(obj);
    });

    it('should not mutate the original object', () => {
      const obj = { name: 'John', password: 'secret' };
      service.deleteProps(obj, ['password']);
      expect(obj).toHaveProperty('password', 'secret');
    });

    it('should silently skip properties that do not exist on the object', () => {
      const obj = { name: 'John' };
      const result = service.deleteProps(obj, ['nonExistentProp']);
      expect(result).toEqual({ name: 'John' });
    });
  });
});
