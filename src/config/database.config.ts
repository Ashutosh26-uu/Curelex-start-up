import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 60000,
  poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT, 10) || 60000,
  logLevel: process.env.DB_LOG_LEVEL || 'info',
  maxRetries: parseInt(process.env.DB_MAX_RETRIES, 10) || 3,
  retryDelay: parseInt(process.env.DB_RETRY_DELAY, 10) || 1000,
}));