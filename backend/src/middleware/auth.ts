/**
 * API Key Authentication Middleware
 */
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../utils/logger';

export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.header('X-API-KEY');

  if (!apiKey) {
    logger.warn('Request rejected: Missing API key', { 
      ip: req.ip,
      path: req.path 
    });
    res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required. Please provide X-API-KEY header.',
    });
    return;
  }

  if (apiKey !== config.apiKey) {
    logger.warn('Request rejected: Invalid API key', { 
      ip: req.ip,
      path: req.path 
    });
    res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key.',
    });
    return;
  }

  next();
}
