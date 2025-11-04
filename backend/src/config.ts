/**
 * Configuration management for Telco MOP Analysis Agent
 */
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Security
  apiKey: process.env.X_API_KEY || '',
  
  // Tavily
  tavilyApiKey: process.env.TAVILY_API_KEY || '',
  tavilyEnabled: !!process.env.TAVILY_API_KEY,
  
  // Cache
  cacheTTL: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
  useCache: process.env.USE_CACHE === 'true',
  
  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE_BYTES || '10485760', 10), // 10MB default
  uploadDir: path.join(__dirname, '../uploads'),
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
} as const;

// Validation
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.apiKey) {
    errors.push('X_API_KEY is required');
  }

  if (config.isProduction && !config.tavilyApiKey) {
    console.warn('Warning: TAVILY_API_KEY not set. Tavily integration will be disabled.');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}
