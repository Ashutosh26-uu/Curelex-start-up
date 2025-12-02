import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class OfficerService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      completedAppointments,
      activeUsers,
      newPatientsThisMonth,
      appointmentsToday,
      criticalVitals,
    ] = await Promise.all([
      this.prisma.patient.count({ where: { isDeleted: false } }),
      this.prisma.doctor.count({ where: { isDeleted: false } }),
      this.prisma.appointment.count({ where: { isDeleted: false } }),
      this.prisma.appointment.count({ where: { status: 'COMPLETED', isDeleted: false } }),
      this.prisma.user.count({ where: { isActive: true, isDeleted: false } }),
      this.prisma.patient.count({
        where: {
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          isDeleted: false,
        },
      }),
      this.prisma.appointment.count({
        where: {
          scheduledAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
          isDeleted: false,
        },
      }),
      this.prisma.vital.count({
        where: {
          recordedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          OR: [
            { type: 'BLOOD_PRESSURE', value: { contains: '18' } }, // Simplified critical check
            { type: 'HEART_RATE', value: { gt: '100' } },
            { type: 'OXYGEN_SATURATION', value: { lt: '95' } },
          ],
        },
      }),
    ]);

    return {
      totalPatients,
      totalDoctors,
      totalAppointments,
      completedAppointments,
      activeUsers,
      newPatientsThisMonth,
      appointmentsToday,
      criticalVitals,
      completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
    };
  }

  async getAppointmentAnalytics(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const appointments = await this.prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: start, lte: end },
        isDeleted: false,
      },
      select: {
        status: true,
        scheduledAt: true,
        duration: true,
      },
    });

    const statusCounts = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dailyAppointments = appointments.reduce((acc, apt) => {
      const date = apt.scheduledAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      statusCounts,
      dailyAppointments,
      totalAppointments: appointments.length,
      averageDuration: appointments.length > 0 
        ? appointments.reduce((sum, apt) => sum + apt.duration, 0) / appointments.length 
        : 0,
    };
  }

  async getPatientAnalytics() {
    const [
      totalPatients,
      patientsByStatus,
      patientsByMonth,
    ] = await Promise.all([
      this.prisma.patient.count({ where: { isDeleted: false } }),
      this.prisma.patient.groupBy({
        by: ['status'],
        where: { isDeleted: false },
        _count: { status: true },
      }),
      this.prisma.patient.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
          isDeleted: false,
        },
        select: { createdAt: true },
      }),
    ]);

    const monthlyRegistrations = patientsByMonth.reduce((acc, patient) => {
      const month = patient.createdAt.toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPatients,
      patientsByStatus: patientsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      monthlyRegistrations,
      averageAge: null,
    };
  }

  async getRevenueAnalytics(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const completedAppointments = await this.prisma.appointment.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: start, lte: end },
        isDeleted: false,
      },
      include: {
        doctor: { select: { consultationFee: true } },
      },
    });

    const totalRevenue = completedAppointments.reduce(
      (sum, apt) => sum + apt.doctor.consultationFee,
      0
    );

    const dailyRevenue = completedAppointments.reduce((acc, apt) => {
      const date = apt.completedAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + apt.doctor.consultationFee;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      dailyRevenue,
      totalAppointments: completedAppointments.length,
      averageRevenuePerAppointment: completedAppointments.length > 0 
        ? totalRevenue / completedAppointments.length 
        : 0,
    };
  }

  async getSystemHealth() {
    const [
      activeUsers,
      recentLogins,
      systemErrors,
      databaseSize,
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          lastLoginAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          isActive: true,
        },
      }),
      this.prisma.user.count({
        where: {
          lastLoginAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
      }),
      this.prisma.auditLog.count({
        where: {
          action: { contains: 'ERROR' },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      this.prisma.user.count(), // Simplified database size metric
    ]);

    return {
      activeUsers,
      recentLogins,
      systemErrors,
      databaseSize,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }
}