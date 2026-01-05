import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly blacklistedTokens = new Set<string>();

  constructor(
    private readonly prisma: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async blacklistToken(jti: string, userId: string, reason = 'logout'): Promise<void> {
    try {
      this.blacklistedTokens.add(jti);
      
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'TOKEN_BLACKLISTED',
          resource: 'JWT',
          details: { jti, reason },
        },
      });

      this.logger.log(`Token blacklisted: ${jti} for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to blacklist token: ${error.message}`);
    }
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    if (this.blacklistedTokens.has(jti)) {
      return true;
    }

    try {
      const auditLog = await this.prisma.auditLog.findFirst({
        where: {
          action: 'TOKEN_BLACKLISTED',
          details: {
            path: ['jti'],
            equals: jti,
          },
        },
      });

      if (auditLog) {
        this.blacklistedTokens.add(jti);
        return true;
      }
    } catch (error) {
      this.logger.error(`Error checking blacklist: ${error.message}`);
    }

    return false;
  }

  async cleanupExpiredTokens(): Promise<void> {
    const expiryTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
    
    try {
      await this.prisma.auditLog.deleteMany({
        where: {
          action: 'TOKEN_BLACKLISTED',
          createdAt: { lt: expiryTime },
        },
      });

      this.blacklistedTokens.clear();
      this.logger.log('Cleaned up expired blacklisted tokens');
    } catch (error) {
      this.logger.error(`Failed to cleanup tokens: ${error.message}`);
    }
  }
}