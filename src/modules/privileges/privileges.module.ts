import { Module } from '@nestjs/common';
import { PrivilegesService } from './privileges.service';
import { PrivilegesController } from './privileges.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [RolesModule],
  controllers: [PrivilegesController],
  providers: [PrivilegesService],
})
export class PrivilegesModule {}
