import { Module, Global } from '@nestjs/common';
import { RedisService } from '../../helpers/redis';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
