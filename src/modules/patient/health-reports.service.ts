import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class HealthReportsService {
  constructor(private prisma: PrismaService) {}

  async uploadReport(patientId: string, reportData: {
    title: string;
    type: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string;
    notes?: string;
  }) {
    // In a real implementation, you would first upload the file to cloud storage
    // and then store the metadata in the database
    
    return this.prisma.$executeRaw`
      INSERT INTO health_reports (
        id, patient_id, title, type, file_path, file_size, 
        mime_type, uploaded_by, notes, created_at, updated_at
      ) VALUES (
        ${this.generateId()}, ${patientId}, ${reportData.title}, 
        ${reportData.type}, ${reportData.filePath}, ${reportData.fileSize},
        ${reportData.mimeType}, ${reportData.uploadedBy}, ${reportData.notes || ''},
        NOW(), NOW()
      )
    `;
  }

  async getPatientReports(patientId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    // Since we don't have the health_reports table in schema, 
    // we'll use medical_history as a placeholder
    const reports = await this.prisma.medicalHistory.findMany({
      where: { 
        patientId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await this.prisma.medicalHistory.count({
      where: { patientId, isDeleted: false },
    });

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async annotateReport(reportId: string, doctorId: string, annotation: string) {
    // In a real implementation, this would update the health_reports table
    // For now, we'll create a medical history entry with the annotation
    
    const report = await this.prisma.medicalHistory.findUnique({
      where: { id: reportId },
      include: { patient: true },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return this.prisma.medicalHistory.create({
      data: {
        patientId: report.patientId,
        condition: 'Doctor Annotation',
        diagnosis: annotation,
        treatment: `Annotation for report: ${report.condition}`,
        diagnosedAt: new Date(),
      },
    });
  }

  async getReportAnnotations(reportId: string) {
    // Get all annotations for a specific report
    return this.prisma.medicalHistory.findMany({
      where: {
        condition: 'Doctor Annotation',
        treatment: { contains: reportId },
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteReport(reportId: string, userId: string) {
    // Soft delete the report
    return this.prisma.medicalHistory.update({
      where: { id: reportId },
      data: { 
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async getReportsByType(patientId: string, type: string) {
    return this.prisma.medicalHistory.findMany({
      where: {
        patientId,
        condition: { contains: type },
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // File validation helpers
  validateFileType(mimeType: string): boolean {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return allowedTypes.includes(mimeType);
  }

  validateFileSize(size: number): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return size <= maxSize;
  }
}