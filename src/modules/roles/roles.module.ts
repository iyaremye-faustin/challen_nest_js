import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleRepository } from './role.repository';
import { Role } from '../../database/models/role.model';
import { RolePrivilege } from '../../database/models/role-privilege.model';

@Module({
  imports: [SequelizeModule.forFeature([Role, RolePrivilege])],
  controllers: [RolesController],
  providers: [RolesService, RoleRepository],
  exports: [RoleRepository],
})
export class RolesModule {}
