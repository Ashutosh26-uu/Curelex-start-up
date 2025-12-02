import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AssignDoctorDto } from './dto/assign-doctor.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async assignDoctorToPatient(assignDoctorDto: AssignDoctorDto, adminUserId: string) {
    const { doctorId, patientId } = assignDoctorDto;

    // Verify doctor and patient exist
    const [doctorUser, patientUser] = await Promise.all([
      this.prisma.user.findFirst({
        where: { doctor: { id: doctorId } },
        include: { profile: true, doctor: true },
      }),
      this.prisma.user.findFirst({
        where: { patient: { id: patientId } },
        include: { profile: true, patient: true },
      }),
    ]);

    const doctor = doctorUser?.doctor;
    const patient = patientUser?.patient;

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.doctorPatientAssignment.findUnique({
      where: { doctorId_patientId: { doctorId, patientId } },
    });

    if (existingAssignment && existingAssignment.isActive) {
      throw new BadRequestException('Doctor is already assigned to this patient');
    }

    // Create or reactivate assignment
    const assignment = await this.prisma.doctorPatientAssignment.upsert({
      where: { doctorId_patientId: { doctorId, patientId } },
      update: {
        isActive: true,
        assignedBy: adminUserId,
        assignedAt: new Date(),
        unassignedAt: null,
      },
      create: {
        doctorId,
        patientId,
        assignedBy: adminUserId,
      },
      include: {
        doctor: { include: { user: { include: { profile: true } } } },
        patient: { include: { user: { include: { profile: true } } } },
      },
    });

    // Update patient status
    await this.prisma.patient.update({
      where: { id: patientId },
      data: { status: 'ACTIVE' },
    });

    // Send notifications
    await Promise.all([
      this.notificationService.createNotification({
        userId: doctorUser.id,
        type: 'SYSTEM' as any,
        title: 'New Patient Assignment',
        message: `You have been assigned to patient ${patientUser.profile.firstName} ${patientUser.profile.lastName}`,
      }),
      this.notificationService.createNotification({
        userId: patientUser.id,
        type: 'SYSTEM' as any,
        title: 'Doctor Assignment',
        message: `Dr. ${doctorUser.profile.firstName} ${doctorUser.profile.lastName} has been assigned as your doctor`,
      }),
    ]);

    return assignment;
  }

  async unassignDoctorFromPatient(doctorId: string, patientId: string) {
    const assignment = await this.prisma.doctorPatientAssignment.findUnique({
      where: { doctorId_patientId: { doctorId, patientId } },
    });

    if (!assignment || !assignment.isActive) {
      throw new NotFoundException('Assignment not found');
    }

    return this.prisma.doctorPatientAssignment.update({
      where: { doctorId_patientId: { doctorId, patientId } },
      data: {
        isActive: false,
        unassignedAt: new Date(),
      },
    });
  }

  async getAllUsers(page = 1, limit = 20, role?: string, search?: string) {
    const skip = (page - 1) * limit;
    let whereClause: any = { isDeleted: false };

    if (role) {
      whereClause.role = role;
    }

    if (search) {
      whereClause.OR = [
        { email: { contains: search } },
        { profile: { firstName: { contains: search } } },
        { profile: { lastName: { contains: search } } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        include: {
          profile: true,
          patient: true,
          doctor: true,
          officer: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async toggleUserStatus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
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
      completedAppointments,
      totalPrescriptions,
      activePrescriptions,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isDeleted: false } }),
      this.prisma.user.count({ where: { isActive: true, isDeleted: false } }),
      this.prisma.patient.count({ where: { isDeleted: false } }),
      this.prisma.doctor.count({ where: { isDeleted: false } }),
      this.prisma.appointment.count({ where: { isDeleted: false } }),
      this.prisma.appointment.count({ where: { status: 'COMPLETED', isDeleted: false } }),
      this.prisma.prescription.count({ where: { isDeleted: false } }),
      this.prisma.prescription.count({ where: { status: 'ACTIVE', isDeleted: false } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalPatients,
      totalDoctors,
      totalAppointments,
      completedAppointments,
      totalPrescriptions,
      activePrescriptions,
      usersByRole: await this.getUsersByRole(),
    };
  }

  private async getUsersByRole() {
    const users = await this.prisma.user.groupBy({
      by: ['role'],
      where: { isDeleted: false },
      _count: { role: true },
    });

    return users.reduce((acc, user) => {
      acc[user.role] = user._count.role;
      return acc;
    }, {} as Record<string, number>);
  }

  async getRecentActivity(limit = 50) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getDoctorPatientAssignments(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      this.prisma.doctorPatientAssignment.findMany({
        where: { isActive: true },
        include: {
          doctor: { include: { user: { include: { profile: true } } } },
          patient: { include: { user: { include: { profile: true } } } },
        },
        orderBy: { assignedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.doctorPatientAssignment.count({ where: { isActive: true } }),
    ]);

    return {
      assignments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}