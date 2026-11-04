import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { PrivilegesController } from './privileges.controller';
import { PrivilegesService } from './privileges.service';
import { AuthUser } from '../../types/common.types';

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

const mockPrivilegesService = {
  findAll: jest.fn(),
};

describe('PrivilegesController', () => {
  let controller: PrivilegesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrivilegesController],
      providers: [
        {
          provide: PrivilegesService,
          useValue: mockPrivilegesService,
        },
      ],
    }).compile();

    controller = module.get<PrivilegesController>(PrivilegesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service with the role_id from the request user', async () => {
      const mockResponse = { success: true, data: ['CAN_CREATE_ROLE'] };
      mockPrivilegesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(mockPrivilegesService.findAll).toHaveBeenCalledWith(
        mockAuthUser.role_id,
      );
    });
  });
});
