import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as crypto from 'crypto';
import { CacheService } from '../../../common/services/cache.service';

@Injectable()
export class EnhancedCSRFGuard implements CanActivate {
  private readonly logger = new Logger(EnhancedCSRFGuard.name);
  private readonly allowedOrigins: string[];
  private readonly tokenSecret: string;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
    private cacheService: CacheService,
  ) {
    this.allowedOrigins = this.configService.get<string>('ALLOWED_ORIGINS', '').split(',');
    this.tokenSecret = this.configService.get<string>('CSRF_SECRET', 'default-csrf-secret');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    // Skip if explicitly marked as public
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    // Validate origin
    if (!this.validateOrigin(request)) {
      this.logger.warn(`CSRF: Invalid origin ${request.get('origin')} from IP ${request.ip}`);
      throw new ForbiddenException('Invalid origin');
    }

    // Validate CSRF token
    const csrfToken = this.extractCSRFToken(request);
    if (!csrfToken) {
      throw new ForbiddenException('CSRF token missing');
    }

    const isValidToken = await this.validateCSRFToken(csrfToken, request);
    if (!isValidToken) {
      this.logger.warn(`CSRF: Invalid token from IP ${request.ip}`);
      throw new ForbiddenException('Invalid CSRF token');
    }

    // Generate new token for response
    const newToken = await this.generateCSRFToken(request);
    response.setHeader('X-CSRF-Token', newToken);

    return true;
  }

  private validateOrigin(request: any): boolean {
    const origin = request.get('origin') || request.get('referer');
    
    if (!origin) {
      return false;
    }

    // Check against allowed origins
    return this.allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin === '*') return true;
      return origin.startsWith(allowedOrigin);
    });
  }

  private extractCSRFToken(request: any): string | null {
    // Check header first
    let token = request.get('X-CSRF-Token') || request.get('X-XSRF-Token');
    
    // Check body
    if (!token && request.body) {
      token = request.body._csrf || request.body.csrfToken;
    }

    // Check query params
    if (!token && request.query) {
      token = request.query._csrf || request.query.csrfToken;
    }

    return token;
  }

  async generateCSRFToken(request: any): Promise<string> {
    const sessionId = request.user?.sessionId || request.sessionID || 'anonymous';
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    
    const payload = `${sessionId}:${timestamp}:${randomBytes}`;
    const signature = crypto
      .createHmac('sha256', this.tokenSecret)
      .update(payload)
      .digest('hex');

    const token = Buffer.from(`${payload}:${signature}`).toString('base64');
    
    // Cache token for validation (expires in 1 hour)
    await this.cacheService.set(`csrf:${token}`, sessionId, 3600);
    
    return token;
  }

  private async validateCSRFToken(token: string, request: any): Promise<boolean> {
    try {
      // Check if token exists in cache
      const cachedSessionId = await this.cacheService.get(`csrf:${token}`);
      if (!cachedSessionId) {
        return false;
      }

      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [sessionId, timestamp, randomBytes, signature] = decoded.split(':');

      // Verify signature
      const payload = `${sessionId}:${timestamp}:${randomBytes}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.tokenSecret)
        .update(payload)
        .digest('hex');

      if (signature !== expectedSignature) {
        return false;
      }

      // Check timestamp (token should not be older than 1 hour)
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > 3600000) { // 1 hour
        await this.cacheService.del(`csrf:${token}`);
        return false;
      }

      // Verify session matches
      const currentSessionId = request.user?.sessionId || request.sessionID || 'anonymous';
      if (sessionId !== currentSessionId && sessionId !== cachedSessionId) {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('CSRF token validation error:', error);
      return false;
    }
  }

  async generateTokenForSession(sessionId: string): Promise<string> {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    
    const payload = `${sessionId}:${timestamp}:${randomBytes}`;
    const signature = crypto
      .createHmac('sha256', this.tokenSecret)
      .update(payload)
      .digest('hex');

    const token = Buffer.from(`${payload}:${signature}`).toString('base64');
    
    // Cache token
    await this.cacheService.set(`csrf:${token}`, sessionId, 3600);
    
    return token;
  }

  async revokeToken(token: string): Promise<void> {
    await this.cacheService.del(`csrf:${token}`);
  }
}