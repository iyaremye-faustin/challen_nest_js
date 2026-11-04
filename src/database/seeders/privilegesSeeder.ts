import { AllPrivileges } from '../../constants/privileges';
import { sequelize } from '../sequelize';
import { Role } from '../models/role.model';
import { RolePrivilege } from '../models/role-privilege.model';
import { log } from '../../helpers/logger';

export class PrivilegesSeeder {
  public async init() {
    return sequelize.transaction(async (transaction) => {
      const RoleModel = sequelize.model(Role);
      const RolePrivilegeModel = sequelize.model(RolePrivilege);

      const superAdminRole = await RoleModel.findOne({
        where: { is_superadmin: true },
        transaction,
      });

      if (!superAdminRole) {
        throw new Error('Super admin role not found');
      }

      log({
        event: 'privileges.role.found',
        payload: { id: superAdminRole.id },
      });

      const privileges = Object.values(AllPrivileges);

      await RolePrivilegeModel.destroy({
        where: { role_id: superAdminRole.id },
        transaction,
      });
      await RolePrivilegeModel.bulkCreate(
        privileges.map((privilege) => ({
          role_id: superAdminRole.id,
          privilege,
        })),
        { transaction },
      );

      log({
        event: 'privileges.role.updated',
        payload: {
          id: superAdminRole.id,
          count: privileges.length,
        },
      });

      return true;
    });
  }
}
