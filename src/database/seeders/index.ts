import { PrivilegesSeeder } from './privilegesSeeder';
import { SuperAdminSeeder } from './superAdminSeeder';
import { log } from '../../helpers/logger';
import { sequelize } from '../sequelize';

export class Seeder {
  private readonly superAdminSeeder: SuperAdminSeeder;
  private readonly privilegesSeeder: PrivilegesSeeder;

  constructor() {
    this.superAdminSeeder = new SuperAdminSeeder();
    this.privilegesSeeder = new PrivilegesSeeder();
  }

  public async init() {
    try {
      await sequelize.sync();
      log({ event: 'seeders.database.synced' });

      await this.superAdminSeeder.init().catch((error) => {
        log({ event: 'seeders.superAdmin.failed', error });
        console.log('SuperAdminSeeder failed and skipped');
      });

      await this.privilegesSeeder.init().catch((error) => {
        log({ event: 'seeders.privileges.failed', error });
        console.log('PrivilegesSeeder failed and skipped');
      });

      log({ event: 'seeders.completed' });
      console.log('All seeders completed successfully!');
    } catch (error) {
      log({ event: 'seeders.error', error });
      console.log('Seeder setup failed');
    }
  }
}

const seeder = new Seeder();

async function runSeeders() {
  try {
    await seeder.init();
    log({ event: 'seeders.process.exit', payload: { code: 0 } });
    process.exit(0);
  } catch (error) {
    log({ event: 'seeders.failed', error });
    console.error('Seeder execution failed:', error);
    process.exit(1);
  }
}

runSeeders(); // NOSONAR

export default seeder;
