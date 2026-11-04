import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const mockCreateRoleDto: CreateRoleDto = {
  name: 'Admin Role',
  privileges: ['CAN_CREATE_USER', 'CAN_VIEW_USER'],
};

const mockUpdateRoleDto: UpdateRoleDto = {
  name: 'Updated Admin Role',
  privileges: ['CAN_CREATE_USER', 'CAN_VIEW_USER', 'CAN_EDIT_USER'],
};

const mockServiceResponse = {
  success: true,
  message: 'Operation successful',
};

const mockRolesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

describe('RolesController', () => {
  let controller: RolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [{ provide: RolesService, useValue: mockRolesService }],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a role', async () => {
      mockRolesService.create.mockResolvedValue(mockServiceResponse);
      const result = await controller.create(mockCreateRoleDto);
      expect(result).toEqual(mockServiceResponse);
      expect(mockRolesService.create).toHaveBeenCalledWith(mockCreateRoleDto);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      mockRolesService.findAll.mockResolvedValue([mockServiceResponse]);
      const result = await controller.findAll({});
      expect(result).toEqual([mockServiceResponse]);
      expect(mockRolesService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it('should return roles with pagination', async () => {
      mockRolesService.findAll.mockResolvedValue([mockServiceResponse]);
      const result = await controller.findAll({ page: '2', limit: '15' });
      expect(result).toEqual([mockServiceResponse]);
      expect(mockRolesService.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 15,
      });
    });
  });

  describe('findOne', () => {
    it('should find a role by ID', async () => {
      mockRolesService.findOne.mockResolvedValue(mockServiceResponse);
      const result = await controller.findOne(
        'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
      );
      expect(result).toEqual(mockServiceResponse);
      expect(mockRolesService.findOne).toHaveBeenCalledWith(
        'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
      );
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      mockRolesService.update.mockResolvedValue(mockServiceResponse);
      const result = await controller.update(
        'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
        mockUpdateRoleDto,
      );
      expect(result).toEqual(mockServiceResponse);
      expect(mockRolesService.update).toHaveBeenCalledWith(
        'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
        mockUpdateRoleDto,
      );
    });
  });
});
