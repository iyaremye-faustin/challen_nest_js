import * as dotenv from 'dotenv';
dotenv.config();
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { config as configuration } from '../config';
import { Role } from './models/role.model';
import { RolePrivilege } from './models/role-privilege.model';
import { User } from './models/user.model';
import { UserToken } from './models/user-token.model';
import { Loan } from './models/loan.model';
import { LoanPayment } from './models/loan-payment.model';

const config = configuration();
const database = config.database;
const sequelizeOptions: SequelizeOptions = {
  dialect: 'mysql',
  repositoryMode: true,
  logging: console.warn,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  replication: {
    write: {
      host: database.master.host,
      username: database.master.auth.username,
      password: database.master.auth.password,
      database: database.master.name,
      port: Number(database.master.port),
    },
    read:
      database.replicas.length > 0
        ? database.replicas.map((item) => ({
            host: item.host,
            username: item.auth.username,
            password: item.auth.password,
            database: item.name,
            port: Number(item.port),
          }))
        : [],
  },
  models: [Role, RolePrivilege, User, UserToken, Loan, LoanPayment],
  sync: { alter: false, force: false },
};
export const sequelize = new Sequelize(sequelizeOptions);
