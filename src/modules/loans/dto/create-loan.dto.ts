import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LOAN_STATUS, LOAN_PAYMENT_STATUS } from '../../../constants/general';

export class CreateLoanDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ example: 1500.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  loan_amount: number;

  @ApiProperty({ example: 'RWF' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ enum: Object.values(LOAN_STATUS), required: false })
  @IsOptional()
  @IsEnum(Object.values(LOAN_STATUS))
  loan_status?: string;

  @ApiProperty({ enum: Object.values(LOAN_PAYMENT_STATUS), required: false })
  @IsOptional()
  @IsEnum(Object.values(LOAN_PAYMENT_STATUS))
  payment_status?: string;
}
