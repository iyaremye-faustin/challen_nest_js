import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { CommonModule } from '../../common/common.module';
import { UserTokenRepository } from './user-token.repository';
import { UserToken } from '../../database/models/user-token.model';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    CommonModule,
    SequelizeModule.forFeature([UserToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserTokenRepository],
})
export class AuthModule {}
