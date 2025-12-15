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

  // Real-time availability view
  async getDoctorAvailability(doctorId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedSlots = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        isDeleted: false,
      },
      select: {
        scheduledAt: true,
        duration: true,
      },
    });

    // Generate available slots (9 AM to 6 PM, 30-minute slots)
    const availableSlots = [];
    const workStart = new Date(startOfDay);
    workStart.setHours(9, 0, 0, 0);
    const workEnd = new Date(startOfDay);
    workEnd.setHours(18, 0, 0, 0);

    for (let time = new Date(workStart); time < workEnd; time.setMinutes(time.getMinutes() + 30)) {
      const slotTime = new Date(time);
      const isBooked = bookedSlots.some(slot => {
        const slotStart = new Date(slot.scheduledAt);
        const slotEnd = new Date(slotStart.getTime() + (slot.duration * 60000));
        return slotTime >= slotStart && slotTime < slotEnd;
      });

      if (!isBooked) {
        availableSlots.push({
          time: slotTime.toISOString(),
          available: true,
        });
      }
    }

    return availableSlots;
  }

  // Auto-scheduling
  async autoScheduleAppointment(patientId: string, specialization: string, preferredDate?: Date) {
    const searchDate = preferredDate || new Date();
    
    // Find available doctors with the specialization
    const availableDoctors = await this.prisma.doctor.findMany({
      where: {
        specialization: { contains: specialization },
        isAvailable: true,
        isDeleted: false,
      },
      include: {
        user: { include: { profile: true } },
      },
    });

    if (availableDoctors.length === 0) {
      throw new BadRequestException('No doctors available for this specialization');
    }

    // Find the earliest available slot
    for (const doctor of availableDoctors) {
      const availability = await this.getDoctorAvailability(doctor.id, searchDate);
      
      if (availability.length > 0) {
        const earliestSlot = availability[0];
        
        return this.create({
          patientId,
          doctorId: doctor.id,
          scheduledAt: earliestSlot.time,
          duration: 30,
        });
      }
    }

    throw new BadRequestException('No available slots found');
  }

  // Waiting list management
  async addToWaitingList(patientId: string, doctorId: string, preferredDate: Date) {
    // In a real implementation, this would use a separate waiting_list table
    return this.prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        scheduledAt: preferredDate,
        status: 'WAITING',
        notes: 'Patient added to waiting list',
      },
    });
  }

  async processWaitingList(doctorId: string) {
    const waitingAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        status: 'WAITING',
        isDeleted: false,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
      },
    });

    const processedAppointments = [];

    for (const waitingAppointment of waitingAppointments) {
      try {
        const availability = await this.getDoctorAvailability(doctorId, new Date());
        
        if (availability.length > 0) {
          const updatedAppointment = await this.prisma.appointment.update({
            where: { id: waitingAppointment.id },
            data: {
              scheduledAt: new Date(availability[0].time),
              status: 'SCHEDULED',
              notes: 'Automatically scheduled from waiting list',
            },
          });

          // Notify patient
          await this.notificationService.createNotification({
            userId: waitingAppointment.patient.userId,
            type: 'APPOINTMENT' as any,
            title: 'Appointment Scheduled',
            message: `Your appointment has been scheduled for ${new Date(availability[0].time).toLocaleString()}`,
          });

          processedAppointments.push(updatedAppointment);
        }
      } catch (error) {
        console.error('Error processing waiting list appointment:', error);
      }
    }

    return processedAppointments;
  }
}