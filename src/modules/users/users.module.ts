import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './user.repository';
import { User } from '../../database/models/user.model';
import { RolesModule } from '../roles/roles.module';
import { UtilityModule } from '../utility/utility.module';

@Module({
  imports: [SequelizeModule.forFeature([User]), RolesModule, UtilityModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UserRepository],
})
export class UsersModule {}
