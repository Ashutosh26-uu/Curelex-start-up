import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GoogleMeetService } from '../integration/google-meet.service';
import { NotificationService } from '../notification/notification.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    private googleMeetService: GoogleMeetService,
    private notificationService: NotificationService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { patientId, doctorId, scheduledAt, duration = 30, notes } = createAppointmentDto;

    // Check if doctor is available
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: { include: { profile: true } } },
    });

    if (!doctor || !doctor.isAvailable) {
      throw new BadRequestException('Doctor is not available');
    }

    // Check for conflicting appointments
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        doctorId,
        scheduledAt: {
          gte: new Date(scheduledAt),
          lt: new Date(new Date(scheduledAt).getTime() + duration * 60000),
        },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException('Doctor has conflicting appointment');
    }

    // Create Google Meet link
    const meetResult = await this.googleMeetService.createMeetingLink({
      title: `Appointment with Dr. ${doctor.user.profile.firstName}`,
      startTime: new Date(scheduledAt),
      duration,
      attendees: [],
    });

    const appointment = await this.prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        scheduledAt: new Date(scheduledAt),
        duration,
        notes,
        meetLink: meetResult.meetLink,
        status: 'SCHEDULED',
      },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
    });

    // Send notifications
    await Promise.all([
      this.notificationService.sendAppointmentNotification(patientId, appointment),
      this.notificationService.sendAppointmentNotification(doctorId, appointment),
    ]);

    return appointment;
  }

  async findAll(userId: string, role: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    let whereClause: any = { isDeleted: false };

    if (role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({ where: { userId } });
      whereClause.patientId = patient?.id;
    } else if (role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
      whereClause.doctorId = doctor?.id;
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where: whereClause,
        include: {
          patient: { include: { user: { include: { profile: true } } } },
          doctor: { include: { user: { include: { profile: true } } } },
        },
        orderBy: { scheduledAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where: whereClause }),
    ]);

    return {
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id);

    return this.prisma.appointment.update({
      where: { id },
      data: updateAppointmentDto,
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
    });
  }

  async cancel(id: string, cancelReason: string) {
    return this.update(id, {
      status: 'CANCELLED' as any,
      cancelReason,
    });
  }

  async complete(id: string, diagnosis?: string, followUpDate?: Date) {
    return this.update(id, {
      status: 'COMPLETED' as any,
      completedAt: new Date().toISOString(),
      diagnosis,
      followUpDate: followUpDate?.toISOString(),
    });
  }

  async getUpcoming(userId: string, role: string) {
    const now = new Date();
    let whereClause: any = {
      scheduledAt: { gte: now },
      status: 'SCHEDULED',
      isDeleted: false,
    };

    if (role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({ where: { userId } });
      whereClause.patientId = patient?.id;
    } else if (role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
      whereClause.doctorId = doctor?.id;
    }

    return this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    });
  }
}