import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class LabIntegrationService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async bookLabTest(patientId: string, testData: {
    testType: string;
    labName: string;
    doctorId?: string;
    urgency: 'ROUTINE' | 'URGENT' | 'STAT';
    instructions?: string;
    preferredDate?: Date;
  }) {
    // Create appointment for lab test
    const labAppointment = await this.prisma.appointment.create({
      data: {
        patientId,
        doctorId: testData.doctorId || (await this.getDefaultLabDoctor()).id,
        scheduledAt: testData.preferredDate || new Date(),
        duration: 30,
        status: 'SCHEDULED',
        notes: `Lab Test: ${testData.testType} at ${testData.labName}`,
      },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
      },
    });

    // Create medical history entry for test booking
    await this.prisma.medicalHistory.create({
      data: {
        patientId,
        condition: 'Lab Test Booked',
        diagnosis: testData.testType,
        treatment: JSON.stringify({
          labName: testData.labName,
          urgency: testData.urgency,
          instructions: testData.instructions,
          appointmentId: labAppointment.id,
          status: 'BOOKED',
        }),
        diagnosedAt: new Date(),
      },
    });

    // Send notifications
    await this.notificationService.createNotification({
      userId: labAppointment.patient.userId,
      type: 'LAB_TEST_BOOKED' as any,
      title: 'Lab Test Scheduled',
      message: `Your ${testData.testType} test has been scheduled at ${testData.labName}`,
      metadata: JSON.stringify({
        appointmentId: labAppointment.id,
        testType: testData.testType,
        labName: testData.labName,
      }),
    });

    return {
      appointmentId: labAppointment.id,
      testType: testData.testType,
      labName: testData.labName,
      scheduledAt: labAppointment.scheduledAt,
      status: 'BOOKED',
    };
  }

  async uploadLabReport(appointmentId: string, reportData: {
    filePath: string;
    fileSize: number;
    mimeType: string;
    results: string;
    normalRanges?: string;
    abnormalFlags?: string[];
    labTechnician: string;
    reportDate: Date;
  }) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: { include: { profile: true } } } },
        doctor: { include: { user: { include: { profile: true } } } },
      },
    });

    if (!appointment) {
      throw new Error('Lab appointment not found');
    }

    // Update appointment status
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        diagnosis: 'Lab results available',
      },
    });

    // Create medical history entry for results
    const reportEntry = await this.prisma.medicalHistory.create({
      data: {
        patientId: appointment.patientId,
        condition: 'Lab Results',
        diagnosis: reportData.results,
        treatment: JSON.stringify({
          filePath: reportData.filePath,
          fileSize: reportData.fileSize,
          mimeType: reportData.mimeType,
          normalRanges: reportData.normalRanges,
          abnormalFlags: reportData.abnormalFlags,
          labTechnician: reportData.labTechnician,
          appointmentId,
        }),
        diagnosedAt: reportData.reportDate,
      },
    });

    // Notify patient and doctor
    await Promise.all([
      this.notificationService.createNotification({
        userId: appointment.patient.userId,
        type: 'LAB_RESULTS_READY' as any,
        title: 'Lab Results Available',
        message: 'Your lab test results are now available for review',
        metadata: JSON.stringify({
          reportId: reportEntry.id,
          appointmentId,
        }),
      }),
      appointment.doctorId ? this.notificationService.createNotification({
        userId: appointment.doctor?.userId || '',
        type: 'LAB_RESULTS_READY' as any,
        title: 'Patient Lab Results',
        message: `Lab results available for ${appointment.patient.user.profile?.firstName}`,
        metadata: JSON.stringify({
          reportId: reportEntry.id,
          patientId: appointment.patientId,
        }),
      }) : Promise.resolve(),
    ]);

    // Auto-analyze results for critical values
    await this.analyzeLabResults(reportEntry.id, reportData);

    return reportEntry;
  }

  async getLabHistory(patientId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [labTests, total] = await Promise.all([
      this.prisma.medicalHistory.findMany({
        where: {
          patientId,
          condition: { in: ['Lab Test Booked', 'Lab Results'] },
          isDeleted: false,
        },
        orderBy: { diagnosedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.medicalHistory.count({
        where: {
          patientId,
          condition: { in: ['Lab Test Booked', 'Lab Results'] },
          isDeleted: false,
        },
      }),
    ]);

    return {
      labTests: labTests.map(test => ({
        ...test,
        metadata: this.parseLabMetadata(test.treatment),
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getAvailableLabs() {
    // In a real implementation, this would fetch from a labs database
    return [
      {
        id: 'lab1',
        name: 'City Diagnostics',
        address: '123 Medical Center Dr',
        phone: '+1-555-0123',
        services: ['Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan'],
        workingHours: '8:00 AM - 8:00 PM',
        emergencyServices: true,
      },
      {
        id: 'lab2',
        name: 'HealthLab Plus',
        address: '456 Healthcare Ave',
        phone: '+1-555-0456',
        services: ['Blood Test', 'Urine Test', 'ECG', 'Ultrasound'],
        workingHours: '7:00 AM - 10:00 PM',
        emergencyServices: false,
      },
    ];
  }

  async scheduleLabPickup(patientId: string, labId: string, pickupData: {
    address: string;
    preferredTime: Date;
    contactPhone: string;
    testType: string;
  }) {
    // Create home collection appointment
    const pickupAppointment = await this.prisma.appointment.create({
      data: {
        patientId,
        doctorId: (await this.getDefaultLabDoctor()).id,
        scheduledAt: pickupData.preferredTime,
        duration: 30,
        status: 'SCHEDULED',
        notes: `Home Collection: ${pickupData.testType} - ${pickupData.address}`,
      },
    });

    await this.notificationService.createNotification({
      userId: (await this.prisma.patient.findUnique({ 
        where: { id: patientId }, 
        include: { user: true } 
      }))?.userId || '',
      type: 'LAB_PICKUP_SCHEDULED' as any,
      title: 'Lab Sample Pickup Scheduled',
      message: `Sample collection scheduled for ${pickupData.preferredTime.toLocaleString()}`,
      metadata: JSON.stringify({
        appointmentId: pickupAppointment.id,
        address: pickupData.address,
      }),
    });

    return pickupAppointment;
  }

  private async analyzeLabResults(reportId: string, reportData: any) {
    // Simple critical value detection
    const criticalFlags = reportData.abnormalFlags || [];
    
    if (criticalFlags.length > 0) {
      const report = await this.prisma.medicalHistory.findUnique({
        where: { id: reportId },
        include: { patient: { include: { user: true } } },
      });

      if (report) {
        await this.notificationService.createNotification({
          userId: report.patient.userId,
          type: 'CRITICAL_LAB_VALUES' as any,
          title: 'Critical Lab Values Detected',
          message: 'Some of your lab values require immediate attention. Please contact your doctor.',
          metadata: JSON.stringify({
            reportId,
            criticalFlags,
          }),
        });
      }
    }
  }

  private async getDefaultLabDoctor() {
    // Get or create a default lab doctor
    let labDoctor = await this.prisma.doctor.findFirst({
      where: { specialization: 'Laboratory Medicine' },
    });

    if (!labDoctor) {
      // Create default lab doctor if none exists
      const labUser = await this.prisma.user.create({
        data: {
          email: 'lab@healthcare.com',
          password: 'temp123',
          role: 'DOCTOR',
          profile: {
            create: {
              firstName: 'Lab',
              lastName: 'Services',
            },
          },
          doctor: {
            create: {
              doctorId: 'LAB001',
              specialization: 'Laboratory Medicine',
              licenseNumber: 'LAB-001',
              experience: 10,
              consultationFee: 0,
            },
          },
        },
        include: { doctor: true },
      });
      labDoctor = labUser.doctor!;
    }

    return labDoctor;
  }

  private parseLabMetadata(treatment: string | null) {
    try {
      return treatment ? JSON.parse(treatment) : {};
    } catch {
      return {};
    }
  }
}