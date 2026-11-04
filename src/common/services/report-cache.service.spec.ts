import { Test, TestingModule } from '@nestjs/testing';
import { GLOBAL_SCOPE, ReportCacheService } from './report-cache.service';
import { RedisService } from '../../helpers/redis';

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  incr: jest.fn(),
};

describe('ReportCacheService', () => {
  let service: ReportCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportCacheService,
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<ReportCacheService>(ReportCacheService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('cached', () => {
    it('should run the producer and store the result on a miss', async () => {
      mockRedisService.get
        .mockResolvedValueOnce('4')
        .mockResolvedValueOnce(null);
      const produce = jest.fn().mockResolvedValue({ total: 7 });

      const result = await service.cached(['budgets', GLOBAL_SCOPE], produce);

      expect(result).toEqual({ total: 7 });
      expect(produce).toHaveBeenCalledTimes(1);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'reports:v4:budgets:GLOBAL',
        JSON.stringify({ total: 7 }),
        900,
      );
    });

    it('should serve the cached value without running the producer on a hit', async () => {
      mockRedisService.get
        .mockResolvedValueOnce('2')
        .mockResolvedValueOnce(JSON.stringify({ total: 7 }));
      const produce = jest.fn();

      const result = await service.cached(['budgets', GLOBAL_SCOPE], produce);

      expect(result).toEqual({ total: 7 });
      expect(produce).not.toHaveBeenCalled();
      expect(mockRedisService.set).not.toHaveBeenCalled();
    });

    it('should treat a missing version as version 0', async () => {
      mockRedisService.get
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await service.cached(['program-streams'], () =>
        Promise.resolve({ total: 1 }),
      );

      expect(mockRedisService.set).toHaveBeenCalledWith(
        'reports:v0:program-streams',
        expect.any(String),
        900,
      );
    });

    it('should key entries per organisation scope so partners never share a payload', async () => {
      mockRedisService.get.mockResolvedValue(null);

      await service.cached(['budgets', service.scope('org-1')], () =>
        Promise.resolve({ total: 1 }),
      );
      await service.cached(['budgets', service.scope('org-2')], () =>
        Promise.resolve({ total: 2 }),
      );

      expect(mockRedisService.set.mock.calls[0][0]).toBe(
        'reports:v0:budgets:org-1',
      );
      expect(mockRedisService.set.mock.calls[1][0]).toBe(
        'reports:v0:budgets:org-2',
      );
    });

    it('should serve fresh data when redis is unreachable', async () => {
      mockRedisService.get.mockRejectedValue(new Error('ECONNREFUSED'));
      const produce = jest.fn().mockResolvedValue({ total: 7 });

      const result = await service.cached(['budgets'], produce);

      expect(result).toEqual({ total: 7 });
      expect(produce).toHaveBeenCalledTimes(1);
      expect(mockRedisService.set).not.toHaveBeenCalled();
    });

    it('should still return fresh data when the write fails', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockRedisService.set.mockRejectedValue(new Error('OOM'));

      const result = await service.cached(['budgets'], () =>
        Promise.resolve({ total: 7 }),
      );

      expect(result).toEqual({ total: 7 });
    });

    it('should fall back to the producer when the cached entry is corrupt', async () => {
      mockRedisService.get
        .mockResolvedValueOnce('1')
        .mockResolvedValueOnce('{not json');
      const produce = jest.fn().mockResolvedValue({ total: 7 });

      const result = await service.cached(['budgets'], produce);

      expect(result).toEqual({ total: 7 });
      expect(produce).toHaveBeenCalledTimes(1);
    });

    it('should not cache when the producer throws', async () => {
      mockRedisService.get.mockResolvedValue(null);
      const produce = jest.fn().mockRejectedValue(new Error('pillar missing'));

      await expect(service.cached(['budgets'], produce)).rejects.toThrow(
        'pillar missing',
      );
      expect(mockRedisService.set).not.toHaveBeenCalled();
    });

    it('should return the same plain shape on a miss as on a hit', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const result = await service.cached(['pillar-projects'], () =>
        Promise.resolve({ created_at: new Date('2026-01-01T00:00:00.000Z') }),
      );

      expect(result).toEqual({ created_at: '2026-01-01T00:00:00.000Z' });
    });
  });

  describe('invalidate', () => {
    it('should bump the version so every existing entry is orphaned', async () => {
      await service.invalidate();

      expect(mockRedisService.incr).toHaveBeenCalledWith('reports:version');
    });

    it('should swallow redis failures', async () => {
      mockRedisService.incr.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(service.invalidate()).resolves.toBeUndefined();
    });
  });

  describe('scope', () => {
    it('should fall back to the global scope for foundation callers', () => {
      expect(service.scope()).toBe(GLOBAL_SCOPE);
      expect(service.scope('org-1')).toBe('org-1');
    });
  });
});
