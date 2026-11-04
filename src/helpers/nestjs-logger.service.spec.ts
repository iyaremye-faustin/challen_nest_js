/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('./logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn(),
  },
}));

import { logger } from './logger';
import { BunyanLoggerService } from './nestjs-logger.service';

describe('BunyanLoggerService', () => {
  let service: BunyanLoggerService;

  beforeEach(() => {
    service = new BunyanLoggerService();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('log() calls logger.info with message and context', () => {
    service.log('hello', 'AppModule');

    expect(logger.info).toHaveBeenCalledWith({ context: 'AppModule' }, 'hello');
  });

  it('log() calls logger.info with undefined context when omitted', () => {
    service.log('hello');

    expect(logger.info).toHaveBeenCalledWith({ context: undefined }, 'hello');
  });

  it('error() calls logger.error with message, trace and context', () => {
    service.error('something went wrong', 'stack trace', 'AuthModule');

    expect(logger.error).toHaveBeenCalledWith(
      { context: 'AuthModule', trace: 'stack trace' },
      'something went wrong',
    );
  });

  it('error() calls logger.error with undefined trace and context when omitted', () => {
    service.error('something went wrong');

    expect(logger.error).toHaveBeenCalledWith(
      { context: undefined, trace: undefined },
      'something went wrong',
    );
  });

  it('warn() calls logger.warn with message and context', () => {
    service.warn('low memory', 'HealthModule');

    expect(logger.warn).toHaveBeenCalledWith(
      { context: 'HealthModule' },
      'low memory',
    );
  });

  it('warn() calls logger.warn with undefined context when omitted', () => {
    service.warn('low memory');

    expect(logger.warn).toHaveBeenCalledWith(
      { context: undefined },
      'low memory',
    );
  });

  it('debug() calls logger.debug with message and context', () => {
    service.debug('debug info', 'DbModule');

    expect(logger.debug).toHaveBeenCalledWith(
      { context: 'DbModule' },
      'debug info',
    );
  });

  it('debug() calls logger.debug with undefined context when omitted', () => {
    service.debug('debug info');

    expect(logger.debug).toHaveBeenCalledWith(
      { context: undefined },
      'debug info',
    );
  });

  it('verbose() calls logger.trace with message and context', () => {
    service.verbose('verbose output', 'CacheModule');

    expect(logger.trace).toHaveBeenCalledWith(
      { context: 'CacheModule' },
      'verbose output',
    );
  });

  it('verbose() calls logger.trace with undefined context when omitted', () => {
    service.verbose('verbose output');

    expect(logger.trace).toHaveBeenCalledWith(
      { context: undefined },
      'verbose output',
    );
  });

  it('fatal() calls logger.fatal with message and context', () => {
    service.fatal('system crash', 'CoreModule');

    expect(logger.fatal).toHaveBeenCalledWith(
      { context: 'CoreModule' },
      'system crash',
    );
  });

  it('fatal() calls logger.fatal with undefined context when omitted', () => {
    service.fatal('system crash');

    expect(logger.fatal).toHaveBeenCalledWith(
      { context: undefined },
      'system crash',
    );
  });
});
