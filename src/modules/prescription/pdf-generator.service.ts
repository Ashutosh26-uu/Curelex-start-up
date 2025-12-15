import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PdfGeneratorService {
  constructor(private prisma: PrismaService) {}

  async generatePrescriptionPdf(prescriptionId: string): Promise<Buffer> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patient: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        doctor: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!prescription) {
      throw new Error('Prescription not found');
    }

    // Generate HTML template
    const htmlTemplate = this.generateHtmlTemplate(prescription);
    
    // In a real implementation, you would use a library like puppeteer or jsPDF
    // For now, return a simple buffer representation
    return Buffer.from(htmlTemplate, 'utf-8');
  }

  private generateHtmlTemplate(prescription: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Medical Prescription</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .doctor-info { margin: 20px 0; }
        .patient-info { margin: 20px 0; background: #f5f5f5; padding: 15px; }
        .prescription-details { margin: 20px 0; }
        .medication { border: 1px solid #ddd; margin: 10px 0; padding: 15px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; }
        .signature { margin-top: 30px; text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MEDICAL PRESCRIPTION</h1>
        <p>Healthcare Telemedicine Platform</p>
    </div>

    <div class="doctor-info">
        <h3>Doctor Information</h3>
        <p><strong>Name:</strong> Dr. ${prescription.doctor.user.profile.firstName} ${prescription.doctor.user.profile.lastName}</p>
        <p><strong>Specialization:</strong> ${prescription.doctor.specialization}</p>
        <p><strong>License Number:</strong> ${prescription.doctor.licenseNumber}</p>
        <p><strong>Hospital:</strong> ${prescription.doctor.hospital}</p>
    </div>

    <div class="patient-info">
        <h3>Patient Information</h3>
        <p><strong>Name:</strong> ${prescription.patient.user.profile.firstName} ${prescription.patient.user.profile.lastName}</p>
        <p><strong>Patient ID:</strong> ${prescription.patient.patientId}</p>
        <p><strong>Age:</strong> ${this.calculateAge(prescription.patient.user.profile.dateOfBirth)}</p>
        <p><strong>Gender:</strong> ${prescription.patient.user.profile.gender}</p>
        <p><strong>Date:</strong> ${new Date(prescription.prescribedAt).toLocaleDateString()}</p>
    </div>

    <div class="prescription-details">
        <h3>Prescription Details</h3>
        <div class="medication">
            <p><strong>Medication:</strong> ${prescription.medication}</p>
            <p><strong>Dosage:</strong> ${prescription.dosage}</p>
            <p><strong>Frequency:</strong> ${prescription.frequency}</p>
            <p><strong>Duration:</strong> ${prescription.duration}</p>
            ${prescription.instructions ? `<p><strong>Instructions:</strong> ${prescription.instructions}</p>` : ''}
        </div>
    </div>

    <div class="signature">
        <p>_________________________</p>
        <p>Dr. ${prescription.doctor.user.profile.firstName} ${prescription.doctor.user.profile.lastName}</p>
        <p>Digital Signature</p>
    </div>

    <div class="footer">
        <p>This is a digitally generated prescription. For any queries, contact our support team.</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>
    `;
  }

  private calculateAge(dateOfBirth: Date | null): string {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  }

  async savePrescriptionPdf(prescriptionId: string): Promise<string> {
    const pdfBuffer = await this.generatePrescriptionPdf(prescriptionId);
    
    // In a real implementation, save to cloud storage (AWS S3, etc.)
    const fileName = `prescription_${prescriptionId}_${Date.now()}.pdf`;
    
    // Update prescription with PDF path
    await this.prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        // Add a pdfPath field to store the file location
      },
    });

    return fileName;
  }
}