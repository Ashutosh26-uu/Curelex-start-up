import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { ScheduleAppointmentDto } from './dto/schedule-appointment.dto';

@Injectable()
export class DoctorService {
  constructor(private prisma: PrismaService) {}

  async create(createDoctorDto: CreateDoctorDto) {
    return this.prisma.doctor.create({
      data: {
        ...createDoctorDto,
        doctorId: `DOC-${Date.now()}`,
      },
      include: {
        user: { include: { profile: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true } },
        assignedPatients: {
          include: {
            patient: { include: { user: { include: { profile: true } } } },
          },
        },
        appointments: {
          include: {
            patient: { include: { user: { include: { profile: true } } } },
          },
        },
      },
    });
  }

  async getAssignedPatients(doctorId: string) {
    return this.prisma.doctorPatientAssignment.findMany({
      where: { doctorId, isActive: true },
      include: {
        patient: {
          include: {
            user: { include: { profile: true } },
            vitals: { orderBy: { recordedAt: 'desc' }, take: 5 },
          },
        },
      },
    });
  }

  async createPrescription(createPrescriptionDto: CreatePrescriptionDto) {
    return this.prisma.prescription.create({
      data: createPrescriptionDto,
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
    });
  }

  async getVisitHistory(doctorId: string) {
    return this.prisma.appointment.findMany({
      where: { 
        doctorId,
        status: 'COMPLETED',
      },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getPatientRecords(patientId: string) {
    return this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: { include: { profile: true } },
        medicalHistory: { orderBy: { diagnosedAt: 'desc' } },
        prescriptions: { 
          include: { doctor: { include: { user: { include: { profile: true } } } } },
          orderBy: { prescribedAt: 'desc' }
        },
        vitals: { orderBy: { recordedAt: 'desc' }, take: 10 },
        appointments: {
          include: { doctor: { include: { user: { include: { profile: true } } } } },
          orderBy: { scheduledAt: 'desc' },
          take: 5
        }
      },
    });
  }

  async createPatientPrescription(
    patientId: string, 
    prescriptionData: Omit<CreatePrescriptionDto, 'patientId'>, 
    doctorUserId: string
  ) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId }
    });

    return this.prisma.prescription.create({
      data: {
        ...prescriptionData,
        patientId,
        doctorId: doctor.id,
      },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
    });
  }

  async scheduleAppointment(appointmentData: ScheduleAppointmentDto, doctorUserId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId }
    });

    return this.prisma.appointment.create({
      data: {
        ...appointmentData,
        doctorId: doctor.id,
        scheduledAt: new Date(appointmentData.scheduledAt),
      },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
    });
  }
}