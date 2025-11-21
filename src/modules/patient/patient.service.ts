import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientRegisterDto } from './dto/patient-register.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PatientService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private websocketGateway: WebSocketGatewayService,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    return this.prisma.patient.create({
      data: {
        ...createPatientDto,
        patientId: `PAT-${Date.now()}`,
      },
      include: {
        user: { include: { profile: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.patient.findMany({
      include: {
        user: { include: { profile: true } },
        appointments: true,
        vitals: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.patient.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true } },
        appointments: { include: { doctor: { include: { user: { include: { profile: true } } } } } },
        vitals: true,
        medicalHistory: true,
        prescriptions: { include: { doctor: { include: { user: { include: { profile: true } } } } } },
      },
    });
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    return this.prisma.patient.update({
      where: { id },
      data: updatePatientDto,
      include: {
        user: { include: { profile: true } },
      },
    });
  }

  async getMedicalHistory(patientId: string) {
    return this.prisma.medicalHistory.findMany({
      where: { patientId },
      orderBy: { diagnosedAt: 'desc' },
    });
  }

  async getPastVisits(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { 
        patientId,
        status: 'COMPLETED',
      },
      include: {
        doctor: { include: { user: { include: { profile: true } } } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async registerPatient(patientRegisterDto: PatientRegisterDto) {
    const { name, age, gender, mobile, email, medicalHistory, symptoms, emergencyContact } = patientRegisterDto;
    
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Split name into first and last name
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create user and patient in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: UserRole.PATIENT,
          profile: {
            create: {
              firstName,
              lastName,
              phone: mobile,
              gender,
              dateOfBirth: new Date(Date.now() - age * 365 * 24 * 60 * 60 * 1000),
            },
          },
        },
        include: { profile: true },
      });

      // Create patient
      const patient = await tx.patient.create({
        data: {
          userId: user.id,
          patientId: `PAT-${Date.now()}`,
          emergencyContact,
          chronicConditions: symptoms,
        },
        include: {
          user: { include: { profile: true } },
        },
      });

      // Create medical history entries
      if (medicalHistory.length > 0) {
        await tx.medicalHistory.createMany({
          data: medicalHistory.map((condition) => ({
            patientId: patient.id,
            condition,
            diagnosis: condition,
            diagnosedAt: new Date(),
          })),
        });
      }

      return { user, patient, tempPassword };
    });

    // Emit WebSocket event
    this.websocketGateway.emitNewPatientRegistered({
      patientId: result.patient.id,
      name,
      email,
      registeredAt: new Date(),
    });

    // Create notifications for officers
    await this.createOfficerNotifications(result.patient, name);

    const { password: _, ...userWithoutPassword } = result.user;
    return {
      user: userWithoutPassword,
      patient: result.patient,
      tempPassword: result.tempPassword,
    };
  }

  private async createOfficerNotifications(patient: any, patientName: string) {
    const officers = await this.prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO],
        },
        isActive: true,
      },
    });

    const notifications = officers.map((officer) => ({
      userId: officer.id,
      type: 'PUSH',
      title: 'New Patient Registration',
      message: `New patient ${patientName} has registered in the system.`,
      metadata: {
        patientId: patient.id,
        type: 'patient-registration',
      },
    }));

    await Promise.all(
      notifications.map((notification) =>
        this.notificationService.create(notification),
      ),
    );
  }
}