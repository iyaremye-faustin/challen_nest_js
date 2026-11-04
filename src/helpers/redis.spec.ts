import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis';

const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  quit: jest.fn(),
};

jest.mock('ioredis', () => jest.fn().mockImplementation(() => mockRedisClient));

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config: Record<string, unknown> = {
                'redis.host': 'localhost',
                'redis.port': 6379,
                'redis.password': undefined,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getClient', () => {
    it('should return the redis client', () => {
      expect(service.getClient()).toBeDefined();
    });
  });

  describe('get', () => {
    it('should call redis get with the given key', async () => {
      mockRedisClient.get.mockResolvedValue('cached-value');
      const result = await service.get('test-key');
      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
      expect(result).toBe('cached-value');
    });

    it('should return null when key does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      const result = await service.get('missing-key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should call redis set without TTL', async () => {
      mockRedisClient.set.mockResolvedValue('OK');
      await service.set('key', 'value');
      expect(mockRedisClient.set).toHaveBeenCalledWith('key', 'value');
    });

    it('should call redis set with EX flag when TTL is provided', async () => {
      mockRedisClient.set.mockResolvedValue('OK');
      await service.set('key', 'value', 3600);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'key',
        'value',
        'EX',
        3600,
      );
    });
  });

  describe('del', () => {
    it('should call redis del with the given key', async () => {
      mockRedisClient.del.mockResolvedValue(1);
      const result = await service.del('test-key');
      expect(mockRedisClient.del).toHaveBeenCalledWith('test-key');
      expect(result).toBe(1);
    });
  });

  describe('onModuleDestroy', () => {
    it('should quit the redis client', async () => {
      mockRedisClient.quit.mockResolvedValue('OK');
      await service.onModuleDestroy();
      expect(mockRedisClient.quit).toHaveBeenCalled();
    });
  });
});
