import * as bunyan from 'bunyan';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { LoggerEvent } from '../constants/loggerEvent';

const streams: bunyan.Stream[] = [{ level: 'debug', stream: process.stdout }];

if (process.env.NODE_ENV !== 'test') {
  const logDir = path.join(__dirname, '../../logs');
  fs.mkdirSync(logDir, { recursive: true });
  streams.push({
    type: 'rotating-file',
    level: 'info',
    path: path.join(logDir, 'app.log'),
    period: '1d',
    count: 14,
  } as bunyan.Stream);
}

const options: bunyan.LoggerOptions = {
  name: 'challenge',
  streams,
};

export const logger = bunyan.createLogger(options);

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export const log = <Payload>({
  level = 'info',
  event,
  payload,
  path,
  error,
  ...rest
}: {
  level?: LogLevel;
  event?: LoggerEvent | string;
  payload?: Payload;
  path?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) => {
  logger[level]({
    event,
    payload,
    path,
    error,
    ...rest,
  });
};
