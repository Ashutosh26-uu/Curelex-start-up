import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async validateAndRefreshSession(userId: string, sessionId: string): Promise<boolean> {
    const session = await this.prisma.userSession.findFirst({
      where: {
        userId,
        sessionId,
        isActive: true,
        expiresAt: { gt: new Date() }
      }
    });

    if (!session) {
      return false;
    }

    // Auto-extend session if it's about to expire (within 1 hour)
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    if (session.expiresAt < oneHourFromNow) {
      await this.extendSession(sessionId);
    }

    return true;
  }

  async extendSession(sessionId: string): Promise<void> {
    const newExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await this.prisma.userSession.update({
      where: { sessionId },
      data: { expiresAt: newExpiryDate }
    });
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true
      },
      data: { isActive: false }
    });
  }
}