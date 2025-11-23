import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class OfficerService {
  constructor(private prisma: PrismaService) {}

  async getDashboardAnalytics() {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      completedAppointments,
    ] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.doctor.count(),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({
        where: {
          scheduledAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      this.prisma.appointment.count({
        where: { status: 'COMPLETED' },
      }),
    ]);

    return {
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      completedAppointments,
      completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
    };
  }

  async getAppointmentAnalytics() {
    const appointmentsByStatus = await this.prisma.appointment.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const appointmentsByMonth = await this.prisma.appointment.groupBy({
      by: ['scheduledAt'],
      _count: { scheduledAt: true },
      orderBy: { scheduledAt: 'asc' },
    });

    return {
      byStatus: appointmentsByStatus,
      byMonth: appointmentsByMonth,
    };
  }

  async getPatientAnalytics() {
    const patientsByMonth = await this.prisma.patient.groupBy({
      by: ['createdAt'],
      _count: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    return { byMonth: patientsByMonth };
  }

  async getDoctorAnalytics() {
    const doctorsBySpecialization = await this.prisma.doctor.groupBy({
      by: ['specialization'],
      _count: { specialization: true },
    });

    return { bySpecialization: doctorsBySpecialization };
  }

  async getPatientsToday() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [newPatients, totalAppointments, completedAppointments] = await Promise.all([
      this.prisma.patient.count({
        where: { createdAt: { gte: startOfDay, lte: endOfDay } }
      }),
      this.prisma.appointment.count({
        where: { scheduledAt: { gte: startOfDay, lte: endOfDay } }
      }),
      this.prisma.appointment.count({
        where: { 
          scheduledAt: { gte: startOfDay, lte: endOfDay },
          status: 'COMPLETED'
        }
      })
    ]);

    return { newPatients, totalAppointments, completedAppointments };
  }

  async getPendingAssignments() {
    const [unassignedPatients, pendingAppointments] = await Promise.all([
      this.prisma.patient.count({ where: { status: 'unassigned' } }),
      this.prisma.appointment.count({ where: { status: 'SCHEDULED' } })
    ]);

    return { unassignedPatients, pendingAppointments };
  }

  async getDoctorPerformance() {
    const doctors = await this.prisma.doctor.findMany({
      include: {
        appointments: { where: { status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] } } },
        assignedPatients: { where: { isActive: true } },
        _count: { select: { prescriptions: true } }
      }
    });

    return doctors.map(doctor => ({
      doctorId: doctor.id,
      name: `Dr. ${doctor.userId}`,
      totalAppointments: doctor.appointments.length,
      completedAppointments: doctor.appointments.filter(a => a.status === 'COMPLETED').length,
      completionRate: doctor.appointments.length > 0 
        ? (doctor.appointments.filter(a => a.status === 'COMPLETED').length / doctor.appointments.length) * 100 
        : 0,
      assignedPatients: doctor.assignedPatients.length,
      prescriptionsWritten: doctor._count.prescriptions
    }));
  }

  async getCompletionTrends() {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const appointments = await this.prisma.appointment.findMany({
      where: { scheduledAt: { gte: last30Days } },
      select: { scheduledAt: true, status: true }
    });

    const trends = appointments.reduce((acc: any, appointment) => {
      const date = appointment.scheduledAt.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { total: 0, completed: 0 };
      acc[date].total++;
      if (appointment.status === 'COMPLETED') acc[date].completed++;
      return acc;
    }, {});

    return Object.entries(trends).map(([date, data]: [string, any]) => ({
      date,
      total: data.total,
      completed: data.completed,
      completionRate: (data.completed / data.total) * 100
    }));
  }

  async getAlerts() {
    const [overdueAppointments, criticalVitals, unassignedPatients] = await Promise.all([
      this.prisma.appointment.count({
        where: {
          scheduledAt: { lt: new Date() },
          status: { in: ['SCHEDULED', 'CONFIRMED'] }
        }
      }),
      this.prisma.vital.count({
        where: {
          recordedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          OR: [
            { type: 'BLOOD_PRESSURE', value: { contains: '180' } },
            { type: 'HEART_RATE', value: { gt: '100' } },
            { type: 'OXYGEN_SATURATION', value: { lt: '90' } }
          ]
        }
      }),
      this.prisma.patient.count({ where: { status: 'unassigned' } })
    ]);

    const alerts = [];
    if (overdueAppointments > 0) alerts.push({ type: 'overdue_appointments', count: overdueAppointments, severity: 'high' });
    if (criticalVitals > 0) alerts.push({ type: 'critical_vitals', count: criticalVitals, severity: 'critical' });
    if (unassignedPatients > 0) alerts.push({ type: 'unassigned_patients', count: unassignedPatients, severity: 'medium' });

    return { alerts, totalAlerts: alerts.length };
  }
}