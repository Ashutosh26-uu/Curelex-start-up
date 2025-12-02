import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PrescriptionService {
  constructor(private prisma: PrismaService) {}

  async getPatientPrescriptions(patientId: string, status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    let whereClause: any = { patientId, isDeleted: false };

    if (status) {
      whereClause.status = status;
    }

    const [prescriptions, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where: whereClause,
        include: {
          doctor: { include: { user: { include: { profile: true } } } },
        },
        orderBy: { prescribedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.prescription.count({ where: whereClause }),
    ]);

    return {
      prescriptions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getMyPrescriptions(userId: string, status?: string, page = 1, limit = 20) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) return { prescriptions: [], pagination: { page, limit, total: 0, pages: 0 } };

    return this.getPatientPrescriptions(patient.id, status, page, limit);
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.prescription.update({
      where: { id },
      data: { status },
    });
  }
}