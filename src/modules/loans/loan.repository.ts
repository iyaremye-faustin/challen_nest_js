import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from '../../common/base.repository';
import { Loan } from '../../database/models/loan.model';

@Injectable()
export class LoanRepository extends BaseRepository<Loan> {
  constructor(@InjectModel(Loan) loanModel: typeof Loan) {
    super(loanModel);
  }

  async findByUser(user_id: string): Promise<Loan[]> {
    return this.model.findAll({ where: { user_id } });
  }
}
