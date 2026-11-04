import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserHelper } from '../../../helpers/userHelper';
import { UserRepository } from '../../../modules/users/user.repository';
import { RoleRepository } from '../../../modules/roles/role.repository';
import { USER_STATUS } from '../../../constants/general';
import { AuthUser } from '../../../types/common.types';
import { IS_PUBLIC_KEY } from '../permission-guard/require-permissions.decorator';

interface AuthRequest extends Request {
  user?: AuthUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userTokenHelper: UserHelper,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthRequest>();

    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException({
        success: false,
        message: 'Unauthorized',
      });
    }

    const token = authorization.split(' ')[1] || authorization;

    const verify = this.userTokenHelper.verifyToken(token);

    if (!verify.success || !verify.data?.userId) {
      throw new UnauthorizedException({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { userId } = verify.data;

    let user: AuthUser | null = null;

    const checkUserFromRedis =
      await this.userTokenHelper.getAuthUserInRedis(userId);

    if (checkUserFromRedis.success && checkUserFromRedis.user) {
      user = checkUserFromRedis.user;
    } else {
      const dbUser = await this.userRepository.findById(userId);

      if (dbUser) {
        const role = dbUser.role_id
          ? await this.roleRepository.findByIdWithPrivileges(dbUser.role_id)
          : null;

        user = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone,
          status: dbUser.status,
          address: dbUser.address,
          account_verified: dbUser.account_verified,
          role_id: dbUser.role_id ?? null,
          priviles: role?.privileges?.map((p) => p.privilege) ?? [],
        };
      }
    }

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (user.status === USER_STATUS.BLOCKED) {
      throw new UnauthorizedException({
        success: false,
        message: 'Your account was disabled',
      });
    }

    req.user = user;

    return true;
  }
}
