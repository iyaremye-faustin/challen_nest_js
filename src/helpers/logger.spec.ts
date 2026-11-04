jest.mock('bunyan', () => ({
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn(),
  }),
}));

import * as bunyan from 'bunyan';
import { logger, log } from './logger';

describe('logger', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a bunyan logger', () => {
    expect(bunyan.createLogger).toHaveBeenCalled();
    expect(logger).toBeDefined();
  });

  describe('log', () => {
    it('should call logger.info with event and payload', () => {
      log({ event: 'TEST_EVENT', payload: { data: 'test' } });
      expect(logger.info).toHaveBeenCalledWith({
        event: 'TEST_EVENT',
        payload: { data: 'test' },
        path: undefined,
        error: undefined,
      });
    });

    it('should default to info level when no level is provided', () => {
      const error = new Error('something went wrong');
      log({ event: 'ERROR_EVENT', error });
      expect(logger.info).toHaveBeenCalledWith({
        event: 'ERROR_EVENT',
        payload: undefined,
        path: undefined,
        error,
      });
    });

    it('should call logger.error when level is error', () => {
      const error = new Error('something went wrong');
      log({ level: 'error', event: 'ERROR_EVENT', error });
      expect(logger.error).toHaveBeenCalledWith({
        event: 'ERROR_EVENT',
        payload: undefined,
        path: undefined,
        error,
      });
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should call logger.warn when level is warn', () => {
      log({ level: 'warn', event: 'WARN_EVENT' });
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'WARN_EVENT' }),
      );
    });

    it('should pass extra fields through to logger', () => {
      log({ event: 'EXTRA', customField: 'value' });
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'EXTRA', customField: 'value' }),
      );
    });

    it('should handle call with no arguments', () => {
      log({});
      expect(logger.info).toHaveBeenCalledWith({
        event: undefined,
        payload: undefined,
        path: undefined,
        error: undefined,
      });
    });
  });
});
