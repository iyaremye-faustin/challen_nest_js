import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../../types/common.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    return request.user!;
  },
);
