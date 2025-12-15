import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class DoctorService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async findAll(page = 1, limit = 20, specialization?: string) {
    const skip = (page - 1) * limit;
    let whereClause: any = { isDeleted: false };

    if (specialization) {
      whereClause.specialization = { contains: specialization };
    }

    const [doctors, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where: whereClause,
        include: {
          user: { include: { profile: true } },
          assignedPatients: {
            where: { isActive: true },
            include: { patient: { include: { user: { include: { profile: true } } } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.doctor.count({ where: whereClause }),
    ]);

    return {
      doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true } },
        assignedPatients: {
          where: { isActive: true },
          include: { patient: { include: { user: { include: { profile: true } } } } },
        },
        appointments: {
          orderBy: { scheduledAt: 'desc' },
          take: 10,
          include: { patient: { include: { user: { include: { profile: true } } } } },
        },
        prescriptions: {
          orderBy: { prescribedAt: 'desc' },
          take: 10,
          include: { patient: { include: { user: { include: { profile: true } } } } },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async findByUserId(userId: string) {
    return this.prisma.doctor.findUnique({
      where: { userId },
      include: {
        user: { include: { profile: true } },
        assignedPatients: {
          where: { isActive: true },
          include: { patient: { include: { user: { include: { profile: true } } } } },
        },
      },
    });
  }

  async getAssignedPatients(doctorId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      this.prisma.doctorPatientAssignment.findMany({
        where: { doctorId, isActive: true },
        include: {
          patient: {
            include: {
              user: { include: { profile: true } },
              vitals: {
                orderBy: { recordedAt: 'desc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { assignedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.doctorPatientAssignment.count({
        where: { doctorId, isActive: true },
      }),
    ]);

    return {
      patients: assignments.map(a => a.patient),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async createPrescription(createPrescriptionDto: CreatePrescriptionDto, doctorUserId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const prescription = await this.prisma.prescription.create({
      data: {
        ...createPrescriptionDto,
        doctorId: doctor.id,
      },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
    });

    // Notify patient
    await this.notificationService.createNotification({
      userId: prescription.patient.userId,
      type: 'PRESCRIPTION' as any,
      title: 'New Prescription',
      message: `Dr. ${prescription.doctor.user.profile.firstName} has prescribed ${prescription.medication}`,
      metadata: JSON.stringify({ prescriptionId: prescription.id }),
    });

    return prescription;
  }

  async getVisitHistory(doctorId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [visits, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where: {
          doctorId,
          status: 'COMPLETED',
          isDeleted: false,
        },
        include: {
          patient: { include: { user: { include: { profile: true } } } },
        },
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({
        where: {
          doctorId,
          status: 'COMPLETED',
          isDeleted: false,
        },
      }),
    ]);

    return {
      visits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getDoctorStats(doctorId: string) {
    const [totalPatients, totalAppointments, completedAppointments, activePrescriptions] = await Promise.all([
      this.prisma.doctorPatientAssignment.count({
        where: { doctorId, isActive: true },
      }),
      this.prisma.appointment.count({
        where: { doctorId, isDeleted: false },
      }),
      this.prisma.appointment.count({
        where: { doctorId, status: 'COMPLETED', isDeleted: false },
      }),
      this.prisma.prescription.count({
        where: { doctorId, status: 'ACTIVE', isDeleted: false },
      }),
    ]);

    return {
      totalPatients,
      totalAppointments,
      completedAppointments,
      activePrescriptions,
    };
  }

  async updateAvailability(doctorId: string, isAvailable: boolean) {
    return this.prisma.doctor.update({
      where: { id: doctorId },
      data: { isAvailable },
    });
  }

  // Junior Doctor Capabilities
  async registerPatientPhysically(juniorDoctorId: string, patientData: {
    name: string;
    phone: string;
    email?: string;
    age: number;
    gender: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  }) {
    const juniorDoctor = await this.prisma.doctor.findUnique({
      where: { id: juniorDoctorId },
      include: { user: true },
    });

    if (!juniorDoctor || juniorDoctor.user.role !== 'JUNIOR_DOCTOR') {
      throw new NotFoundException('Junior doctor not found');
    }

    const patientId = `PAT${patientData.phone.slice(-6)}${Date.now().toString().slice(-4)}`;
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await require('bcryptjs').hash(tempPassword, 12);

    const user = await this.prisma.user.create({
      data: {
        email: patientData.email || `${patientId.toLowerCase()}@temp.com`,
        password: hashedPassword,
        role: 'PATIENT',
        mustChangePassword: true,
        profile: {
          create: {
            firstName: patientData.name.split(' ')[0],
            lastName: patientData.name.split(' ').slice(1).join(' ') || 'Patient',
            phone: patientData.phone,
            gender: patientData.gender,
            dateOfBirth: new Date(new Date().getFullYear() - patientData.age, 0, 1),
          },
        },
        patient: {
          create: {
            patientId,
            emergencyContact: patientData.emergencyContact,
            emergencyPhone: patientData.emergencyPhone,
          },
        },
      },
      include: {
        profile: true,
        patient: true,
      },
    });

    return { user, tempPassword };
  }

  async assignSeniorDoctor(juniorDoctorId: string, patientId: string, seniorDoctorId: string) {
    const juniorDoctor = await this.prisma.doctor.findUnique({
      where: { id: juniorDoctorId },
      include: { user: true },
    });

    if (!juniorDoctor || juniorDoctor.user.role !== 'JUNIOR_DOCTOR') {
      throw new NotFoundException('Junior doctor not found');
    }

    return this.prisma.doctorPatientAssignment.create({
      data: {
        doctorId: seniorDoctorId,
        patientId,
        assignedBy: juniorDoctor.user.id,
      },
    });
  }
}