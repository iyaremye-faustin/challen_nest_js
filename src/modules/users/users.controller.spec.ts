import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/request/create-user.dto';
import { ResendActivationEmailDto } from './dto/request/resend-activation-email.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { ChangePasswordDto } from './dto/request/change-password.dto';
import { ChangeUserStatusDto } from './dto/request/change-user-status.dto';
import { ChangeUserRoleDto } from './dto/request/change-user-role.dto';
import { Request } from 'express';
import { AuthUser } from '../../types/common.types';

const mockCreateUserDto: CreateUserDto = {
  name: 'John Doe',
  email: 'test@example.com',
  phone: '+1234567890',
  address: {
    province: 'Province',
    district: 'District',
    sector: 'Sector',
    cell: 'Cell',
    village: 'Village',
  },
  role_id: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
};

const mockResendActivationEmailDto: ResendActivationEmailDto = {
  email: 'test@example.com',
};

const mockChangePasswordDto: ChangePasswordDto = {
  currentPassword: 'oldpassword',
  newPassword: 'newpassword123',
};

const mockChangeUserStatusDto: ChangeUserStatusDto = {
  userId: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
  status: 'ACTIVE',
};

const mockChangeUserRoleDto: ChangeUserRoleDto = {
  userId: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
  roleId: 'b1c2d3e4-f5g6-7890-h1i2-j3k4l5m6n7o8',
};

const mockAuthUser: AuthUser = {
  id: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
  name: 'Admin User',
  email: 'admin@example.com',
  phone: '+1234567890',
  status: 'ACTIVE',
  address: {
    province: 'Province',
    district: 'District',
    sector: 'Sector',
    cell: 'Cell',
    village: 'Village',
  },
  account_verified: true,
  role_id: 'c1d2e3f4-g5h6-7890-i1j2-k3l4m5n6o7p8',
  priviles: [],
};

const mockRequest: Request & { user?: AuthUser } = {
  user: mockAuthUser,
} as Request & { user?: AuthUser };

const mockServiceResponse = {
  success: true,
  message: 'Operation successful',
};

const mockUsersService = {
  create: jest.fn(),
  resendActivationEmail: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  changePassword: jest.fn(),
  changeUserStatus: jest.fn(),
  changeUserRole: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      mockUsersService.create.mockResolvedValue(mockServiceResponse);
      const result = await controller.create(mockCreateUserDto);
      expect(result).toEqual(mockServiceResponse);
      expect(mockUsersService.create).toHaveBeenCalledWith(mockCreateUserDto);
    });
  });

  describe('resendActivationEmail', () => {
    it('should resend the activation email', async () => {
      mockUsersService.resendActivationEmail.mockResolvedValue(
        mockServiceResponse,
      );
      const result = await controller.resendActivationEmail(
        mockResendActivationEmailDto,
      );
      expect(result).toEqual(mockServiceResponse);
      expect(mockUsersService.resendActivationEmail).toHaveBeenCalledWith(
        mockResendActivationEmailDto.email,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      mockUsersService.findAll.mockResolvedValue([mockServiceResponse]);
      const result = await controller.findAll({});
      expect(result).toEqual([mockServiceResponse]);
      expect(mockUsersService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('update', () => {
    it('should update a user by ID', async () => {
      const mockUpdateUserDto: UpdateUserDto = { name: 'Updated Name' };
      mockUsersService.update.mockResolvedValue(mockServiceResponse);

      const result = await controller.update(
        'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
        mockUpdateUserDto,
      );

      expect(result).toEqual(mockServiceResponse);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
        mockUpdateUserDto,
      );
    });
  });

  describe('changePassword', () => {
    it('should change password for authenticated user', async () => {
      mockUsersService.changePassword.mockResolvedValue(mockServiceResponse);
      const result = await controller.changePassword(
        mockChangePasswordDto,
        mockRequest,
      );
      expect(result).toEqual(mockServiceResponse);
      expect(mockUsersService.changePassword).toHaveBeenCalledWith(
        mockAuthUser.id,
        mockChangePasswordDto,
      );
    });
  });

  describe('changeUserStatus', () => {
    it('should change user status', async () => {
      mockUsersService.changeUserStatus.mockResolvedValue(mockServiceResponse);
      const result = await controller.changeUserStatus(
        mockChangeUserStatusDto,
        mockRequest,
      );
      expect(result).toEqual(mockServiceResponse);
      expect(mockUsersService.changeUserStatus).toHaveBeenCalledWith(
        mockAuthUser,
        mockChangeUserStatusDto,
      );
    });
  });

  describe('changeUserRole', () => {
    it('should change user role', async () => {
      mockUsersService.changeUserRole.mockResolvedValue(mockServiceResponse);
      const result = await controller.changeUserRole(
        mockChangeUserRoleDto,
        mockRequest,
      );
      expect(result).toEqual(mockServiceResponse);
      expect(mockUsersService.changeUserRole).toHaveBeenCalledWith(
        mockAuthUser,
        mockChangeUserRoleDto,
      );
    });
  });
});
