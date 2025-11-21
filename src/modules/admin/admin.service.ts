import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { AssignDoctorDto } from './dto/assign-doctor.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async assignDoctorToPatient(assignDoctorDto: AssignDoctorDto) {
    const { doctorId, patientId } = assignDoctorDto;

    // Perform assignment and update patient status in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create doctor-patient assignment
      const assignment = await tx.doctorPatientAssignment.create({
        data: {
          doctorId,
          patientId,
        },
        include: {
          doctor: { include: { user: { include: { profile: true } } } },
          patient: { include: { user: { include: { profile: true } } } },
        },
      });

      // Update patient status to "assigned"
      await tx.patient.update({
        where: { id: patientId },
        data: { status: 'assigned' },
      });

      return assignment;
    });

    // Notify doctor via email and push notification
    await this.notifyDoctorAssignment(result);

    return result;
  }

  private async notifyDoctorAssignment(assignment: any) {
    const doctor = assignment.doctor;
    const patient = assignment.patient;
    const patientName = `${patient.user.profile.firstName} ${patient.user.profile.lastName}`;

    // Create email notification
    await this.notificationService.create({
      userId: doctor.userId,
      type: 'EMAIL',
      title: 'New Patient Assignment',
      message: `You have been assigned a new patient: ${patientName}. Please review their medical history and schedule an appointment.`,
      metadata: {
        patientId: patient.id,
        assignmentId: assignment.id,
        type: 'doctor-assignment',
      },
    });

    // Create push notification
    await this.notificationService.create({
      userId: doctor.userId,
      type: 'PUSH',
      title: 'New Patient Assignment',
      message: `New patient ${patientName} has been assigned to you.`,
      metadata: {
        patientId: patient.id,
        assignmentId: assignment.id,
        type: 'doctor-assignment',
      },
    });
  }

  async unassignDoctorFromPatient(doctorId: string, patientId: string) {
    return this.prisma.doctorPatientAssignment.updateMany({
      where: { doctorId, patientId },
      data: { isActive: false },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        profile: true,
        patient: true,
        doctor: true,
        officer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deactivateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  async activateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }

  async getDoctorAssignments() {
    return this.prisma.doctorPatientAssignment.findMany({
      where: { isActive: true },
      include: {
        doctor: { include: { user: { include: { profile: true } } } },
        patient: { include: { user: { include: { profile: true } } } },
      },
    });
  }

  async getSystemStats() {
    const [
      totalUsers,
      activeUsers,
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.patient.count(),
      this.prisma.doctor.count(),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { status: 'SCHEDULED' } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
    };
  }
}