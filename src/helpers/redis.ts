import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      password: this.configService.get<string>('redis.password') || undefined,
    });
  }

  getClient() {
    return this.client;
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      return this.client.set(key, value, 'EX', ttl);
    }
    return this.client.set(key, value);
  }

  async del(key: string) {
    return this.client.del(key);
  }

  async incr(key: string) {
    return this.client.incr(key);
  }

  async expire(key: string, ttl: number) {
    return this.client.expire(key, ttl);
  }

  async ttl(key: string) {
    return this.client.ttl(key);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
