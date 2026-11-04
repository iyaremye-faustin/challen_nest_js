import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  PAYMENT_CHANNEL,
  PAYMENT_NOTIFICATION_STATUS,
} from '../../../constants/general';

export class PaymentCallbackDto {
  @ApiProperty({ enum: Object.values(PAYMENT_CHANNEL) })
  @IsEnum(Object.values(PAYMENT_CHANNEL))
  provider: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @ApiProperty({ example: 'RWF' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    enum: [PAYMENT_NOTIFICATION_STATUS.SENT, PAYMENT_NOTIFICATION_STATUS.FAILED],
  })
  @IsEnum([
    PAYMENT_NOTIFICATION_STATUS.SENT,
    PAYMENT_NOTIFICATION_STATUS.FAILED,
  ])
  status: string;

  @ApiProperty({ example: '2026-11-04T12:30:00.000Z' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
