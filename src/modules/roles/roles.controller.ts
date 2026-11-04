import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  ParseUUIDPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RequirePermissions } from '../../common/guards/permission-guard/require-permissions.decorator';
import { AllPrivileges } from '../../constants/privileges';
import {
  parsePagination,
  ApiPaginationQuery,
} from '../../helpers/pagination.helper';

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(AllPrivileges.CAN_CREATE_ROLE)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiBody({ type: CreateRoleDto })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @RequirePermissions(AllPrivileges.CAN_VIEW_ROLE)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  @ApiPaginationQuery()
  findAll(@Query() query: { page?: string; limit?: string }) {
    return this.rolesService.findAll(parsePagination(query));
  }

  @Get(':id')
  @RequirePermissions(AllPrivileges.CAN_VIEW_ROLE)
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiResponse({ status: 200, description: 'Role found' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(AllPrivileges.CAN_EDIT_ROLE)
  @ApiOperation({ summary: 'Update a role by ID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateRoleDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }
}
