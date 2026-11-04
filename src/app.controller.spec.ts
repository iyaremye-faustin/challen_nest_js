import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const mockAppService = {
  getHealthCheck: jest.fn(),
  getAppInfo: jest.fn(),
};

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealthCheck', () => {
    it('should delegate to AppService and return health check response', () => {
      const mockResponse = {
        status: 'ok',
        timestamp: '2026-01-01T00:00:00.000Z',
        environment: 'test',
      };
      mockAppService.getHealthCheck.mockReturnValue(mockResponse);

      const result = controller.getHealthCheck();

      expect(result).toEqual(mockResponse);
      expect(mockAppService.getHealthCheck).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAppInfo', () => {
    it('should delegate to AppService and return app info response', () => {
      const mockResponse = {
        name: 'challenge',
        version: '1.0.0',
        environment: 'test',
        timestamp: '2026-01-01T00:00:00.000Z',
      };
      mockAppService.getAppInfo.mockReturnValue(mockResponse);

      const result = controller.getAppInfo();

      expect(result).toEqual(mockResponse);
      expect(mockAppService.getAppInfo).toHaveBeenCalledTimes(1);
    });
  });
});
