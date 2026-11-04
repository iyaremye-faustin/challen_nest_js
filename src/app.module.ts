import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { config as configuration } from './config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RedisModule } from './modules/redis/redis.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { UtilityModule } from './modules/utility/utility.module';
import { RolesModule } from './modules/roles/roles.module';
import { JwtAuthGuard } from './common/guards/jwt-auth/jwt-auth.guard';
import { PermissionGuard } from './common/guards/permission-guard/permission-guard.guard';
import { PrivilegesModule } from './modules/privileges/privileges.module';
import { LoansModule } from './modules/loans/loans.module';
import { LoanPaymentsModule } from './modules/loan-payments/loan-payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    RedisModule,
    UtilityModule,
    CommonModule,
    UsersModule,
    RolesModule,
    AuthModule,
    PrivilegesModule,
    LoansModule,
    LoanPaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
})
export class AppModule {}
