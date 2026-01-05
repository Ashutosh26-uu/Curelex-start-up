import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/database.service';
import { CacheService } from '../../../common/services/cache.service';
import { v4 as uuidv4 } from 'uuid';

interface SecurityEvent {
  type: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'SUSPICIOUS_ACTIVITY' | 'ACCOUNT_LOCKED';
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

@Injectable()
export class SessionManagementService {
  private readonly logger = new Logger(SessionManagementService.name);

  constructor(
    private prisma: DatabaseService,
    private cacheService: CacheService,
  ) {}

  async createSession(userId: string, ipAddress?: string, userAgent?: string) {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.userSession.create({
      data: {
        userId,
        sessionId,
        ipAddress,
        userAgent,
        expiresAt,
        isActive: true,
      }
    });

    // Cache active session
    await this.cacheService.set(`session:${sessionId}`, userId, 24 * 60 * 60);

    return sessionId;
  }

  async validateSession(sessionId: string): Promise<string | null> {
    // Check cache first
    const cachedUserId = await this.cacheService.get(`session:${sessionId}`);
    if (cachedUserId) {
      return cachedUserId;
    }

    // Check database
    const session = await this.prisma.userSession.findFirst({
      where: {
        sessionId,
        isActive: true,
        expiresAt: { gt: new Date() }
      }
    });

    if (session) {
      // Update cache
      await this.cacheService.set(`session:${sessionId}`, session.userId, 24 * 60 * 60);
      return session.userId;
    }

    return null;
  }

  async invalidateSession(sessionId: string) {
    await this.prisma.userSession.updateMany({
      where: { sessionId },
      data: { isActive: false }
    });

    await this.cacheService.del(`session:${sessionId}`);
  }

  async invalidateAllUserSessions(userId: string, exceptSessionId?: string) {
    const whereClause = exceptSessionId 
      ? { userId, sessionId: { not: exceptSessionId } }
      : { userId };

    const sessions = await this.prisma.userSession.findMany({
      where: whereClause,
      select: { sessionId: true }
    });

    await this.prisma.userSession.updateMany({
      where: whereClause,
      data: { isActive: false }
    });

    // Clear from cache
    for (const session of sessions) {
      await this.cacheService.del(`session:${session.sessionId}`);
    }
  }

  async handleSecurityEvent(event: SecurityEvent) {
    await this.prisma.securityEvent.create({
      data: {
        eventType: event.type,
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        metadata: event.metadata,
        severity: this.getEventSeverity(event.type),
      }
    });

    // Handle critical security events
    if (this.isCriticalEvent(event.type)) {
      await this.handleCriticalSecurityEvent(event);
    }
  }

  private getEventSeverity(eventType: string): string {
    const severityMap = {
      'LOGIN': 'LOW',
      'LOGOUT': 'LOW',
      'PASSWORD_CHANGE': 'MEDIUM',
      'SUSPICIOUS_ACTIVITY': 'HIGH',
      'ACCOUNT_LOCKED': 'HIGH',
    };
    return severityMap[eventType] || 'MEDIUM';
  }

  private isCriticalEvent(eventType: string): boolean {
    return ['SUSPICIOUS_ACTIVITY', 'ACCOUNT_LOCKED'].includes(eventType);
  }

  private async handleCriticalSecurityEvent(event: SecurityEvent) {
    // Invalidate all sessions for suspicious activity
    if (event.type === 'SUSPICIOUS_ACTIVITY') {
      await this.invalidateAllUserSessions(event.userId);
      this.logger.warn(`All sessions invalidated for user ${event.userId} due to suspicious activity`);
    }

    // Additional security measures can be added here
  }

  async getActiveSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async cleanupExpiredSessions() {
    const expiredSessions = await this.prisma.userSession.findMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isActive: false }
        ]
      },
      select: { sessionId: true }
    });

    // Clear from cache
    for (const session of expiredSessions) {
      await this.cacheService.del(`session:${session.sessionId}`);
    }

    // Delete from database
    await this.prisma.userSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isActive: false }
        ]
      }
    });

    this.logger.log(`Cleaned up ${expiredSessions.length} expired sessions`);
  }

  async detectConcurrentSessions(userId: string, maxSessions = 5): Promise<boolean> {
    const activeSessions = await this.getActiveSessions(userId);
    
    if (activeSessions.length > maxSessions) {
      await this.handleSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        userId,
        metadata: { 
          reason: 'Too many concurrent sessions',
          sessionCount: activeSessions.length 
        }
      });
      return true;
    }

    return false;
  }

  async updateSessionActivity(sessionId: string) {
    await this.prisma.userSession.updateMany({
      where: { sessionId, isActive: true },
      data: { lastActivityAt: new Date() }
    });
  }
}