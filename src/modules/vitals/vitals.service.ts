import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
import { CreateVitalDto } from './dto/create-vital.dto';
import { UpdateVitalsDto } from './dto/update-vitals.dto';

@Injectable()
export class VitalsService {
  constructor(
    private prisma: PrismaService,
    private websocketGateway: WebSocketGatewayService,
  ) {}

  async create(createVitalDto: CreateVitalDto) {
    const vital = await this.prisma.vital.create({
      data: createVitalDto,
      include: {
        patient: { 
          include: { 
            user: { include: { profile: true } },
            assignedDoctors: { where: { isActive: true }, include: { doctor: true } }
          } 
        },
      },
    });

    // Check for critical values and broadcast
    const isCritical = this.checkCriticalVitals(vital);
    
    // Broadcast vitals update
    this.websocketGateway.broadcastVitalsUpdate({
      patientId: vital.patientId,
      doctorId: vital.patient.assignedDoctors[0]?.doctor?.id,
      vitalId: vital.id,
      type: vital.type,
      value: vital.value,
      unit: vital.unit,
      recordedAt: vital.recordedAt,
      patientName: `${vital.patient.user.profile?.firstName} ${vital.patient.user.profile?.lastName}`,
      isCritical,
    });

    // Send critical alert if needed
    if (isCritical) {
      this.websocketGateway.broadcastCriticalAlert({
        type: 'CRITICAL_VITALS',
        severity: 'CRITICAL',
        patientId: vital.patientId,
        patientName: `${vital.patient.user.profile?.firstName} ${vital.patient.user.profile?.lastName}`,
        vitalType: vital.type,
        value: vital.value,
        unit: vital.unit,
        message: `Critical ${vital.type.toLowerCase().replace('_', ' ')} detected: ${vital.value} ${vital.unit}`,
      });
    }

    return vital;
  }

  private checkCriticalVitals(vital: any): boolean {
    const { type, value } = vital;
    const numericValue = parseFloat(value);

    switch (type) {
      case 'BLOOD_PRESSURE':
        // Check for hypertensive crisis (>180/120)
        const bpMatch = value.match(/(\d+)\/(\d+)/);
        if (bpMatch) {
          const systolic = parseInt(bpMatch[1]);
          const diastolic = parseInt(bpMatch[2]);
          return systolic > 180 || diastolic > 120;
        }
        return false;
      
      case 'HEART_RATE':
        return numericValue > 120 || numericValue < 50;
      
      case 'OXYGEN_SATURATION':
        return numericValue < 90;
      
      case 'BLOOD_SUGAR':
        return numericValue > 300 || numericValue < 50;
      
      case 'TEMPERATURE':
        return numericValue > 103 || numericValue < 95;
      
      default:
        return false;
    }
  }

  async findByPatient(patientId: string) {
    return this.prisma.vital.findMany({
      where: { patientId },
      orderBy: { recordedAt: 'desc' },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
      },
    });
  }

  async getLatestVitals(patientId: string) {
    const vitals = await this.prisma.vital.findMany({
      where: { patientId },
      orderBy: { recordedAt: 'desc' },
      take: 10,
    });

    const groupedVitals = vitals.reduce((acc, vital) => {
      if (!acc[vital.type]) {
        acc[vital.type] = vital;
      }
      return acc;
    }, {});

    return Object.values(groupedVitals);
  }

  async getVitalHistory(patientId: string, type: string) {
    return this.prisma.vital.findMany({
      where: { 
        patientId,
        type: type as any,
      },
      orderBy: { recordedAt: 'desc' },
      take: 50,
    });
  }
}