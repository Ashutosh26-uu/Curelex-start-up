import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: createNotificationDto,
    });

    // Send notification based on type
    if (createNotificationDto.type === 'EMAIL') {
      await this.sendEmail(createNotificationDto);
    } else if (createNotificationDto.type === 'SMS') {
      await this.sendSms(createNotificationDto);
    }

    return notification;
  }

  async findByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  private async sendEmail(notification: CreateNotificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: notification.userId },
      include: { profile: true },
    });

    if (user?.email) {
      await this.emailService.sendEmail({
        to: user.email,
        subject: notification.title,
        text: notification.message,
      });
    }
  }

  private async sendSms(notification: CreateNotificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: notification.userId },
      include: { profile: true },
    });

    if (user?.profile?.phone) {
      await this.smsService.sendSms({
        to: user.profile.phone,
        message: `${notification.title}: ${notification.message}`,
      });
    }
  }

  async sendAppointmentReminder(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
    });

    if (appointment) {
      const message = `Reminder: You have an appointment with Dr. ${appointment.doctor.user.profile.firstName} ${appointment.doctor.user.profile.lastName} on ${appointment.scheduledAt}`;
      
      await this.create({
        userId: appointment.patient.userId,
        type: 'EMAIL',
        title: 'Appointment Reminder',
        message,
      });
    }
  }
}