import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { ResponseService } from './response.service';

describe('ResponseService', () => {
  let service: ResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseService],
    }).compile();

    service = module.get<ResponseService>(ResponseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('responseWrapper', () => {
    it('should call res.status with the given status code and return JSON', () => {
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockRes = { status: mockStatus } as unknown as Response;

      service.responseWrapper({
        res: mockRes,
        status: 200,
        message: 'Success',
        data: { id: 1 },
      });

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 200,
          message: 'Success',
          data: { id: 1 },
          timestamp: expect.any(String),
        }),
      );
    });

    it('should work with a 404 status and no extra data', () => {
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockRes = { status: mockStatus } as unknown as Response;

      service.responseWrapper({
        res: mockRes,
        status: 404,
        message: 'Not Found',
      });

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ status: 404, message: 'Not Found' }),
      );
    });

    it('should include timestamp in uppercase format', () => {
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockRes = { status: mockStatus } as unknown as Response;

      service.responseWrapper({ res: mockRes, status: 200, message: 'OK' });

      const calledWith = mockJson.mock.calls[0][0];
      expect(calledWith.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2} \d{1,2}:\d{2}:\d{2} (AM|PM)$/i,
      );
    });
  });
});
