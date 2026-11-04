import bcrypt from 'bcryptjs';
import { sequelize } from '../sequelize';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { config as configuration } from '../../config';
import { USER_STATUS } from '../../constants/general';
import { log } from '../../helpers/logger';

const SUPER_ADMIN_ROLE_NAME = 'Super Admin';

export class SuperAdminSeeder {
  public async init() {
    const config = configuration();
    const { name, email, password, phone } = config.defaultAdmin;

    if (!name || !email || !password || !phone) {
      throw new Error(
        'Default admin credentials are not configured (DEFAULT_ORGANIZATION_ADMIN_USER_*)',
      );
    }

    return sequelize.transaction(async (transaction) => {
      const [role, roleCreated] = await Role.findOrCreate({
        where: { is_superadmin: true },
        defaults: {
          name: SUPER_ADMIN_ROLE_NAME,
          is_superadmin: true,
          is_admin: true,
        },
        transaction,
      });

      log({
        event: roleCreated
          ? 'seeders.superAdmin.role.created'
          : 'seeders.superAdmin.role.exists',
        payload: { id: role.id },
      });

      const existing = await User.findOne({
        where: { email },
        transaction,
      });

      if (existing) {
        log({
          event: 'seeders.superAdmin.user.exists',
          payload: { id: existing.id },
        });
        return true;
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const user = await User.create(
        {
          name,
          email,
          phone,
          password: hashedPassword,
          salt,
          role_id: role.id,
          status: USER_STATUS.ACTIVE,
          account_verified: true,
        },
        { transaction },
      );

      log({
        event: 'seeders.superAdmin.user.created',
        payload: { id: user.id, email: user.email },
      });

      return true;
    });
  }
}
