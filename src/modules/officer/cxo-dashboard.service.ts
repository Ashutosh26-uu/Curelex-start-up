import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class CxoDashboardService {
  constructor(private prisma: PrismaService) {}

  // CXO Availability Panel - Visible to all CXOs
  async getCxoAvailability() {
    const cxoRoles = [UserRole.CEO, UserRole.COO, UserRole.CTO, UserRole.CFO, UserRole.CLO, UserRole.BOD, UserRole.FOUNDER];
    
    const cxos = await this.prisma.user.findMany({
      where: {
        role: { in: cxoRoles },
        isActive: true,
        isDeleted: false,
      },
      include: {
        profile: true,
        sessions: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return cxos.map(cxo => ({
      id: cxo.id,
      name: `${cxo.profile?.firstName} ${cxo.profile?.lastName}`,
      role: cxo.role,
      status: cxo.sessions.length > 0 ? 'ONLINE' : 'OFFLINE',
      lastSeen: cxo.lastLoginAt,
    }));
  }

  // Daily Operations Dashboard - CEO, COO, CTO
  async getDailyOperations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      patientsToday,
      totalRegistrations,
      juniorDoctorTasks,
      seniorDoctorConsultations,
      followUpStatus,
    ] = await Promise.all([
      this.prisma.patient.count({
        where: {
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      this.prisma.patient.count({
        where: { isDeleted: false },
      }),
      this.prisma.vital.count({
        where: {
          recordedAt: { gte: today, lt: tomorrow },
        },
      }),
      this.prisma.appointment.count({
        where: {
          scheduledAt: { gte: today, lt: tomorrow },
          status: 'COMPLETED',
        },
      }),
      this.prisma.appointment.count({
        where: {
          followUpDate: { gte: today, lt: tomorrow },
          status: 'SCHEDULED',
        },
      }),
    ]);

    return {
      patientsToday,
      totalRegistrations,
      juniorDoctorTasks,
      seniorDoctorConsultations,
      followUpStatus,
    };
  }

  // Daily Revenue Dashboard - CEO, COO, CFO
  async getDailyRevenue() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const completedAppointments = await this.prisma.appointment.findMany({
      where: {
        completedAt: { gte: today, lt: tomorrow },
        status: 'COMPLETED',
      },
      include: {
        doctor: true,
      },
    });

    const totalEarnings = completedAppointments.reduce((sum, apt) => {
      return sum + (apt.doctor.consultationFee || 0);
    }, 0);

    const departmentBreakdown = completedAppointments.reduce((acc, apt) => {
      const dept = apt.doctor.specialization;
      acc[dept] = (acc[dept] || 0) + (apt.doctor.consultationFee || 0);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEarnings,
      departmentBreakdown,
      consultationsCount: completedAppointments.length,
    };
  }

  // Legal Dashboard - CEO, COO, CLO
  async getLegalDashboard() {
    // This would integrate with a legal/compliance system
    // For now, return mock data structure
    return {
      legalReports: [],
      complaints: [],
      complianceTasks: [],
      auditStatus: 'COMPLIANT',
    };
  }

  // Admin Full Access Analytics
  async getFullAnalytics() {
    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAppointments,
      recentActivity,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isDeleted: false } }),
      this.prisma.patient.count({ where: { isDeleted: false } }),
      this.prisma.doctor.count({ where: { isDeleted: false } }),
      this.prisma.appointment.count({ where: { isDeleted: false } }),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return {
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAppointments,
      recentActivity,
    };
  }

  // Role-based dashboard access
  async getDashboardData(userRole: UserRole) {
    const baseData = {
      availability: await this.getCxoAvailability(),
    };

    switch (userRole) {
      case UserRole.CEO:
        return {
          ...baseData,
          operations: await this.getDailyOperations(),
          revenue: await this.getDailyRevenue(),
          legal: await this.getLegalDashboard(),
          analytics: await this.getFullAnalytics(),
        };

      case UserRole.COO:
        return {
          ...baseData,
          operations: await this.getDailyOperations(),
          revenue: await this.getDailyRevenue(),
          legal: await this.getLegalDashboard(),
        };

      case UserRole.CTO:
        return {
          ...baseData,
          operations: await this.getDailyOperations(),
        };

      case UserRole.CFO:
        return {
          ...baseData,
          revenue: await this.getDailyRevenue(),
        };

      case UserRole.CLO:
        return {
          ...baseData,
          legal: await this.getLegalDashboard(),
        };

      case UserRole.ADMIN:
        return {
          ...baseData,
          analytics: await this.getFullAnalytics(),
        };

      default:
        return baseData;
    }
  }
}