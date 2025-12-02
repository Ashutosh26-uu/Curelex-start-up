import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class LoggingService {
  constructor(private prisma: PrismaService) {}

  async createAuditLog(data: {
    userId?: string;
    action: string;
    resource: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data,
    });
  }

  async getAuditLogs(
    page = 1,
    limit = 50,
    userId?: string,
    action?: string,
    resource?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const skip = (page - 1) * limit;
    let whereClause: any = {};

    if (userId) {
      whereClause.userId = userId;
    }

    if (action) {
      whereClause.action = { contains: action };
    }

    if (resource) {
      whereClause.resource = { contains: resource };
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = startDate;
      }
      if (endDate) {
        whereClause.createdAt.lte = endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where: whereClause }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserActivity(userId: string, limit = 20) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getSystemActivity(hours = 24) {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [totalActions, uniqueUsers, errorCount, topActions] = await Promise.all([
      this.prisma.auditLog.count({
        where: { createdAt: { gte: startTime } },
      }),
      this.prisma.auditLog.findMany({
        where: { createdAt: { gte: startTime } },
        distinct: ['userId'],
        select: { userId: true },
      }),
      this.prisma.auditLog.count({
        where: {
          createdAt: { gte: startTime },
          action: { contains: 'ERROR' },
        },
      }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where: { createdAt: { gte: startTime } },
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalActions,
      uniqueUsers: uniqueUsers.length,
      errorCount,
      topActions: topActions.map(item => ({
        action: item.action,
        count: item._count.action,
      })),
    };
  }
}