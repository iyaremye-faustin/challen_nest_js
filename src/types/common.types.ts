import { Response } from 'express';
import { type CountryAddress } from '../constants/general';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  address: CountryAddress | null;
  account_verified: boolean;
  role_id: string | null;
  priviles: string[];
}

export interface IMeta {
  total?: number;
  pages?: number;
}

export interface ResponseWrapper<Data> {
  res: Response;
  status: number;
  message?: string;
  context?: string;
  data?: Data;
  meta?: IMeta;
  errors?: Array<{
    message: string;
    field?: string;
    type?: string;
    value?: unknown;
  }>;
  [key: string]: unknown;
}

export interface IPassword {
  salt(): string;
  hash(password: string, salt: string): string;
  compare(password: string, hashedPassword: string, salt: string): boolean;
}
