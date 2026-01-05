import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../services/cache.service';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

@Injectable()
export class EnhancedRateLimitGuard implements CanActivate {
  private readonly defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  };

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get rate limit configuration
    const config = this.getRateLimitConfig(context);
    if (!config) return true;

    const userId = request.user?.userId;
    const ipAddress = this.getClientIp(request);
    const endpoint = `${request.method}:${request.route?.path || request.url}`;

    // Check both IP and user-based rate limits
    const [ipAllowed, userAllowed] = await Promise.all([
      this.checkRateLimit(`ip:${ipAddress}:${endpoint}`, config),
      userId ? this.checkRateLimit(`user:${userId}:${endpoint}`, config) : Promise.resolve(true),
    ]);

    if (!ipAllowed) {
      throw new HttpException({
        message: 'Too many requests from this IP address',
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        retryAfter: Math.ceil(config.windowMs / 1000),
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    if (!userAllowed) {
      throw new HttpException({
        message: 'Too many requests from this user',
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        retryAfter: Math.ceil(config.windowMs / 1000),
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    // Set rate limit headers
    this.setRateLimitHeaders(response, config);

    return true;
  }

  private getRateLimitConfig(context: ExecutionContext): RateLimitConfig | null {
    // Check for custom rate limit configuration
    const customConfig = this.reflector.get<RateLimitConfig>('rateLimit', context.getHandler());
    if (customConfig) return customConfig;

    const endpoint = context.switchToHttp().getRequest().route?.path;
    
    // Endpoint-specific configurations
    const endpointConfigs: Record<string, RateLimitConfig> = {
      '/auth/login': {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5, // 5 login attempts per 15 minutes
      },
      '/auth/register': {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 3, // 3 registrations per hour
      },
      '/auth/forgot-password': {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 3, // 3 password reset requests per hour
      },
      '/appointments': {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10, // 10 appointment operations per minute
      },
    };

    return endpointConfigs[endpoint] || this.defaultConfig;
  }

  private async checkRateLimit(key: string, config: RateLimitConfig): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get current request count
    const requestsKey = `rate_limit:${key}`;
    const requests = await this.cacheService.get<number[]>(requestsKey) || [];

    // Filter requests within the current window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (validRequests.length >= config.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);

    // Store updated requests with TTL
    await this.cacheService.set(requestsKey, validRequests, Math.ceil(config.windowMs / 1000));

    return true;
  }

  private setRateLimitHeaders(response: any, config: RateLimitConfig): void {
    response.setHeader('X-RateLimit-Limit', config.maxRequests);
    response.setHeader('X-RateLimit-Window', config.windowMs);
    response.setHeader('X-RateLimit-Reset', new Date(Date.now() + config.windowMs).toISOString());
  }

  private getClientIp(request: any): string {
    return request.ip || 
           request.connection?.remoteAddress || 
           request.socket?.remoteAddress ||
           request.headers['x-forwarded-for']?.split(',')[0] ||
           'unknown';
  }
}

// Decorator for custom rate limiting
export const RateLimit = (config: RateLimitConfig) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('rateLimit', config, descriptor.value);
    return descriptor;
  };
};