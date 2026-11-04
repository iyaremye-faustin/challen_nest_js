import { Injectable } from '@nestjs/common';
import { RedisService } from '../../helpers/redis';
import { logger } from '../../helpers/logger';

const KEY_PREFIX = 'reports';
const VERSION_KEY = `${KEY_PREFIX}:version`;
const TTL_SECONDS = 15 * 60;

export const GLOBAL_SCOPE = 'GLOBAL';

@Injectable()
export class ReportCacheService {
  constructor(private readonly redisService: RedisService) {}

  async cached<T>(segments: string[], produce: () => Promise<T>): Promise<T> {
    const key = await this.buildKey(segments);

    if (key) {
      const hit = await this.read(key);
      if (hit !== null) return hit as T;
    }

    const fresh = await produce();
    const payload = JSON.stringify(fresh);
    if (payload === undefined) return fresh;

    if (key) await this.write(key, payload);
    return JSON.parse(payload) as T;
  }

  async invalidate(): Promise<void> {
    try {
      await this.redisService.incr(VERSION_KEY);
    } catch (error) {
      logger.error({ error }, 'Failed to invalidate the reports cache');
    }
  }

  scope(organisationId?: string): string {
    return organisationId ?? GLOBAL_SCOPE;
  }

  private async buildKey(segments: string[]): Promise<string | null> {
    try {
      const version = (await this.redisService.get(VERSION_KEY)) ?? '0';
      return [KEY_PREFIX, `v${version}`, ...segments].join(':');
    } catch (error) {
      logger.error({ error }, 'Reports cache unreachable, serving fresh');
      return null;
    }
  }

  private async read(key: string): Promise<unknown> {
    try {
      const raw = await this.redisService.get(key);
      return raw === null ? null : JSON.parse(raw);
    } catch (error) {
      logger.error({ error, key }, 'Failed to read the reports cache');
      return null;
    }
  }

  private async write(key: string, payload: string): Promise<void> {
    try {
      await this.redisService.set(key, payload, TTL_SECONDS);
    } catch (error) {
      logger.error({ error, key }, 'Failed to write the reports cache');
    }
  }
}
