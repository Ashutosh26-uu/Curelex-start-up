import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class EnhancedMedicationReminderService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async createMedicationReminder(prescriptionId: string, reminderTimes: string[]) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: { patient: { include: { user: { include: { profile: true } } } } },
    });

    if (!prescription) {
      throw new Error('Prescription not found');
    }

    // Store reminder schedule in prescription metadata
    const reminderData = {
      times: reminderTimes,
      enabled: true,
      adherenceTracking: true,
    };

    await this.prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        instructions: prescription.instructions + 
          `\n\nReminder Schedule: ${JSON.stringify(reminderData)}`,
      },
    });

    return { success: true, reminderData };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sendMedicationReminders() {
    const activePrescriptions = await this.prisma.prescription.findMany({
      where: {
        status: 'ACTIVE',
        isDeleted: false,
        endDate: { gte: new Date() },
      },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
      },
    });

    const currentHour = new Date().getHours();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:00`;

    for (const prescription of activePrescriptions) {
      const reminderData = this.extractReminderData(prescription.instructions);
      
      if (reminderData?.enabled && reminderData.times?.includes(currentTime)) {
        await this.sendReminderNotification(prescription);
      }
    }
  }

  async trackMedicationAdherence(prescriptionId: string, taken: boolean, timestamp?: Date) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });

    if (!prescription) {
      throw new Error('Prescription not found');
    }

    // Create adherence record in medical history
    await this.prisma.medicalHistory.create({
      data: {
        patientId: prescription.patientId,
        condition: 'Medication Adherence',
        diagnosis: `${prescription.medication} - ${taken ? 'Taken' : 'Missed'}`,
        treatment: JSON.stringify({
          prescriptionId,
          taken,
          timestamp: timestamp || new Date(),
          medication: prescription.medication,
          dosage: prescription.dosage,
        }),
        diagnosedAt: timestamp || new Date(),
      },
    });

    return { success: true };
  }

  async getMedicationAdherence(patientId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const adherenceRecords = await this.prisma.medicalHistory.findMany({
      where: {
        patientId,
        condition: 'Medication Adherence',
        diagnosedAt: { gte: startDate },
        isDeleted: false,
      },
      orderBy: { diagnosedAt: 'desc' },
    });

    const adherenceData = adherenceRecords.map(record => {
      const treatment = JSON.parse(record.treatment || '{}');
      return {
        date: record.diagnosedAt,
        medication: treatment.medication,
        taken: treatment.taken,
        prescriptionId: treatment.prescriptionId,
      };
    });

    // Calculate adherence percentage
    const totalDoses = adherenceData.length;
    const takenDoses = adherenceData.filter(d => d.taken).length;
    const adherencePercentage = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;

    return {
      adherencePercentage: Math.round(adherencePercentage),
      totalDoses,
      takenDoses,
      missedDoses: totalDoses - takenDoses,
      records: adherenceData,
    };
  }

  async generateAdherenceReport(patientId: string, period = 'monthly') {
    const days = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 90;
    const adherence = await this.getMedicationAdherence(patientId, days);

    // Group by medication
    const medicationAdherence = adherence.records.reduce((acc, record) => {
      if (!acc[record.medication]) {
        acc[record.medication] = { taken: 0, total: 0 };
      }
      acc[record.medication].total++;
      if (record.taken) acc[record.medication].taken++;
      return acc;
    }, {} as Record<string, { taken: number; total: number }>);

    return {
      period,
      overallAdherence: adherence.adherencePercentage,
      medicationBreakdown: Object.entries(medicationAdherence).map(([medication, data]) => ({
        medication,
        adherencePercentage: Math.round((data.taken / data.total) * 100),
        taken: data.taken,
        total: data.total,
      })),
      recommendations: this.generateAdherenceRecommendations(adherence.adherencePercentage),
    };
  }

  private async sendReminderNotification(prescription: any) {
    await this.notificationService.createNotification({
      userId: prescription.patient.userId,
      type: 'MEDICATION_REMINDER' as any,
      title: 'Medication Reminder',
      message: `Time to take your medication: ${prescription.medication} (${prescription.dosage})`,
      metadata: JSON.stringify({
        prescriptionId: prescription.id,
        medication: prescription.medication,
        dosage: prescription.dosage,
      }),
    });
  }

  private extractReminderData(instructions: string | null): any {
    if (!instructions) return null;
    
    try {
      const reminderMatch = instructions.match(/Reminder Schedule: ({.*})/);
      return reminderMatch ? JSON.parse(reminderMatch[1]) : null;
    } catch {
      return null;
    }
  }

  private generateAdherenceRecommendations(adherencePercentage: number): string[] {
    const recommendations = [];

    if (adherencePercentage < 50) {
      recommendations.push('Consider setting up more frequent reminders');
      recommendations.push('Discuss medication concerns with your doctor');
      recommendations.push('Use a pill organizer to track daily medications');
    } else if (adherencePercentage < 80) {
      recommendations.push('Try linking medication times to daily routines');
      recommendations.push('Set phone alarms for medication times');
    } else {
      recommendations.push('Great job maintaining medication adherence!');
      recommendations.push('Continue your current routine');
    }

    return recommendations;
  }
}