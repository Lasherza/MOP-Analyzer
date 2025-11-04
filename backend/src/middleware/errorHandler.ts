/**
 * Global Error Handler Middleware
 */
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { APIError } from '../types';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  if (err instanceof AppError) {
    const response: APIError = {
      error: err.name,
      message: err.message,
      statusCode: err.statusCode,
      details: err.details,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Default error
  const response: APIError = {
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
    statusCode: 500,
  };

  res.status(500).json(response);
}
