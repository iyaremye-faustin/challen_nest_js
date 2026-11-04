import { Injectable } from '@nestjs/common';
import { sendEmailSmtp } from '../common/services/email.service';
import { UserHelper } from './userHelper';

export interface ISendActivationEmailOptions {
  to: string;
  name: string;
  userId: string;
}

export interface ISendPasswordResetEmailOptions {
  to: string;
  name: string;
  userId: string;
}

export interface ISendOtpEmailOptions {
  to: string;
  name: string;
  otp: string;
}

export interface ISendAccountVerifiedEmailOptions {
  to: string;
  name: string;
}


@Injectable()
export class EmailHelper {
  constructor(private readonly userHelper: UserHelper) {}

  public sendActivationEmail = async ({
    to,
    name,
    userId,
  }: ISendActivationEmailOptions): Promise<{ success: boolean }> => {
    const tokenResponse = this.userHelper.generateGeneralAccessToken(userId);
    const verificationToken = tokenResponse.token || '';
    const activationLink = `${process.env.FRONTEND_URL}/account/onboarding/verify/${verificationToken}`;

    return sendEmailSmtp({
      to,
      subject: 'Activate Your Account',
      template: 'activate-account',
      context: { name, activationLink },
    });
  };

  public sendPasswordResetEmail = async ({
    to,
    name,
    userId,
  }: ISendPasswordResetEmailOptions): Promise<{ success: boolean }> => {
    const tokenResponse = this.userHelper.generateGeneralAccessToken(userId);
    const resetToken = tokenResponse.token || '';
    const resetLink = `${process.env.FRONTEND_URL}/account/reset-password/${resetToken}`;

    return sendEmailSmtp({
      to,
      subject: 'Reset Your Password',
      template: 'reset-password',
      context: { name, resetLink },
    });
  };

  public sendOtpEmail = async ({
    to,
    name,
    otp,
  }: ISendOtpEmailOptions): Promise<{ success: boolean }> => {
    return sendEmailSmtp({
      to,
      subject: 'Your One-Time Password',
      template: 'otp-email',
      context: { name, otp },
    });
  };

  public sendAccountVerifiedEmail = async ({
    to,
    name,
  }: ISendAccountVerifiedEmailOptions): Promise<{ success: boolean }> => {
    return sendEmailSmtp({
      to,
      subject: 'Account Verified',
      template: 'account-verified',
      context: { name },
    });
  };
}
