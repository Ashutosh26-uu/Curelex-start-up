import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TokenBlacklistService {
  constructor(private prisma: PrismaService) {}

  async blacklistToken(jti: string, expiresAt: Date): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: 'TOKEN_BLACKLISTED',
        resource: 'JWT',
        details: JSON.stringify({ jti, expiresAt }),
      }
    });
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const blacklisted = await this.prisma.auditLog.findFirst({
      where: {
        action: 'TOKEN_BLACKLISTED',
        details: { contains: jti }
      }
    });
    return !!blacklisted;
  }
}