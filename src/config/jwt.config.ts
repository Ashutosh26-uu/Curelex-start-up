import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class JwtConfigService {
  private readonly logger = new Logger(JwtConfigService.name);

  constructor(private readonly configService: ConfigService) {
    this.validateJwtSecrets();
  }

  private validateJwtSecrets(): void {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be provided');
    }

    if (nodeEnv === 'production') {
      this.validateProductionSecrets(jwtSecret, jwtRefreshSecret);
    }
  }

  private validateProductionSecrets(jwtSecret: string, jwtRefreshSecret: string): void {
    const minLength = 32;
    const strongPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

    if (jwtSecret.length < minLength) {
      throw new Error(`JWT_SECRET must be at least ${minLength} characters in production`);
    }

    if (jwtRefreshSecret.length < minLength) {
      throw new Error(`JWT_REFRESH_SECRET must be at least ${minLength} characters in production`);
    }

    if (!strongPattern.test(jwtSecret) || !strongPattern.test(jwtRefreshSecret)) {
      this.logger.warn('JWT secrets should contain uppercase, lowercase, numbers, and special characters');
    }

    if (jwtSecret === jwtRefreshSecret) {
      throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
    }

    this.logger.log('JWT secrets validated for production');
  }

  getJwtConfig() {
    return {
      secret: this.configService.get<string>('JWT_SECRET'),
      refreshSecret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      refreshExpiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    };
  }

  generateSecureSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }
}