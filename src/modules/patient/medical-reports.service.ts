import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class MedicalReportsService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async uploadReport(patientId: string, reportData: {
    title: string;
    type: 'LAB_RESULT' | 'SCAN' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'OTHER';
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string;
    notes?: string;
    labName?: string;
    testDate?: Date;
  }) {
    // Create medical history entry for the report
    const report = await this.prisma.medicalHistory.create({
      data: {
        patientId,
        condition: `${reportData.type}: ${reportData.title}`,
        diagnosis: reportData.notes || 'Medical report uploaded',
        treatment: JSON.stringify({
          filePath: reportData.filePath,
          fileSize: reportData.fileSize,
          mimeType: reportData.mimeType,
          labName: reportData.labName,
          testDate: reportData.testDate,
        }),
        diagnosedAt: reportData.testDate || new Date(),
      },
    });

    // Notify patient
    await this.notificationService.createNotification({
      userId: (await this.prisma.patient.findUnique({ 
        where: { id: patientId }, 
        include: { user: true } 
      }))?.userId || '',
      type: 'REPORT_UPLOADED' as any,
      title: 'New Medical Report',
      message: `Your ${reportData.type.toLowerCase().replace('_', ' ')} report "${reportData.title}" has been uploaded`,
      metadata: JSON.stringify({ reportId: report.id, type: reportData.type }),
    });

    return report;
  }

  async getPatientReports(patientId: string, type?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    let whereClause: any = { 
      patientId,
      isDeleted: false,
      condition: { contains: type || '' }
    };

    const [reports, total] = await Promise.all([
      this.prisma.medicalHistory.findMany({
        where: whereClause,
        orderBy: { diagnosedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.medicalHistory.count({ where: whereClause }),
    ]);

    return {
      reports: reports.map(report => ({
        ...report,
        metadata: this.parseReportMetadata(report.treatment),
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async shareReportWithDoctor(reportId: string, doctorId: string, patientId: string) {
    // Verify doctor-patient relationship
    const assignment = await this.prisma.doctorPatientAssignment.findFirst({
      where: { doctorId, patientId, isActive: true },
    });

    if (!assignment) {
      throw new BadRequestException('Doctor not assigned to this patient');
    }

    const report = await this.prisma.medicalHistory.findUnique({
      where: { id: reportId },
      include: { patient: { include: { user: { include: { profile: true } } } } },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Notify doctor
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });

    if (doctor) {
      await this.notificationService.createNotification({
        userId: doctor.userId,
        type: 'REPORT_SHARED' as any,
        title: 'Patient Report Shared',
        message: `${report.patient.user.profile?.firstName} has shared a medical report with you`,
        metadata: JSON.stringify({ reportId, patientId }),
      });
    }

    return { success: true };
  }

  async annotateReport(reportId: string, doctorId: string, annotation: string) {
    const report = await this.prisma.medicalHistory.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Create annotation as a new medical history entry
    return this.prisma.medicalHistory.create({
      data: {
        patientId: report.patientId,
        condition: 'Doctor Annotation',
        diagnosis: annotation,
        treatment: `Annotation for report: ${reportId}`,
        diagnosedAt: new Date(),
      },
    });
  }

  private parseReportMetadata(treatment: string | null) {
    try {
      return treatment ? JSON.parse(treatment) : {};
    } catch {
      return {};
    }
  }

  validateFileType(mimeType: string): boolean {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/dicom', // Medical imaging
    ];
    return allowedTypes.includes(mimeType);
  }

  validateFileSize(size: number): boolean {
    const maxSize = 50 * 1024 * 1024; // 50MB for medical files
    return size <= maxSize;
  }
}