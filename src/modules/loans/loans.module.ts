import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { LoanRepository } from './loan.repository';
import { Loan } from '../../database/models/loan.model';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [SequelizeModule.forFeature([Loan]), UsersModule],
  controllers: [LoansController],
  providers: [LoansService, LoanRepository],
  exports: [LoanRepository],
})
export class LoansModule {}
