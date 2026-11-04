import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthUser } from '../../../types/common.types';
import { PERMISSIONS_KEY } from './require-permissions.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    const user = req.user;
    if (!user?.priviles) {
      throw new ForbiddenException({
        success: false,
        message: 'Access denied, missing required user information',
      });
    }

    const hasPermission = requiredPermissions.every((permission) =>
      user.priviles.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException({
        success: false,
        message: 'Access denied, you do not have the required permissions',
      });
    }

    return true;
  }
}
