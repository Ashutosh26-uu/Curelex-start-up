import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(private prisma: PrismaService) {}

  async logDataAccess(userId: string, patientId: string, dataType: string, action: string) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: `DATA_ACCESS_${action.toUpperCase()}`,
        resource: `PATIENT_${dataType.toUpperCase()}`,
        details: JSON.stringify({ patientId, dataType, timestamp: new Date() })
      }
    });
  }

  async checkDataRetentionCompliance() {
    const retentionPeriod = 7 * 365 * 24 * 60 * 60 * 1000; // 7 years
    const cutoffDate = new Date(Date.now() - retentionPeriod);

    const expiredRecords = await this.prisma.auditLog.count({
      where: {
        createdAt: { lt: cutoffDate },
        action: { not: 'DATA_RETENTION_REQUIRED' }
      }
    });

    if (expiredRecords > 0) {
      this.logger.warn(`Found ${expiredRecords} records eligible for archival`);
    }

    return { expiredRecords, cutoffDate };
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async dailyComplianceCheck() {
    this.logger.log('Running daily compliance check');
    
    // Check for suspicious access patterns
    const suspiciousActivity = await this.detectSuspiciousActivity();
    
    // Check data retention compliance
    const retentionCheck = await this.checkDataRetentionCompliance();
    
    // Log compliance status
    await this.prisma.auditLog.create({
      data: {
        action: 'COMPLIANCE_CHECK',
        resource: 'SYSTEM',
        details: JSON.stringify({
          suspiciousActivity,
          retentionCheck,
          timestamp: new Date()
        })
      }
    });
  }

  private async detectSuspiciousActivity() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Check for excessive data access
    const excessiveAccess = await this.prisma.auditLog.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: last24Hours },
        action: { startsWith: 'DATA_ACCESS' }
      },
      _count: { userId: true },
      having: { userId: { _count: { gt: 100 } } }
    });

    return { excessiveAccess: excessiveAccess.length };
  }
}