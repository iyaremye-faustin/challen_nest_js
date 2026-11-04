import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleRepository } from './role.repository';
import { PaginationOptions } from '../../common/base.repository';

@Injectable()
export class RolesService {
  constructor(
    private readonly roleRepository: RoleRepository,
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const nameExists = await this.roleRepository.nameExists(createRoleDto.name);
    if (nameExists) {
      throw new ConflictException({
        success: false,
        message: 'A role with this name already exists',
      });
    }

    try {
      const { privileges = [], ...roleData } = createRoleDto;
      const role = await this.sequelize.transaction(async (transaction) => {
        const created = await this.roleRepository.create(roleData, {
          transaction,
        });
        await this.roleRepository.setPrivileges(
          created.id,
          privileges,
          transaction,
        );
        return created;
      });
      const withPrivileges = await this.roleRepository.findByIdWithPrivileges(
        role.id,
      );
      return { success: true, data: withPrivileges };
    } catch {
      return { success: false, message: 'Failed to create role' };
    }
  }

  async findAll(pagination?: PaginationOptions) {
    const result = await this.roleRepository.findAll(
      undefined,
      pagination,
      undefined,
      { include: [{ association: 'privileges' }] },
    );
    return {
      success: true,
      data: result,
      message: 'Roles retrieved successfully',
    };
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findByIdWithPrivileges(id);
    if (!role) {
      throw new NotFoundException({
        success: false,
        message: 'Role not found',
      });
    }
    return {
      success: true,
      data: role,
      message: 'Role retrieved successfully',
    };
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    await this.findOne(id);

    if (updateRoleDto.name) {
      const nameExists = await this.roleRepository.nameExists(
        updateRoleDto.name,
        id,
      );
      if (nameExists) {
        throw new ConflictException({
          success: false,
          message: 'A role with this name already exists',
        });
      }
    }

    const { privileges, ...roleData } = updateRoleDto;
    await this.sequelize.transaction(async (transaction) => {
      if (Object.keys(roleData).length > 0) {
        await this.roleRepository.update(id, roleData, { transaction });
      }
      if (privileges !== undefined) {
        await this.roleRepository.setPrivileges(id, privileges, transaction);
      }
    });
    return { success: true, data: null, message: 'Role updated successfully' };
  }
}
