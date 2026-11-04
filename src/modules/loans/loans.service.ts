import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { LoanRepository } from './loan.repository';
import { UserRepository } from '../users/user.repository';
import { PaginationOptions } from '../../common/base.repository';
import { LOAN_STATUS, LOAN_PAYMENT_STATUS } from '../../constants/general';

@Injectable()
export class LoansService {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(createLoanDto: CreateLoanDto) {
    const user = await this.userRepository.findById(createLoanDto.user_id);
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'The specified user does not exist',
      });
    }

    try {
      const loan = await this.loanRepository.create({
        user_id: createLoanDto.user_id,
        loan_amount: createLoanDto.loan_amount.toFixed(2),
        currency: createLoanDto.currency,
        loan_status: createLoanDto.loan_status ?? LOAN_STATUS.PENDING,
        payment_status:
          createLoanDto.payment_status ?? LOAN_PAYMENT_STATUS.PENDING,
      });
      return {
        success: true,
        data: loan,
        message: 'Loan created successfully',
      };
    } catch {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to create loan',
      });
    }
  }

  async findAll(pagination?: PaginationOptions) {
    const result = await this.loanRepository.findAll(undefined, pagination);
    return {
      success: true,
      data: result,
      message: 'Loans retrieved successfully',
    };
  }

  async findOne(id: string) {
    const loan = await this.loanRepository.findById(id);
    if (!loan) {
      throw new NotFoundException({
        success: false,
        message: 'Loan not found',
      });
    }
    return {
      success: true,
      data: loan,
      message: 'Loan retrieved successfully',
    };
  }

  async update(id: string, updateLoanDto: UpdateLoanDto) {
    const existing = await this.loanRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        success: false,
        message: 'Loan not found',
      });
    }

    if (
      updateLoanDto.user_id &&
      updateLoanDto.user_id !== existing.user_id
    ) {
      const user = await this.userRepository.findById(updateLoanDto.user_id);
      if (!user) {
        throw new NotFoundException({
          success: false,
          message: 'The specified user does not exist',
        });
      }
    }

    const { loan_amount, ...rest } = updateLoanDto;
    const payload: Record<string, unknown> = { ...rest };
    if (loan_amount !== undefined) {
      payload.loan_amount = loan_amount.toFixed(2);
    }

    await this.loanRepository.update(id, payload);
    return { success: true, data: null, message: 'Loan updated successfully' };
  }

  async remove(id: string) {
    const loan = await this.loanRepository.findById(id);
    if (!loan) {
      throw new NotFoundException({
        success: false,
        message: 'Loan not found',
      });
    }
    await this.loanRepository.delete(id);
    return { success: true, data: null, message: 'Loan deleted successfully' };
  }
}
