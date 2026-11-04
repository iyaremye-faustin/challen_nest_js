import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PrivilegesService } from './privileges.service';
import { AuthUser } from '../../types/common.types';
import { RequirePermissions } from '../../common/guards/permission-guard/require-permissions.decorator';
import { AllPrivileges } from '../../constants/privileges';

@ApiTags('Privileges')
@ApiBearerAuth('access-token')
@Controller('privileges')
export class PrivilegesController {
  constructor(private readonly privilegesService: PrivilegesService) {}

  @Get()
  @RequirePermissions(AllPrivileges.CAN_CREATE_ROLE)
  @ApiOperation({
    summary: 'Get available privileges for the current user role',
  })
  @ApiResponse({ status: 200, description: 'List of privileges' })
  findAll(@Req() req: Request & { user?: AuthUser }) {
    return this.privilegesService.findAll(req.user!.role_id!);
  }
}
