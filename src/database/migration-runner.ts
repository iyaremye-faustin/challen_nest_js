import * as dotenv from 'dotenv';
dotenv.config();
import { bootstrap } from '../bootstrap';
import { Sequelize } from 'sequelize-typescript';
import { createUmzug } from './umzug';

const runMigrations = async () => {
  const app = await bootstrap();
  const sequelize = app.get(Sequelize);

  const umzug = createUmzug(sequelize);

  try {
    await umzug.runAsCLI();
  } finally {
    await sequelize.close();
    await app.close();
  }
};

void runMigrations();
