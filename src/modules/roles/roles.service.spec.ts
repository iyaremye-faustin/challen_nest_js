import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/sequelize';
import { RolesService } from './roles.service';
import { RoleRepository } from './role.repository';

const mockRoleRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByIdWithPrivileges: jest.fn(),
  update: jest.fn(),
  setPrivileges: jest.fn(),
  nameExists: jest.fn(),
};

const mockSequelize = {
  transaction: jest.fn(async (fn: (t: unknown) => Promise<unknown>) => fn({})),
};

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: RoleRepository, useValue: mockRoleRepository },
        { provide: getConnectionToken(), useValue: mockSequelize },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    mockRoleRepository.nameExists.mockResolvedValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a role', async () => {
      const created = {
        id: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
        name: 'Admin',
      };
      mockRoleRepository.create.mockResolvedValue(created);
      mockRoleRepository.findByIdWithPrivileges.mockResolvedValue(created);

      const result = await service.create({ name: 'Admin' });

      expect(result).toEqual({ success: true, data: created });
      expect(mockRoleRepository.nameExists).toHaveBeenCalledWith('Admin');
    });

    it('should throw ConflictException when the name is taken', async () => {
      mockRoleRepository.nameExists.mockResolvedValue(true);
      await expect(service.create({ name: 'Admin' })).rejects.toThrow(
        ConflictException,
      );
      expect(mockRoleRepository.create).not.toHaveBeenCalled();
    });

    it('should return failure when role creation throws', async () => {
      mockRoleRepository.create.mockRejectedValue(new Error('DB error'));
      const result = await service.create({ name: 'Admin', privileges: [] });
      expect(result).toEqual({
        success: false,
        message: 'Failed to create role',
      });
    });
  });

  describe('findAll', () => {
    it('should find all roles', async () => {
      const roles = [
        { id: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8', name: 'Admin' },
        { id: 'b1c2d3e4-f5g6-7890-h1i2-j3k4l5m6n7o8', name: 'User' },
      ];
      mockRoleRepository.findAll.mockResolvedValue(roles);

      const result = await service.findAll();

      expect(result).toEqual({
        success: true,
        data: roles,
        message: 'Roles retrieved successfully',
      });
    });
  });

  describe('findOne', () => {
    it('should find a role by ID', async () => {
      const role = {
        id: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
        name: 'Admin',
      };
      mockRoleRepository.findByIdWithPrivileges.mockResolvedValue(role);

      const result = await service.findOne(
        'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
      );

      expect(result).toEqual({
        success: true,
        data: role,
        message: 'Role retrieved successfully',
      });
    });

    it('should throw NotFoundException when role not found', async () => {
      mockRoleRepository.findByIdWithPrivileges.mockResolvedValue(null);
      await expect(
        service.findOne('a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      mockRoleRepository.findByIdWithPrivileges.mockResolvedValue({
        id: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
        name: 'Admin',
      });
      mockRoleRepository.update.mockResolvedValue([1, []]);

      const result = await service.update(
        'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
        { name: 'Updated Admin' },
      );

      expect(result).toEqual({
        success: true,
        data: null,
        message: 'Role updated successfully',
      });
    });

    it('should throw ConflictException when renaming to an existing name', async () => {
      mockRoleRepository.findByIdWithPrivileges.mockResolvedValue({
        id: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
        name: 'Admin',
      });
      mockRoleRepository.nameExists.mockResolvedValue(true);

      await expect(
        service.update('a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8', {
          name: 'Super Admin',
        }),
      ).rejects.toThrow(ConflictException);

      expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it('should skip the name check when name is not being changed', async () => {
      mockRoleRepository.findByIdWithPrivileges.mockResolvedValue({
        id: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
        name: 'Admin',
      });
      mockRoleRepository.update.mockResolvedValue([1, []]);

      await service.update('a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8', {
        privileges: [],
      });

      expect(mockRoleRepository.nameExists).not.toHaveBeenCalled();
    });
  });
});
