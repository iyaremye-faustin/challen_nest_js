import { Global, Module } from '@nestjs/common';
import { ResponseService } from './response.service';
import { UserHelper } from '../helpers/userHelper';
import { EmailHelper } from '../helpers/emailHelper';
import { ReportCacheService } from './services/report-cache.service';
import { RedisModule } from '../modules/redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  providers: [ResponseService, UserHelper, EmailHelper, ReportCacheService],
  exports: [ResponseService, UserHelper, EmailHelper, ReportCacheService],
})
export class CommonModule {}
