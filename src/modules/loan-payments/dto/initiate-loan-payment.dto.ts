import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PAYMENT_CHANNEL } from '../../../constants/general';

export class InitiateLoanPaymentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  loan_id: string;

  @ApiProperty({ example: 500.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: Object.values(PAYMENT_CHANNEL) })
  @IsEnum(Object.values(PAYMENT_CHANNEL))
  payment_channel: string;
}
