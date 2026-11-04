import { timingSafeEqual } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

const HEADER_NAME = 'x-callback-token';

@Injectable()
export class CallbackKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.configService.get<string>(
      'loanPaymentCallback.token',
    );
    if (!expected) {
      throw new UnauthorizedException({
        success: false,
        message: 'Callback authorisation is not configured',
      });
    }

    const req = context.switchToHttp().getRequest<Request>();
    const provided = req.headers[HEADER_NAME];
    const token = Array.isArray(provided) ? provided[0] : provided;

    if (!token || !this.safeCompare(token, expected)) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid callback token',
      });
    }

    return true;
  }

  private safeCompare(a: string, b: string): boolean {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
  }
}
