import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, { value: any; expiry: number }>();

  constructor(private configService: ConfigService) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = this.cache.get(key);
      if (!item) return null;
      
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    try {
      const expiry = Date.now() + (ttlSeconds * 1000);
      this.cache.set(key, { value, expiry });
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error.message);
    }
  }

  async del(...keys: string[]): Promise<void> {
    try {
      keys.forEach(key => this.cache.delete(key));
    } catch (error) {
      this.logger.error(`Cache delete error:`, error.message);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return Array.from(this.cache.keys()).filter(key => regex.test(key));
    } catch (error) {
      this.logger.error(`Cache keys error:`, error.message);
      return [];
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  // Cache warming for frequently accessed data
  async warmCache(): Promise<void> {
    this.logger.log('Cache warming started');
    // Implement cache warming logic here
  }
}