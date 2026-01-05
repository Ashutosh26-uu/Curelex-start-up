import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../../common/database/database.service';
import { CacheService } from '../../../common/services/cache.service';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  private readonly configs: Record<string, RateLimitConfig> = {
    login: { windowMs: 15 * 60 * 1000, maxRequests: 5, blockDurationMs: 30 * 60 * 1000 },
    register: { windowMs: 60 * 60 * 1000, maxRequests: 3, blockDurationMs: 60 * 60 * 1000 },
    api: { windowMs: 60 * 1000, maxRequests: 100, blockDurationMs: 5 * 60 * 1000 },
    password_reset: { windowMs: 60 * 60 * 1000, maxRequests: 3, blockDurationMs: 60 * 60 * 1000 },
  };

  constructor(
    private prisma: DatabaseService,
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {}

  async checkRateLimit(
    identifier: string,
    action: string,
    userAgent?: string
  ): Promise<{ allowed: boolean; resetTime?: number; remaining?: number }> {
    const config = this.configs[action] || this.configs.api;
    const key = `rate_limit:${action}:${identifier}`;
    const blockKey = `rate_limit_block:${action}:${identifier}`;

    // Check if currently blocked
    const isBlocked = await this.cacheService.get(blockKey);
    if (isBlocked) {
      const blockExpiry = await this.cacheService.getTtl(blockKey);
      return { allowed: false, resetTime: Date.now() + (blockExpiry * 1000) };
    }

    // Get current count
    const currentCount = await this.cacheService.get(key) || 0;
    const newCount = currentCount + 1;

    if (newCount > config.maxRequests) {
      // Block the identifier
      await this.cacheService.set(blockKey, true, config.blockDurationMs / 1000);
      
      // Log rate limit violation
      await this.logRateLimitViolation(identifier, action, userAgent);
      
      return { allowed: false, resetTime: Date.now() + config.blockDurationMs };
    }

    // Update count
    await this.cacheService.set(key, newCount, config.windowMs / 1000);
    
    return { 
      allowed: true, 
      remaining: config.maxRequests - newCount,
      resetTime: Date.now() + config.windowMs 
    };
  }

  async checkAdvancedRateLimit(
    ipAddress: string,
    userId?: string,
    action = 'api'
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Check IP-based rate limit
    const ipResult = await this.checkRateLimit(ipAddress, action);
    if (!ipResult.allowed) {
      return { allowed: false, reason: 'IP rate limit exceeded' };
    }

    // Check user-based rate limit if user is authenticated
    if (userId) {
      const userResult = await this.checkRateLimit(userId, action);
      if (!userResult.allowed) {
        return { allowed: false, reason: 'User rate limit exceeded' };
      }
    }

    // Check for suspicious patterns
    const suspiciousActivity = await this.detectSuspiciousActivity(ipAddress, userId);
    if (suspiciousActivity) {
      return { allowed: false, reason: 'Suspicious activity detected' };
    }

    return { allowed: true };
  }

  private async detectSuspiciousActivity(ipAddress: string, userId?: string): Promise<boolean> {
    const suspiciousPatterns = [
      // Multiple failed logins from same IP
      { key: `failed_login:${ipAddress}`, threshold: 10, window: 60 * 60 },
      // Rapid API calls
      { key: `api_burst:${ipAddress}`, threshold: 200, window: 60 },
    ];

    for (const pattern of suspiciousPatterns) {
      const count = await this.cacheService.get(pattern.key) || 0;
      if (count > pattern.threshold) {
        return true;
      }
    }

    return false;
  }

  async recordFailedLogin(ipAddress: string, userId?: string) {
    const key = `failed_login:${ipAddress}`;
    const count = await this.cacheService.get(key) || 0;
    await this.cacheService.set(key, count + 1, 60 * 60); // 1 hour window
  }

  async clearRateLimit(identifier: string, action: string) {
    const key = `rate_limit:${action}:${identifier}`;
    const blockKey = `rate_limit_block:${action}:${identifier}`;
    
    await this.cacheService.del(key);
    await this.cacheService.del(blockKey);
  }

  private async logRateLimitViolation(identifier: string, action: string, userAgent?: string) {
    try {
      await this.prisma.securityEvent.create({
        data: {
          eventType: 'RATE_LIMIT_EXCEEDED',
          identifier,
          action,
          userAgent,
          severity: 'MEDIUM',
          metadata: { timestamp: new Date().toISOString() }
        }
      });
    } catch (error) {
      this.logger.error('Failed to log rate limit violation', error);
    }
  }

  async getRateLimitStatus(identifier: string, action: string) {
    const config = this.configs[action] || this.configs.api;
    const key = `rate_limit:${action}:${identifier}`;
    const blockKey = `rate_limit_block:${action}:${identifier}`;

    const isBlocked = await this.cacheService.get(blockKey);
    const currentCount = await this.cacheService.get(key) || 0;
    const ttl = await this.cacheService.getTtl(key);

    return {
      isBlocked: !!isBlocked,
      currentCount,
      maxRequests: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - currentCount),
      resetTime: ttl > 0 ? Date.now() + (ttl * 1000) : null,
    };
  }
}