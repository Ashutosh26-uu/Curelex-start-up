import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  async registerPatient(patientData: any) {
    const hashedPassword = await bcrypt.hash(patientData.password || '123456', 12);
    
    return this.prisma.user.create({
      data: {
        email: patientData.email,
        password: hashedPassword,
        role: 'PATIENT',
        profile: {
          create: {
            firstName: patientData.firstName || patientData.name?.split(' ')[0] || 'Patient',
            lastName: patientData.lastName || patientData.name?.split(' ')[1] || 'User',
            phone: patientData.mobile || patientData.phone,
            gender: patientData.gender,
          },
        },
        patient: {
          create: {
            patientId: `PAT-${Date.now()}`,
            emergencyContact: patientData.emergencyContact,
            emergencyPhone: patientData.emergencyPhone,
            allergies: patientData.medicalHistory?.join(', ') || 'None',
          },
        },
      },
      include: {
        profile: true,
        patient: true,
      },
    });
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    let whereClause: any = { isDeleted: false };

    if (search) {
      whereClause = {
        ...whereClause,
        OR: [
          { patientId: { contains: search } },
          { user: { profile: { firstName: { contains: search } } } },
          { user: { profile: { lastName: { contains: search } } } },
          { user: { email: { contains: search } } },
        ],
      };
    }

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where: whereClause,
        include: {
          user: { include: { profile: true } },
          assignedDoctors: {
            where: { isActive: true },
            include: { doctor: { include: { user: { include: { profile: true } } } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.patient.count({ where: whereClause }),
    ]);

    return {
      patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true } },
        assignedDoctors: {
          where: { isActive: true },
          include: { doctor: { include: { user: { include: { profile: true } } } } },
        },
        appointments: {
          orderBy: { scheduledAt: 'desc' },
          take: 5,
          include: { doctor: { include: { user: { include: { profile: true } } } } },
        },
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
        medicalHistory: {
          where: { isActive: true },
          orderBy: { diagnosedAt: 'desc' },
        },
        prescriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { prescribedAt: 'desc' },
          include: { doctor: { include: { user: { include: { profile: true } } } } },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async findByUserId(userId: string) {
    return this.prisma.patient.findUnique({
      where: { userId },
      include: {
        user: { include: { profile: true } },
        assignedDoctors: {
          where: { isActive: true },
          include: { doctor: { include: { user: { include: { profile: true } } } } },
        },
      },
    });
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const patient = await this.findOne(id);

    return this.prisma.patient.update({
      where: { id },
      data: updatePatientDto,
      include: {
        user: { include: { profile: true } },
        assignedDoctors: {
          where: { isActive: true },
          include: { doctor: { include: { user: { include: { profile: true } } } } },
        },
      },
    });
  }

  async getMedicalHistory(patientId: string) {
    return this.prisma.medicalHistory.findMany({
      where: { patientId, isDeleted: false },
      orderBy: { diagnosedAt: 'desc' },
    });
  }

  async addMedicalHistory(patientId: string, historyData: {
    condition: string;
    diagnosis: string;
    treatment?: string;
    severity?: string;
    diagnosedAt: Date;
  }) {
    return this.prisma.medicalHistory.create({
      data: {
        patientId,
        ...historyData,
      },
    });
  }

  async getPastVisits(patientId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [visits, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where: {
          patientId,
          status: 'COMPLETED',
          isDeleted: false,
        },
        include: {
          doctor: { include: { user: { include: { profile: true } } } },
        },
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({
        where: {
          patientId,
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

  async getPatientStats() {
    const [total, active, unassigned, newThisMonth] = await Promise.all([
      this.prisma.patient.count({ where: { isDeleted: false } }),
      this.prisma.patient.count({ where: { status: 'ACTIVE', isDeleted: false } }),
      this.prisma.patient.count({ where: { status: 'UNASSIGNED', isDeleted: false } }),
      this.prisma.patient.count({
        where: {
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          isDeleted: false,
        },
      }),
    ]);

    return { total, active, unassigned, newThisMonth };
  }
}