import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { ChangePasswordDto } from './dto/request/change-password.dto';
import { ChangeUserStatusDto } from './dto/request/change-user-status.dto';
import { ChangeUserRoleDto } from './dto/request/change-user-role.dto';
import { UserRepository } from './user.repository';
import { RoleRepository } from '../roles/role.repository';
import { EmailHelper } from '../../helpers/emailHelper';
import { USER_STATUS } from '../../constants/general';
import { PaginationOptions } from '../../common/base.repository';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/response/user-response.dto';
import { logger } from '../../helpers/logger';
import { UtilityService } from '../utility/utility.service';
import { AuthUser } from '../../types/common.types';
import { Role } from '../../database/models/role.model';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly emailHelper: EmailHelper,
    private readonly utilityService: UtilityService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const emailTaken = await this.userRepository.findByEmail(
        createUserDto.email,
      );
      if (emailTaken) {
        throw new ConflictException({
          success: false,
          message: 'A user with this email already exists',
        });
      }

      const phoneTaken = await this.userRepository.findByPhone(
        createUserDto.phone,
      );
      if (phoneTaken) {
        throw new ConflictException({
          success: false,
          message: 'A user with this phone number already exists',
        });
      }

      const role = await this.roleRepository.findById(createUserDto.role_id);
      if (!role) {
        throw new NotFoundException({
          success: false,
          message: 'The specified role does not exist',
        });
      }

      const user = await this.userRepository.create({
        name: createUserDto.name,
        email: createUserDto.email,
        phone: createUserDto.phone,
        address: createUserDto.address,
        role_id: createUserDto.role_id,
        status: USER_STATUS.PENDING,
      });

      this.emailHelper
        .sendActivationEmail({
          to: user.email,
          name: user.name,
          userId: user.id,
        })
        .catch((error) => {
          logger.error(
            { error, userId: user.id },
            'Failed to send activation email (non-blocking)',
          );
        });

      return { success: true, message: 'User created successfully' };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to create user',
      });
    }
  }

  async resendActivationEmail(email: string) {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new NotFoundException({
          success: false,
          message: 'No user found with this email',
        });
      }

      if (user.status !== USER_STATUS.PENDING) {
        throw new BadRequestException({
          success: false,
          message: 'This account is already activated',
        });
      }

      await this.emailHelper.sendActivationEmail({
        to: user.email,
        name: user.name,
        userId: user.id,
      });

      return {
        success: true,
        message: 'Activation email resent successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to resend activation email',
      });
    }
  }

  async findAll(pagination?: PaginationOptions) {
    const result = await this.userRepository.findAll(undefined, pagination, undefined, {
      include: [{ model: Role, attributes: ['id', 'name'] }],
    });
    return {
      success: true,
      data: {
        ...result,
        data: plainToInstance(
          UserResponseDto,
          result.data.map((u) => {
            const plain = u.toJSON?.() ?? u;
            return {
              ...plain,
              role: plain.role
                ? { id: plain.role.id, name: plain.role.name }
                : undefined,
            };
          }),
        ),
      },
      message: 'Users retrieved successfully',
    };
  }

  async findOne(id: string) {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    return { success: true, data: null, message: 'User updated successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException({
          success: false,
          message: 'User not found',
        });
      }

      const isCurrentPasswordValid = this.utilityService.passwordCompare(
        changePasswordDto.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestException({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      const salt = this.utilityService.passwordSalt();
      const hashedPassword = this.utilityService.passwordHash(
        changePasswordDto.newPassword,
        salt,
      );

      await this.userRepository.update(userId, {
        password: hashedPassword,
        salt,
      });

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to change password',
      });
    }
  }

  async changeUserStatus(
    authUser: AuthUser,
    changeUserStatusDto: ChangeUserStatusDto,
  ) {
    try {
      const { userId, status } = changeUserStatusDto;

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException({
          success: false,
          message: 'User not found',
        });
      }

      if (user.id === authUser.id) {
        throw new ForbiddenException({
          success: false,
          message: 'You cannot change your own status',
        });
      }

      if (user.status === USER_STATUS.PENDING) {
        throw new BadRequestException({
          success: false,
          message: 'Cannot change status of a user with PENDING status',
        });
      }

      await this.userRepository.update(user.id, { status });

      return { success: true, message: 'User status changed successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to change user status',
      });
    }
  }

  async changeUserRole(
    authUser: AuthUser,
    changeUserRoleDto: ChangeUserRoleDto,
  ) {
    try {
      const { userId, roleId } = changeUserRoleDto;

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException({
          success: false,
          message: 'User not found',
        });
      }

      if (user.id === authUser.id) {
        throw new ForbiddenException({
          success: false,
          message: 'You cannot change your own role',
        });
      }

      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new NotFoundException({
          success: false,
          message: 'The specified role does not exist',
        });
      }

      await this.userRepository.update(user.id, { role_id: roleId });

      return {
        success: true,
        data: null,
        message: 'User role changed successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to change user role',
      });
    }
  }
}
