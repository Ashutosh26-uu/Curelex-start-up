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
    return this.prisma.vital.create({
      data: createVitalDto,
      include: {
        patient: { include: { user: { include: { profile: true } } } },
      },
    });
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