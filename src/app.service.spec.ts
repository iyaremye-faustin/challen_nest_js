import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

const mockConfigService = {
  get: jest.fn(),
};

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealthCheck', () => {
    it('should return ok status with configured environment', () => {
      mockConfigService.get.mockReturnValue('test');

      const result = service.getHealthCheck();

      expect(result.status).toBe('ok');
      expect(result.environment).toBe('test');
      expect(typeof result.timestamp).toBe('string');
    });

    it('should return development as default when node_env is not set', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const result = service.getHealthCheck();

      expect(result.status).toBe('ok');
      expect(result.environment).toBe('development');
    });
  });

  describe('getAppInfo', () => {
    it('should return app info with configured values', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const config: Record<string, string> = {
          app_name: 'TestApp',
          version: '1.0.0',
          node_env: 'production',
        };
        return config[key];
      });

      const result = service.getAppInfo();

      expect(result.name).toBe('TestApp');
      expect(result.version).toBe('1.0.0');
      expect(result.environment).toBe('production');
      expect(typeof result.timestamp).toBe('string');
    });

    it('should return defaults when config values are not set', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const result = service.getAppInfo();

      expect(result.name).toBe('challenge');
      expect(result.version).toBe('0.0.1');
      expect(result.environment).toBe('development');
    });
  });
});
