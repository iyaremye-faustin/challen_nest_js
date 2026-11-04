import { Test, TestingModule } from '@nestjs/testing';
import { EmailHelper } from './emailHelper';
import { UserHelper } from './userHelper';
import * as emailService from '../common/services/email.service';

jest.mock('../common/services/email.service', () => ({
  sendEmailSmtp: jest.fn(),
}));

const mockUserHelper = {
  generateGeneralAccessToken: jest.fn(),
};

describe('EmailHelper', () => {
  let emailHelper: EmailHelper;

  beforeEach(async () => {
    process.env.FRONTEND_URL = 'https://app.example.com';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailHelper,
        { provide: UserHelper, useValue: mockUserHelper },
      ],
    }).compile();

    emailHelper = module.get<EmailHelper>(EmailHelper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(emailHelper).toBeDefined();
  });

  describe('sendActivationEmail', () => {
    it('should generate a token and send the activation email', async () => {
      mockUserHelper.generateGeneralAccessToken.mockReturnValue({
        token: 'activation-token',
      });
      (emailService.sendEmailSmtp as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await emailHelper.sendActivationEmail({
        to: 'user@example.com',
        name: 'John',
        userId: 'user-id',
      });

      expect(mockUserHelper.generateGeneralAccessToken).toHaveBeenCalledWith(
        'user-id',
      );
      expect(emailService.sendEmailSmtp).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Activate Your Account',
        template: 'activate-account',
        context: {
          name: 'John',
          activationLink:
            'https://app.example.com/account/onboarding/verify/activation-token',
        },
      });
      expect(result).toEqual({ success: true });
    });

    it('should use empty string in link when token is undefined', async () => {
      mockUserHelper.generateGeneralAccessToken.mockReturnValue({
        token: undefined,
      });
      (emailService.sendEmailSmtp as jest.Mock).mockResolvedValue({
        success: true,
      });

      await emailHelper.sendActivationEmail({
        to: 'user@example.com',
        name: 'John',
        userId: 'user-id',
      });

      expect(emailService.sendEmailSmtp).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            activationLink:
              'https://app.example.com/account/onboarding/verify/',
          }),
        }),
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should generate a token and send the reset email', async () => {
      mockUserHelper.generateGeneralAccessToken.mockReturnValue({
        token: 'reset-token',
      });
      (emailService.sendEmailSmtp as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await emailHelper.sendPasswordResetEmail({
        to: 'user@example.com',
        name: 'John',
        userId: 'user-id',
      });

      expect(mockUserHelper.generateGeneralAccessToken).toHaveBeenCalledWith(
        'user-id',
      );
      expect(emailService.sendEmailSmtp).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Reset Your Password',
        template: 'reset-password',
        context: {
          name: 'John',
          resetLink:
            'https://app.example.com/account/reset-password/reset-token',
        },
      });
      expect(result).toEqual({ success: true });
    });

    it('should use empty string in link when token is undefined', async () => {
      mockUserHelper.generateGeneralAccessToken.mockReturnValue({
        token: undefined,
      });
      (emailService.sendEmailSmtp as jest.Mock).mockResolvedValue({
        success: true,
      });

      await emailHelper.sendPasswordResetEmail({
        to: 'user@example.com',
        name: 'John',
        userId: 'user-id',
      });

      expect(emailService.sendEmailSmtp).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            resetLink: 'https://app.example.com/account/reset-password/',
          }),
        }),
      );
    });
  });

  describe('sendOtpEmail', () => {
    it('should send the OTP email with correct context', async () => {
      (emailService.sendEmailSmtp as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await emailHelper.sendOtpEmail({
        to: 'user@example.com',
        name: 'John',
        otp: '123456',
      });

      expect(emailService.sendEmailSmtp).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Your One-Time Password',
        template: 'otp-email',
        context: { name: 'John', otp: '123456' },
      });
      expect(result).toEqual({ success: true });
    });
  });
});
