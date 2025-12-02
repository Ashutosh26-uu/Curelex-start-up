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

  async createNotification(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({
        where: { userId, isDeleted: false },
      }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async sendWelcomeNotification(userId: string, firstName: string) {
    await this.createNotification({
      userId,
      type: 'WELCOME' as any,
      title: 'Welcome to Healthcare Platform',
      message: `Welcome ${firstName}! Your account has been created successfully.`,
    });
  }

  async sendAppointmentNotification(userId: string, appointmentData: any) {
    await this.createNotification({
      userId,
      type: 'APPOINTMENT' as any,
      title: 'Appointment Scheduled',
      message: `Your appointment has been scheduled for ${appointmentData.scheduledAt}`,
      metadata: JSON.stringify(appointmentData),
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await this.emailService.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });
  }

  async sendAppointmentReminder(patientId: string, appointmentData: any) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: { include: { profile: true } } },
    });

    if (patient?.user.profile?.phone) {
      await this.smsService.sendSms({
        to: patient.user.profile.phone,
        message: `Reminder: You have an appointment scheduled for ${appointmentData.scheduledAt}`,
      });
    }
  }
}