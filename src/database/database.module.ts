import { SequelizeModule } from '@nestjs/sequelize';
import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { Role } from './models/role.model';
import { RolePrivilege } from './models/role-privilege.model';
import { User } from './models/user.model';
import { UserToken } from './models/user-token.model';
import { Loan } from './models/loan.model';
import { LoanPayment } from './models/loan-payment.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        return {
          dialect: 'mysql',
          autoLoadModels: true,
          repositoryMode: true,
          sync: { force: false, alter: false },
          synchronize: false,
          replication: {
            write: {
              host: config.get<string>('database.master.host'),
              username: config.get<string>('database.master.auth.username'),
              password: config.get<string>('database.master.auth.password'),
              database: config.get<string>('database.master.name'),
              port: Number(config.get<string>('database.master.port')),
            },
            read:
              config
                .get<
                  Array<{
                    host: string;
                    auth: { username: string; password: string };
                    name: string;
                    port: string;
                  }>
                >('database.replicas')
                ?.map((item) => ({
                  host: item.host,
                  username: item.auth.username,
                  password: item.auth.password,
                  database: item.name,
                  port: Number(item.port),
                })) ?? [],
          },
          models: [Role, RolePrivilege, User, UserToken, Loan, LoanPayment],
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [],
})
export class DatabaseModule {}
