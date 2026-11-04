import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from '../../common/base.repository';
import { LoanPayment } from '../../database/models/loan-payment.model';
import { PAYMENT_NOTIFICATION_STATUS } from '../../constants/general';

@Injectable()
export class LoanPaymentRepository extends BaseRepository<LoanPayment> {
  constructor(
    @InjectModel(LoanPayment) loanPaymentModel: typeof LoanPayment,
  ) {
    super(loanPaymentModel);
  }

  async findByTransactionId(
    transaction_id: string,
  ): Promise<LoanPayment | null> {
    return this.model.findOne({ where: { transaction_id } });
  }

  async sumSuccessfulForLoan(loan_id: string): Promise<number> {
    const rows = await this.model.findAll({
      where: {
        loan_id,
        status: PAYMENT_NOTIFICATION_STATUS.SENT,
      },
      attributes: ['amount'],
    });
    return rows.reduce((acc, row) => acc + Number(row.amount), 0);
  }
}
