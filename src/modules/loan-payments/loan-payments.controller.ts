import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoanPaymentsService } from './loan-payments.service';
import { InitiateLoanPaymentDto } from './dto/initiate-loan-payment.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { Public } from '../../common/guards/permission-guard/require-permissions.decorator';
import { CallbackKeyGuard } from '../../common/guards/callback-key/callback-key.guard';
import { AuthUser } from '../../types/common.types';

@ApiTags('Loan Payments')
@Controller('loan-payments')
export class LoanPaymentsController {
  constructor(private readonly loanPaymentsService: LoanPaymentsService) {}

  @Post('initiate')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Initiate a payment for an approved loan' })
  @ApiResponse({ status: 201, description: 'Payment initiated successfully' })
  @ApiBody({ type: InitiateLoanPaymentDto })
  initiate(
    @Body() dto: InitiateLoanPaymentDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.loanPaymentsService.initiate(req.user!.id, dto);
  }

  @Public()
  @UseGuards(CallbackKeyGuard)
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Payment provider callback — updates a pending payment',
  })
  @ApiHeader({
    name: 'X-Callback-Token',
    required: true,
    description: 'Shared static token issued to the payment provider',
  })
  @ApiResponse({ status: 200, description: 'Callback processed' })
  @ApiResponse({ status: 401, description: 'Invalid callback token' })
  @ApiBody({ type: PaymentCallbackDto })
  callback(@Body() dto: PaymentCallbackDto) {
    return this.loanPaymentsService.handleCallback(dto);
  }
}
