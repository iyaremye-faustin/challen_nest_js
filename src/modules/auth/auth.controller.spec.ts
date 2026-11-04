import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailHelper } from '../../helpers/emailHelper';
import { UserHelper } from '../../helpers/userHelper';
import { RedisService } from '../../helpers/redis';
import { CreateAuthDto } from './dto/create-auth.dto';
import { VerifyAccountDto } from './dto/create-auth.dto';
import { ForgotPasswordDto } from './dto/create-auth.dto';
import { ResetPasswordDto } from './dto/create-auth.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

const mockCreateAuthDto: CreateAuthDto = {
  email: 'test@example.com',
  password: 'password123',
};

const mockVerifyAccountDto: VerifyAccountDto = {
  password: 'newpassword123',
};

const mockForgotPasswordDto: ForgotPasswordDto = {
  email: 'test@example.com',
};

const mockResetPasswordDto: ResetPasswordDto = {
  password: 'newpassword123',
};

const mockServiceResponse = {
  success: true,
  message: 'Operation successful',
};

const mockAuthService = {
  login: jest.fn(),
  verifyAccount: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  verifyOtp: jest.fn(),
};

const mockEmailHelper = {
  sendOtpEmail: jest.fn(),
};

const mockUserHelper = {
  generateOtp: jest.fn(),
  setUserOtpInRedis: jest.fn(),
};

const mockRedisService = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
};

const mockVerifyOtpDto: VerifyOtpDto = {
  otp: '123456',
  userId: 'user123',
  email: 'test@example.com',
  password: 'password123',
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: EmailHelper,
          useValue: mockEmailHelper,
        },
        {
          provide: UserHelper,
          useValue: mockUserHelper,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('otpVerify', () => {
    it('should verify OTP', async () => {
      mockAuthService.verifyOtp.mockResolvedValue(mockServiceResponse);

      const result = await controller.otpVerify(mockVerifyOtpDto);

      expect(result).toEqual(mockServiceResponse);
      expect(mockAuthService.verifyOtp).toHaveBeenCalledWith(
        mockVerifyOtpDto.userId,
        mockVerifyOtpDto.otp,
        mockVerifyOtpDto.email,
        mockVerifyOtpDto.password,
      );
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      const result = await controller.login(mockCreateAuthDto);

      expect(result).toEqual(mockServiceResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockCreateAuthDto);
    });
  });

  describe('verifyAccount', () => {
    it('should verify account', async () => {
      mockAuthService.verifyAccount.mockResolvedValue(mockServiceResponse);

      const result = await controller.verifyAccount(
        'token123',
        mockVerifyAccountDto,
      );

      expect(result).toEqual(mockServiceResponse);
      expect(mockAuthService.verifyAccount).toHaveBeenCalledWith(
        mockVerifyAccountDto,
        'token123',
      );
    });
  });

  describe('forgotPassword', () => {
    it('should initiate password reset', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(mockServiceResponse);

      const result = await controller.forgotPassword(mockForgotPasswordDto);

      expect(result).toEqual(mockServiceResponse);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        mockForgotPasswordDto,
      );
    });
  });

  describe('confirmForgotPassword', () => {
    it('should confirm password reset', async () => {
      mockAuthService.resetPassword.mockResolvedValue(mockServiceResponse);

      const result = await controller.confirmForgotPassword(
        'token123',
        mockResetPasswordDto,
      );

      expect(result).toEqual(mockServiceResponse);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        mockResetPasswordDto,
        'token123',
      );
    });
  });
});
