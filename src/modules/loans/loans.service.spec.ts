import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from './loans.service';
import { LoanRepository } from './loan.repository';
import { UserRepository } from '../users/user.repository';

describe('LoansService', () => {
  let service: LoansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        { provide: LoanRepository, useValue: {} },
        { provide: UserRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
