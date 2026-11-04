import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import moment from 'moment';
import { ResponseWrapper } from 'src/types/common.types';

@Injectable()
export class ResponseService {
  responseWrapper = <Data>({
    res,
    message,
    status,
    ...rest
  }: ResponseWrapper<Data>): Response =>
    res.status(status).json({
      status,
      message,
      ...rest,
      timestamp: moment().format('YYYY-MM-DD h:mm:ss a').toUpperCase(),
    });
}
