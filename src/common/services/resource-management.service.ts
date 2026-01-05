import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { CacheService } from './cache.service';

@Injectable()
export class ResourceManagementService {
  private readonly logger = new Logger(ResourceManagementService.name);

  constructor(
    private prisma: DatabaseService,
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {}

  // Clean up expired sessions every 30 minutes
  @Cron(CronExpression.EVERY_30_MINUTES)
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const result = await this.prisma.userSession.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isActive: false },
          ],
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired sessions`);
    } catch (error) {
      this.logger.error('Failed to cleanup expired sessions:', error.message);
    }
  }

  // Clean up old login history every day at 2 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldLoginHistory(): Promise<void> {
    try {
      const retentionDays = this.configService.get<number>('LOGIN_HISTORY_RETENTION_DAYS', 90);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Keep only last 50 records per user, regardless of date
      const usersWithHistory = await this.prisma.loginHistory.groupBy({
        by: ['userId'],
        _count: { id: true },
        having: { id: { _count: { gt: 50 } } },
      });

      for (const user of usersWithHistory) {
        if (user.userId) {
          // Get records to delete (keep latest 50)
          const recordsToDelete = await this.prisma.loginHistory.findMany({
            where: { userId: user.userId },
            orderBy: { createdAt: 'desc' },
            skip: 50,
            select: { id: true },
          });

          if (recordsToDelete.length > 0) {
            await this.prisma.loginHistory.deleteMany({
              where: {
                id: { in: recordsToDelete.map(r => r.id) },
              },
            });
          }
        }
      }

      // Also delete old records by date
      const dateResult = await this.prisma.loginHistory.deleteMany({
        where: { createdAt: { lt: cutoffDate } },
      });

      this.logger.log(`Cleaned up old login history: ${dateResult.count} records`);
    } catch (error) {
      this.logger.error('Failed to cleanup login history:', error.message);
    }
  }

  // Clean up old audit logs every week
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldAuditLogs(): Promise<void> {
    try {
      const retentionDays = this.configService.get<number>('AUDIT_LOG_RETENTION_DAYS', 365);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.prisma.auditLog.deleteMany({
        where: {
          OR: [
            { createdAt: { lt: cutoffDate } },
            { retentionDate: { lt: new Date() } },
          ],
        },
      });

      this.logger.log(`Cleaned up ${result.count} old audit logs`);
    } catch (error) {
      this.logger.error('Failed to cleanup audit logs:', error.message);
    }
  }

  // Clean up old notifications every day
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldNotifications(): Promise<void> {
    try {
      const retentionDays = this.configService.get<number>('NOTIFICATION_RETENTION_DAYS', 30);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.prisma.notification.deleteMany({
        where: {
          AND: [
            { createdAt: { lt: cutoffDate } },
            { isRead: true },
            { status: 'DELIVERED' },
          ],
        },
      });

      this.logger.log(`Cleaned up ${result.count} old notifications`);
    } catch (error) {
      this.logger.error('Failed to cleanup notifications:', error.message);
    }
  }

  // Force logout inactive sessions every hour
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupInactiveSessions(): Promise<void> {
    try {
      const inactivityHours = this.configService.get<number>('SESSION_INACTIVITY_HOURS', 24);
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - inactivityHours);

      const result = await this.prisma.userSession.updateMany({
        where: {
          lastActivity: { lt: cutoffDate },
          isActive: true,
        },
        data: { isActive: false },
      });

      this.logger.log(`Deactivated ${result.count} inactive sessions`);
    } catch (error) {
      this.logger.error('Failed to cleanup inactive sessions:', error.message);
    }
  }

  // Clear cache periodically to prevent memory leaks
  @Cron(CronExpression.EVERY_6_HOURS)
  async cleanupCache(): Promise<void> {
    try {
      await this.cacheService.clear();
      this.logger.log('Cache cleared successfully');
    } catch (error) {
      this.logger.error('Failed to clear cache:', error.message);
    }
  }

  // Manual cleanup methods
  async forceCleanupUser(userId: string): Promise<void> {
    await this.prisma.safeTransaction(async (tx) => {
      // Deactivate all user sessions
      await tx.userSession.updateMany({
        where: { userId },
        data: { isActive: false },
      });

      // Clear refresh token
      await tx.user.update({
        where: { id: userId },
        data: { refreshToken: null, sessionId: null },
      });
    });

    // Clear user cache
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (user) {
      await this.cacheService.del(`user:${user.email}`);
    }
  }

  async getResourceUsage(): Promise<any> {
    const [
      activeSessions,
      totalLoginHistory,
      totalAuditLogs,
      unreadNotifications,
    ] = await Promise.all([
      this.prisma.userSession.count({ where: { isActive: true } }),
      this.prisma.loginHistory.count(),
      this.prisma.auditLog.count(),
      this.prisma.notification.count({ where: { isRead: false } }),
    ]);

    return {
      activeSessions,
      totalLoginHistory,
      totalAuditLogs,
      unreadNotifications,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    };
  }
}