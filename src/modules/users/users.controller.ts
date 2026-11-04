import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Put,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/request/create-user.dto';
import { ResendActivationEmailDto } from './dto/request/resend-activation-email.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { ChangePasswordDto } from './dto/request/change-password.dto';
import { ChangeUserStatusDto } from './dto/request/change-user-status.dto';
import { ChangeUserRoleDto } from './dto/request/change-user-role.dto';
import { RequirePermissions } from '../../common/guards/permission-guard/require-permissions.decorator';
import { AllPrivileges } from '../../constants/privileges';
import { AuthUser } from '../../types/common.types';
import {
  parsePagination,
  ApiPaginationQuery,
} from '../../helpers/pagination.helper';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(AllPrivileges.CAN_CREATE_USER)
  @ApiOperation({
    summary: 'Create a new user in the authenticated organisation',
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiBody({ type: CreateUserDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('resend-activation-email')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(AllPrivileges.CAN_CREATE_USER)
  @ApiOperation({
    summary:
      'Resend the activation email to a pending user in the authenticated organisation',
  })
  @ApiResponse({
    status: 200,
    description: 'Activation email resent successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 400,
    description: 'User account is not pending',
  })
  @ApiBody({ type: ResendActivationEmailDto })
  resendActivationEmail(
    @Body() resendActivationEmailDto: ResendActivationEmailDto,
  ) {
    return this.usersService.resendActivationEmail(
      resendActivationEmailDto.email,
    );
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @RequirePermissions(AllPrivileges.CAN_VIEW_USER)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiPaginationQuery()
  findAll(@Query() query: { page?: string; limit?: string }) {
    return this.usersService.findAll(parsePagination(query));
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or incorrect current password',
  })
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.usersService.changePassword(req.user!.id, changePasswordDto);
  }

  @Put('change-user-status')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(AllPrivileges.CAN_CHANGE_USER_STATUS)
  @ApiOperation({
    summary: 'Change user status within the authenticated organisation',
  })
  @ApiResponse({ status: 200, description: 'User status changed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or user has pending status',
  })
  changeUserStatus(
    @Body() changeUserStatusDto: ChangeUserStatusDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.usersService.changeUserStatus(req.user!, changeUserStatusDto);
  }

  @Put('change-user-role')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(AllPrivileges.CAN_CHANGE_USER_ROLE)
  @ApiOperation({
    summary: 'Change user role within the authenticated organisation',
  })
  @ApiResponse({ status: 200, description: 'User role changed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or invalid role',
  })
  changeUserRole(
    @Body() changeUserRoleDto: ChangeUserRoleDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    return this.usersService.changeUserRole(req.user!, changeUserRoleDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(AllPrivileges.CAN_EDIT_USER)
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
}
