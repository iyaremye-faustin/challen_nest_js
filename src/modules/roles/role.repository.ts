import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction, fn, col, where as whereFn } from 'sequelize';
import { BaseRepository } from '../../common/base.repository';
import { Role } from '../../database/models/role.model';
import { RolePrivilege } from '../../database/models/role-privilege.model';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor(
    @InjectModel(Role) roleModel: typeof Role,
    @InjectModel(RolePrivilege)
    private readonly rolePrivilegeModel: typeof RolePrivilege,
  ) {
    super(roleModel);
  }

  async nameExists(name: string, excludeId?: string): Promise<boolean> {
    const count = await this.model.count({
      where: {
        ...(excludeId && { id: { [Op.ne]: excludeId } }),
        [Op.and]: whereFn(fn('lower', col('name')), name.trim().toLowerCase()),
      },
    });
    return count > 0;
  }

  async findByIdWithPrivileges(id: string): Promise<Role | null> {
    return this.model.findByPk(id, { include: [RolePrivilege] });
  }

  async setPrivileges(
    roleId: string,
    privileges: string[],
    transaction?: Transaction,
  ): Promise<void> {
    await this.rolePrivilegeModel.destroy({
      where: { role_id: roleId },
      transaction,
    });
    if (privileges.length === 0) return;
    await this.rolePrivilegeModel.bulkCreate(
      privileges.map((privilege) => ({ role_id: roleId, privilege })),
      { transaction },
    );
  }
}
