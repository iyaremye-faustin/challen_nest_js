import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InitiateLoanPaymentDto } from './dto/initiate-loan-payment.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { LoanPaymentRepository } from './loan-payment.repository';
import { LoanRepository } from '../loans/loan.repository';
import {
  LOAN_PAYMENT_STATUS,
  LOAN_STATUS,
  PAYMENT_NOTIFICATION_STATUS,
} from '../../constants/general';
import { logger } from '../../helpers/logger';

@Injectable()
export class LoanPaymentsService {
  constructor(
    private readonly loanPaymentRepository: LoanPaymentRepository,
    private readonly loanRepository: LoanRepository,
  ) {}

  async initiate(
    userId: string,
    dto: InitiateLoanPaymentDto,
  ): Promise<{
    success: boolean;
    data?: {
      id: string;
      transaction_id: string;
      status: string;
      amount: string;
      payment_channel: string;
    };
    message: string;
  }> {
    const loan = await this.loanRepository.findById(dto.loan_id);
    if (!loan) {
      throw new NotFoundException({
        success: false,
        message: 'Loan not found',
      });
    }

    if (loan.user_id !== userId) {
      throw new ForbiddenException({
        success: false,
        message: 'You cannot pay a loan that is not yours',
      });
    }

    if (loan.loan_status !== LOAN_STATUS.APPROVED) {
      throw new BadRequestException({
        success: false,
        message: 'Loan must be approved before accepting payments',
      });
    }

    if (loan.payment_status === LOAN_PAYMENT_STATUS.PAID) {
      throw new BadRequestException({
        success: false,
        message: 'Loan is already fully paid',
      });
    }

    try {
      const transaction_id = randomUUID();
      const payment = await this.loanPaymentRepository.create({
        loan_id: loan.id,
        amount: dto.amount.toFixed(2),
        status: PAYMENT_NOTIFICATION_STATUS.PENDING,
        payment_channel: dto.payment_channel,
        transaction_id,
        status_reason: null,
      });

      return {
        success: true,
        data: {
          id: payment.id,
          transaction_id: payment.transaction_id,
          status: payment.status,
          amount: payment.amount,
          payment_channel: payment.payment_channel,
        },
        message: 'Payment initiated successfully',
      };
    } catch (error) {
      logger.error({ error, loanId: loan.id }, 'Failed to initiate payment');
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to initiate payment',
      });
    }
  }

  async handleCallback(dto: PaymentCallbackDto) {
    const payment = await this.loanPaymentRepository.findByTransactionId(
      dto.transaction_id,
    );
    if (!payment) {
      throw new NotFoundException({
        success: false,
        message: 'No payment matches this transaction',
      });
    }

    if (payment.status !== PAYMENT_NOTIFICATION_STATUS.PENDING) {
      return {
        success: true,
        message: 'Payment already finalised',
      };
    }

    if (payment.payment_channel !== dto.provider) {
      throw new BadRequestException({
        success: false,
        message: 'Provider does not match the initiated channel',
      });
    }

    const loan = await this.loanRepository.findById(payment.loan_id);
    if (!loan) {
      throw new NotFoundException({
        success: false,
        message: 'Loan for this payment no longer exists',
      });
    }

    if (loan.currency !== dto.currency) {
      throw new BadRequestException({
        success: false,
        message: 'Currency does not match the loan currency',
      });
    }

    await this.loanPaymentRepository.update(payment.id, {
      status: dto.status,
      status_reason: dto.reason ?? null,
    });

    if (dto.status === PAYMENT_NOTIFICATION_STATUS.SENT) {
      const paidSoFar =
        await this.loanPaymentRepository.sumSuccessfulForLoan(loan.id);
      const totalPaid = paidSoFar + Number(payment.amount);
      const nextStatus =
        totalPaid >= Number(loan.loan_amount)
          ? LOAN_PAYMENT_STATUS.PAID
          : LOAN_PAYMENT_STATUS.PARTIALLY_PAID;
      await this.loanRepository.update(loan.id, { payment_status: nextStatus });
    }

    return {
      success: true,
      message: 'Payment notification processed',
    };
  }
}
