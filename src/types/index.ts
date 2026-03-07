export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserDTO {
  email?: string;
  name?: string;
  password?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  name: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export interface JsonFilterOptions<T> {
  inputPath: string;
  outputPath: string;
  transform?: (item: T) => any;
  filterFn: (item: T) => boolean;
  prettyPrint?: boolean;
}

export * from './card';