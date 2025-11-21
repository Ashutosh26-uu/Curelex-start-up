import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GoogleMeetService } from '../integration/google-meet.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    private googleMeetService: GoogleMeetService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    const meetLink = await this.googleMeetService.createMeeting({
      summary: 'Medical Consultation',
      startTime: createAppointmentDto.scheduledAt,
      duration: createAppointmentDto.duration || 30,
    });

    return this.prisma.appointment.create({
      data: {
        ...createAppointmentDto,
        meetLink,
      },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
    });
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
    });
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    return this.prisma.appointment.update({
      where: { id },
      data: updateAppointmentDto,
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
    });
  }

  async getUpcomingAppointments(userId: string, role: string) {
    const where = role === 'PATIENT' 
      ? { patient: { userId } }
      : { doctor: { userId } };

    return this.prisma.appointment.findMany({
      where: {
        ...where,
        scheduledAt: { gte: new Date() },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}