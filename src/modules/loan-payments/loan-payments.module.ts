import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoanPaymentsService } from './loan-payments.service';
import { LoanPaymentsController } from './loan-payments.controller';
import { LoanPaymentRepository } from './loan-payment.repository';
import { LoanPayment } from '../../database/models/loan-payment.model';
import { LoansModule } from '../loans/loans.module';

@Module({
  imports: [SequelizeModule.forFeature([LoanPayment]), LoansModule],
  controllers: [LoanPaymentsController],
  providers: [LoanPaymentsService, LoanPaymentRepository],
  exports: [LoanPaymentRepository],
})
export class LoanPaymentsModule {}
