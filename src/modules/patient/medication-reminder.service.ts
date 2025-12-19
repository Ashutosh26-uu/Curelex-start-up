import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class MedicationReminderService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async sendMedicationReminders() {
    const activePrescriptions = await this.prisma.prescription.findMany({
      where: { status: 'ACTIVE' },
      include: { patient: { include: { user: true } } },
    });

    for (const prescription of activePrescriptions) {
      await this.notificationService.createNotification({
        userId: prescription.patient.userId,
        type: 'MEDICATION_REMINDER' as any,
        title: 'Medication Reminder',
        message: `Time to take: ${prescription.medication} - ${prescription.dosage}`,
      });
    }
  }
}