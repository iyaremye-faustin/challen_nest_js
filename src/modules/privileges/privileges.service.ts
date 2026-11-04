import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../roles/role.repository';
import { AllPrivileges } from '../../constants/privileges';

@Injectable()
export class PrivilegesService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async findAll(roleId: string) {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException({
        success: false,
        message: 'Role not found',
      });
    }
    return {
      success: true,
      data: Object.values(AllPrivileges),
    };
  }
}
