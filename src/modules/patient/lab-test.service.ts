import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class LabTestService {
  constructor(private prisma: PrismaService) {}

  async bookLabTest(patientId: string, testType: string, doctorId?: string) {
    return {
      id: `LAB${Date.now()}`,
      patientId,
      testType,
      status: 'BOOKED',
      scheduledDate: new Date(),
    };
  }

  async getPatientReports(patientId: string) {
    return [];
  }
}