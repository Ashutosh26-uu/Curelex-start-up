import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateVitalDto } from './dto/create-vital.dto';
import { UpdateVitalsDto } from './dto/update-vitals.dto';

@Injectable()
export class VitalsService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(createVitalDto: CreateVitalDto, recordedByUserId: string) {
    const { patientId, type, value, unit, notes } = createVitalDto;

    // Get doctor info if recorded by doctor
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: recordedByUserId },
    });

    const vital = await this.prisma.vital.create({
      data: {
        patientId,
        doctorId: doctor?.id,
        type,
        value,
        unit,
        notes,
        recordedBy: recordedByUserId,
      },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        recordedByUser: { include: { user: { include: { profile: true } } } },
      },
    });

    // Check for critical values and send alerts
    await this.checkCriticalValues(vital);

    return vital;
  }

  async findPatientVitals(patientId: string, type?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    let whereClause: any = { patientId, isDeleted: false };

    if (type) {
      whereClause.type = type;
    }

    const [vitals, total] = await Promise.all([
      this.prisma.vital.findMany({
        where: whereClause,
        include: {
          recordedByUser: { include: { user: { include: { profile: true } } } },
        },
        orderBy: { recordedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.vital.count({ where: whereClause }),
    ]);

    return {
      vitals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getLatestVitals(patientId: string) {
    const vitalTypes = ['BLOOD_PRESSURE', 'HEART_RATE', 'OXYGEN_SATURATION', 'BLOOD_SUGAR', 'TEMPERATURE'];
    
    const latestVitals = await Promise.all(
      vitalTypes.map(async (type) => {
        const vital = await this.prisma.vital.findFirst({
          where: { patientId, type, isDeleted: false },
          orderBy: { recordedAt: 'desc' },
          include: {
            recordedByUser: { include: { user: { include: { profile: true } } } },
          },
        });
        return { type, vital };
      })
    );

    return latestVitals.filter(item => item.vital !== null);
  }

  async update(id: string, updateVitalsDto: UpdateVitalsDto, userId: string) {
    const vital = await this.prisma.vital.findUnique({
      where: { id },
    });

    if (!vital) {
      throw new NotFoundException('Vital record not found');
    }

    if (vital.recordedBy !== userId) {
      throw new ForbiddenException('You can only update your own vital records');
    }

    return this.prisma.vital.update({
      where: { id },
      data: updateVitalsDto,
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        recordedByUser: { include: { user: { include: { profile: true } } } },
      },
    });
  }

  async delete(id: string, userId: string) {
    const vital = await this.prisma.vital.findUnique({
      where: { id },
    });

    if (!vital) {
      throw new NotFoundException('Vital record not found');
    }

    if (vital.recordedBy !== userId) {
      throw new ForbiddenException('You can only delete your own vital records');
    }

    return this.prisma.vital.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  private async checkCriticalValues(vital: any) {
    let isCritical = false;
    let alertMessage = '';

    switch (vital.type) {
      case 'BLOOD_PRESSURE':
        const [systolic, diastolic] = vital.value.split('/').map(Number);
        if (systolic > 180 || diastolic > 120) {
          isCritical = true;
          alertMessage = `Critical blood pressure: ${vital.value}`;
        }
        break;
      case 'HEART_RATE':
        const heartRate = Number(vital.value);
        if (heartRate > 100 || heartRate < 60) {
          isCritical = true;
          alertMessage = `Abnormal heart rate: ${vital.value} bpm`;
        }
        break;
      case 'OXYGEN_SATURATION':
        const oxygen = Number(vital.value);
        if (oxygen < 95) {
          isCritical = true;
          alertMessage = `Low oxygen saturation: ${vital.value}%`;
        }
        break;
      case 'BLOOD_SUGAR':
        const sugar = Number(vital.value);
        if (sugar > 200 || sugar < 70) {
          isCritical = true;
          alertMessage = `Critical blood sugar: ${vital.value} mg/dL`;
        }
        break;
    }

    if (isCritical) {
      // Notify patient's assigned doctors
      const assignments = await this.prisma.doctorPatientAssignment.findMany({
        where: { patientId: vital.patientId, isActive: true },
        include: { doctor: { include: { user: true } } },
      });

      for (const assignment of assignments) {
        await this.notificationService.createNotification({
          userId: assignment.doctor.userId,
          type: 'VITAL_ALERT' as any,
          title: 'Critical Vital Alert',
          message: `${vital.patient.user.profile.firstName} ${vital.patient.user.profile.lastName}: ${alertMessage}`,
          metadata: JSON.stringify({ vitalId: vital.id, patientId: vital.patientId }),
        });
      }
    }
  }
}