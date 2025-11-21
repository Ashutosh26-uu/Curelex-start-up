import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GoogleMeetService } from '../integration/google-meet.service';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    private googleMeetService: GoogleMeetService,
    private websocketGateway: WebSocketGatewayService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    const meetLink = await this.googleMeetService.createMeeting({
      summary: 'Medical Consultation',
      startTime: createAppointmentDto.scheduledAt,
      duration: createAppointmentDto.duration || 30,
    });

    const appointment = await this.prisma.appointment.create({
      data: {
        ...createAppointmentDto,
        meetLink,
      },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
    });

    // Broadcast appointment scheduled event
    this.websocketGateway.broadcastAppointmentScheduled({
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      patientName: `${appointment.patient.user.profile?.firstName} ${appointment.patient.user.profile?.lastName}`,
      doctorName: `Dr. ${appointment.doctor.user.profile?.firstName} ${appointment.doctor.user.profile?.lastName}`,
      scheduledAt: appointment.scheduledAt,
      duration: appointment.duration,
      meetLink: appointment.meetLink,
      status: appointment.status,
    });

    return appointment;
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
    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: updateAppointmentDto,
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
    });

    // Broadcast appointment update
    this.websocketGateway.sendToUser(appointment.patient.userId, 'appointment:updated', {
      type: 'APPOINTMENT_UPDATED',
      data: {
        appointmentId: appointment.id,
        status: appointment.status,
        scheduledAt: appointment.scheduledAt,
        notes: appointment.notes,
      },
      timestamp: new Date().toISOString(),
    });

    this.websocketGateway.sendToUser(appointment.doctor.userId, 'appointment:updated', {
      type: 'APPOINTMENT_UPDATED', 
      data: {
        appointmentId: appointment.id,
        status: appointment.status,
        scheduledAt: appointment.scheduledAt,
        notes: appointment.notes,
      },
      timestamp: new Date().toISOString(),
    });

    return appointment;
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