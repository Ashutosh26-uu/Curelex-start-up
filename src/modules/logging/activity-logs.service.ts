import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  async logActivity(data: {
    userId?: string;
    action: string;
    resource: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        details: data.details || JSON.stringify(data.metadata || {}),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  // Patient Activities
  async logPatientRegistration(patientId: string, ipAddress?: string, userAgent?: string) {
    return this.logActivity({
      userId: patientId,
      action: 'REGISTER',
      resource: 'PATIENT',
      details: 'Patient registered successfully',
      ipAddress,
      userAgent,
    });
  }

  async logPatientLogin(patientId: string, ipAddress?: string, userAgent?: string) {
    return this.logActivity({
      userId: patientId,
      action: 'LOGIN',
      resource: 'PATIENT',
      details: 'Patient logged in',
      ipAddress,
      userAgent,
    });
  }

  async logPatientProfileUpdate(patientId: string, changes: any, ipAddress?: string) {
    return this.logActivity({
      userId: patientId,
      action: 'UPDATE',
      resource: 'PATIENT_PROFILE',
      details: `Profile updated: ${Object.keys(changes).join(', ')}`,
      ipAddress,
      metadata: changes,
    });
  }

  // Doctor Activities
  async logDoctorRegistration(doctorId: string, role: string, ipAddress?: string) {
    return this.logActivity({
      userId: doctorId,
      action: 'REGISTER',
      resource: 'DOCTOR',
      details: `${role} doctor registered`,
      ipAddress,
    });
  }

  async logPatientAssignment(doctorId: string, patientId: string, assignedBy?: string) {
    return this.logActivity({
      userId: doctorId,
      action: 'ASSIGN',
      resource: 'PATIENT_ASSIGNMENT',
      details: `Patient ${patientId} assigned to doctor`,
      metadata: { patientId, assignedBy },
    });
  }

  async logPrescriptionCreated(doctorId: string, patientId: string, prescriptionId: string) {
    return this.logActivity({
      userId: doctorId,
      action: 'CREATE',
      resource: 'PRESCRIPTION',
      details: `Prescription created for patient ${patientId}`,
      metadata: { patientId, prescriptionId },
    });
  }

  async logVitalsRecorded(doctorId: string, patientId: string, vitalType: string) {
    return this.logActivity({
      userId: doctorId,
      action: 'RECORD',
      resource: 'VITALS',
      details: `${vitalType} recorded for patient ${patientId}`,
      metadata: { patientId, vitalType },
    });
  }

  // Appointment Activities
  async logAppointmentScheduled(patientId: string, doctorId: string, appointmentId: string) {
    return this.logActivity({
      userId: patientId,
      action: 'SCHEDULE',
      resource: 'APPOINTMENT',
      details: `Appointment scheduled with doctor ${doctorId}`,
      metadata: { doctorId, appointmentId },
    });
  }

  async logAppointmentCompleted(doctorId: string, patientId: string, appointmentId: string) {
    return this.logActivity({
      userId: doctorId,
      action: 'COMPLETE',
      resource: 'APPOINTMENT',
      details: `Appointment completed for patient ${patientId}`,
      metadata: { patientId, appointmentId },
    });
  }

  // Admin Activities
  async logAdminAction(adminId: string, action: string, resource: string, details: string) {
    return this.logActivity({
      userId: adminId,
      action: action.toUpperCase(),
      resource: resource.toUpperCase(),
      details,
    });
  }

  // CXO Activities
  async logCxoAccess(cxoId: string, dashboard: string, ipAddress?: string) {
    return this.logActivity({
      userId: cxoId,
      action: 'ACCESS',
      resource: 'CXO_DASHBOARD',
      details: `Accessed ${dashboard} dashboard`,
      ipAddress,
      metadata: { dashboard },
    });
  }

  // Query Methods
  async getActivityLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 50, ...whereFilters } = filters;
    const skip = (page - 1) * limit;

    let whereClause: any = {};

    if (whereFilters.userId) {
      whereClause.userId = whereFilters.userId;
    }

    if (whereFilters.action) {
      whereClause.action = whereFilters.action;
    }

    if (whereFilters.resource) {
      whereClause.resource = whereFilters.resource;
    }

    if (whereFilters.startDate || whereFilters.endDate) {
      whereClause.createdAt = {};
      if (whereFilters.startDate) {
        whereClause.createdAt.gte = whereFilters.startDate;
      }
      if (whereFilters.endDate) {
        whereClause.createdAt.lte = whereFilters.endDate;
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

  async getUserActivitySummary(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.prisma.auditLog.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = activities.reduce((acc, activity) => {
      const key = `${activity.action}_${activity.resource}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActivities: activities.length,
      summary,
      recentActivities: activities.slice(0, 10),
    };
  }
}