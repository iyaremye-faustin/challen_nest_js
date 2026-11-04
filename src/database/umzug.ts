import { Sequelize } from 'sequelize-typescript';
import { SequelizeStorage, Umzug, MigrationFn } from 'umzug';
import * as path from 'node:path';
export const createUmzug = (sequelize: Sequelize) =>
  new Umzug({
    migrations: {
      glob: path.join(
        __dirname,
        `migrations/*.migration.${process.env.NODE_ENV === 'development' ? 'ts' : 'js'}`,
      ),
      resolve: ({ name, path: filePath }) => {
        // Use dynamic import with proper typing
        const migration = require(filePath!) as {
          up: MigrationFn<Sequelize>;
          down: MigrationFn<Sequelize>;
        };
        return {
          name,
          up: migration.up,
          down: migration.down,
        };
      },
    },
    context: sequelize,
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });
export type Migration = MigrationFn<Sequelize>;
