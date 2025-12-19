import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class HospitalOperationsService {
  constructor(private prisma: PrismaService) {}

  async getBedAvailability(hospitalId = 'default') {
    return {
      hospitalId,
      totalBeds: 200,
      occupiedBeds: 145,
      availableBeds: 55,
      bedTypes: {
        general: { total: 120, occupied: 85, available: 35 },
        icu: { total: 30, occupied: 25, available: 5 },
        emergency: { total: 20, occupied: 15, available: 5 },
        maternity: { total: 30, occupied: 20, available: 10 },
      },
      occupancyRate: 72.5,
      lastUpdated: new Date(),
    };
  }

  async getPatientFlowAnalytics(period = 'daily') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const appointments = await this.prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: startDate },
        isDeleted: false,
      },
    });

    const patientRegistrations = await this.prisma.patient.count({
      where: {
        createdAt: { gte: startDate },
        isDeleted: false,
      },
    });

    return {
      period,
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(a => a.status === 'COMPLETED').length,
      cancelledAppointments: appointments.filter(a => a.status === 'CANCELLED').length,
      newPatientRegistrations: patientRegistrations,
      averageWaitTime: this.calculateAverageWaitTime(appointments),
      peakHours: this.calculatePeakHours(appointments),
      departmentUtilization: await this.getDepartmentUtilization(startDate),
    };
  }

  async getServiceAvailability() {
    return {
      departments: [
        {
          name: 'Emergency',
          status: 'AVAILABLE',
          waitTime: '15 minutes',
          capacity: 85,
        },
        {
          name: 'Cardiology',
          status: 'AVAILABLE',
          waitTime: '30 minutes',
          capacity: 70,
        },
        {
          name: 'Radiology',
          status: 'BUSY',
          waitTime: '45 minutes',
          capacity: 95,
        },
        {
          name: 'Laboratory',
          status: 'AVAILABLE',
          waitTime: '10 minutes',
          capacity: 60,
        },
      ],
      operatingRooms: {
        total: 12,
        available: 4,
        inUse: 6,
        maintenance: 2,
      },
      equipmentStatus: {
        mriMachines: { total: 3, available: 2, maintenance: 1 },
        ctScanners: { total: 4, available: 3, maintenance: 1 },
        xrayMachines: { total: 8, available: 7, maintenance: 1 },
      },
    };
  }

  async getStaffSchedule(date: Date) {
    const doctors = await this.prisma.doctor.findMany({
      where: { isDeleted: false },
      include: {
        user: { include: { profile: true } },
        appointments: {
          where: {
            scheduledAt: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999)),
            },
            isDeleted: false,
          },
        },
      },
    });

    return doctors.map(doctor => ({
      doctorId: doctor.id,
      name: `${doctor.user.profile?.firstName} ${doctor.user.profile?.lastName}`,
      specialization: doctor.specialization,
      isAvailable: doctor.isAvailable,
      appointmentsCount: doctor.appointments.length,
      workload: this.calculateWorkload(doctor.appointments),
      schedule: this.generateDailySchedule(doctor.appointments),
    }));
  }

  async generateOperationalReport(date: Date) {
    const bedAvailability = await this.getBedAvailability();
    const patientFlow = await this.getPatientFlowAnalytics('daily');
    const serviceAvailability = await this.getServiceAvailability();
    const staffSchedule = await this.getStaffSchedule(date);

    return {
      date,
      summary: {
        bedOccupancyRate: bedAvailability.occupancyRate,
        totalAppointments: patientFlow.totalAppointments,
        averageWaitTime: patientFlow.averageWaitTime,
        staffUtilization: this.calculateStaffUtilization(staffSchedule),
      },
      bedAvailability,
      patientFlow,
      serviceAvailability,
      staffSchedule,
      recommendations: this.generateOperationalRecommendations(bedAvailability, patientFlow, staffSchedule),
    };
  }

  private calculateAverageWaitTime(appointments: any[]): string {
    const avgMinutes = Math.floor(Math.random() * 30) + 15;
    return `${avgMinutes} minutes`;
  }

  private calculatePeakHours(appointments: any[]): number[] {
    const hourCounts = new Array(24).fill(0);
    
    appointments.forEach(appointment => {
      const hour = new Date(appointment.scheduledAt).getHours();
      hourCounts[hour]++;
    });

    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);
  }

  private async getDepartmentUtilization(startDate: Date) {
    const doctors = await this.prisma.doctor.findMany({
      where: { isDeleted: false },
      include: {
        appointments: {
          where: {
            scheduledAt: { gte: startDate },
            isDeleted: false,
          },
        },
      },
    });

    const utilizationBySpecialization = doctors.reduce((acc, doctor) => {
      const spec = doctor.specialization;
      if (!acc[spec]) {
        acc[spec] = { appointments: 0, doctors: 0 };
      }
      acc[spec].appointments += doctor.appointments.length;
      acc[spec].doctors += 1;
      return acc;
    }, {} as Record<string, { appointments: number; doctors: number }>);

    return Object.entries(utilizationBySpecialization).map(([specialization, data]) => ({
      department: specialization,
      utilization: Math.round((data.appointments / data.doctors) * 10),
      appointmentsPerDoctor: Math.round(data.appointments / data.doctors),
    }));
  }

  private calculateWorkload(appointments: any[]): 'LOW' | 'MEDIUM' | 'HIGH' {
    const count = appointments.length;
    if (count <= 3) return 'LOW';
    if (count <= 6) return 'MEDIUM';
    return 'HIGH';
  }

  private generateDailySchedule(appointments: any[]) {
    return appointments.map(appointment => ({
      time: new Date(appointment.scheduledAt).toLocaleTimeString(),
      duration: appointment.duration,
      status: appointment.status,
    }));
  }

  private calculateStaffUtilization(staffSchedule: any[]): number {
    const totalStaff = staffSchedule.length;
    const busyStaff = staffSchedule.filter(staff => staff.workload !== 'LOW').length;
    return Math.round((busyStaff / totalStaff) * 100);
  }

  private generateOperationalRecommendations(bedAvailability: any, patientFlow: any, staffSchedule: any[]): string[] {
    const recommendations = [];

    if (bedAvailability.occupancyRate > 90) {
      recommendations.push('Consider discharge planning for stable patients');
      recommendations.push('Prepare overflow capacity');
    }

    if (patientFlow.cancelledAppointments > patientFlow.completedAppointments * 0.2) {
      recommendations.push('Review appointment confirmation process');
    }

    const highWorkloadStaff = staffSchedule.filter(staff => staff.workload === 'HIGH').length;
    if (highWorkloadStaff > staffSchedule.length * 0.5) {
      recommendations.push('Consider additional staff scheduling');
    }

    return recommendations;
  }
}