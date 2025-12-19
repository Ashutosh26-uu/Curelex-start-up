import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AIInsightsService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async analyzePatientSymptoms(patientId: string, symptoms: string[]) {
    const riskFactors = this.detectRiskPatterns(symptoms);
    const recommendations = this.generateRecommendations(symptoms, riskFactors);

    await this.prisma.medicalHistory.create({
      data: {
        patientId,
        condition: 'AI Symptom Analysis',
        diagnosis: `Symptoms: ${symptoms.join(', ')}`,
        treatment: JSON.stringify({
          riskFactors,
          recommendations,
          confidence: this.calculateConfidence(symptoms),
          analysisDate: new Date(),
        }),
        diagnosedAt: new Date(),
      },
    });

    if (riskFactors.some(rf => rf.severity === 'HIGH')) {
      await this.sendHighRiskAlert(patientId, riskFactors);
    }

    return {
      riskFactors,
      recommendations,
      urgencyLevel: this.determineUrgency(riskFactors),
      suggestedSpecialists: this.suggestSpecialists(symptoms),
    };
  }

  async predictAppointmentOptimization(doctorId: string, date: Date) {
    const historicalData = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
        isDeleted: false,
      },
    });

    const patterns = this.analyzeAppointmentPatterns(historicalData);
    
    return {
      optimalSlots: this.generateOptimalSlots(patterns, date),
      expectedDuration: patterns.averageDuration,
      noShowProbability: patterns.noShowRate,
      recommendations: this.generateSchedulingRecommendations(patterns),
    };
  }

  async analyzeMedicationAdherence(patientId: string) {
    const adherenceRecords = await this.prisma.medicalHistory.findMany({
      where: {
        patientId,
        condition: 'Medication Adherence',
        isDeleted: false,
      },
      orderBy: { diagnosedAt: 'desc' },
      take: 100,
    });

    const adherenceData = adherenceRecords.map(record => {
      const treatment = JSON.parse(record.treatment || '{}');
      return {
        date: record.diagnosedAt,
        taken: treatment.taken,
        medication: treatment.medication,
      };
    });

    const predictions = this.predictAdherenceRisk(adherenceData);
    
    if (predictions.riskLevel === 'HIGH') {
      await this.sendAdherenceAlert(patientId, predictions);
    }

    return predictions;
  }

  async detectAnomalousVitals(patientId: string) {
    const recentVitals = await this.prisma.vital.findMany({
      where: { patientId },
      orderBy: { recordedAt: 'desc' },
      take: 20,
    });

    const anomalies = this.detectVitalAnomalies(recentVitals);
    
    if (anomalies.length > 0) {
      await this.sendVitalAnomalyAlert(patientId, anomalies);
    }

    return anomalies;
  }

  private detectRiskPatterns(symptoms: string[]) {
    const riskPatterns = [
      {
        pattern: ['chest pain', 'shortness of breath', 'dizziness'],
        condition: 'Cardiac Risk',
        severity: 'HIGH',
      },
      {
        pattern: ['fever', 'cough', 'fatigue'],
        condition: 'Respiratory Infection',
        severity: 'MEDIUM',
      },
      {
        pattern: ['headache', 'nausea', 'vision changes'],
        condition: 'Neurological Concern',
        severity: 'HIGH',
      },
    ];

    return riskPatterns.filter(pattern => 
      pattern.pattern.some(p => 
        symptoms.some(s => s.toLowerCase().includes(p))
      )
    );
  }

  private generateRecommendations(symptoms: string[], riskFactors: any[]) {
    const recommendations = [];

    if (riskFactors.some(rf => rf.severity === 'HIGH')) {
      recommendations.push('Seek immediate medical attention');
      recommendations.push('Consider emergency room visit if symptoms worsen');
    } else if (riskFactors.some(rf => rf.severity === 'MEDIUM')) {
      recommendations.push('Schedule appointment with primary care physician');
      recommendations.push('Monitor symptoms closely');
    } else {
      recommendations.push('Continue monitoring symptoms');
      recommendations.push('Consider rest and hydration');
    }

    return recommendations;
  }

  private calculateConfidence(symptoms: string[]): number {
    return Math.min(symptoms.length * 20, 85);
  }

  private determineUrgency(riskFactors: any[]): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (riskFactors.some(rf => rf.severity === 'HIGH')) return 'HIGH';
    if (riskFactors.some(rf => rf.severity === 'MEDIUM')) return 'MEDIUM';
    return 'LOW';
  }

  private suggestSpecialists(symptoms: string[]): string[] {
    const specialistMap = {
      'chest pain': 'Cardiologist',
      'headache': 'Neurologist',
      'skin rash': 'Dermatologist',
      'joint pain': 'Rheumatologist',
      'breathing': 'Pulmonologist',
    };

    const specialists = new Set<string>();
    symptoms.forEach(symptom => {
      Object.entries(specialistMap).forEach(([key, specialist]) => {
        if (symptom.toLowerCase().includes(key)) {
          specialists.add(specialist);
        }
      });
    });

    return Array.from(specialists);
  }

  private analyzeAppointmentPatterns(appointments: any[]) {
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === 'COMPLETED');
    const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED');

    return {
      averageDuration: appointments.reduce((sum, a) => sum + a.duration, 0) / totalAppointments || 30,
      noShowRate: (cancelledAppointments.length / totalAppointments) * 100 || 0,
      completionRate: (completedAppointments.length / totalAppointments) * 100 || 0,
      peakHours: this.calculatePeakHours(appointments),
    };
  }

  private generateOptimalSlots(patterns: any, date: Date): string[] {
    const optimalHours = patterns.peakHours || [9, 10, 14, 15];
    return optimalHours.map(hour => `${hour.toString().padStart(2, '0')}:00`);
  }

  private generateSchedulingRecommendations(patterns: any): string[] {
    const recommendations = [];
    
    if (patterns.noShowRate > 20) {
      recommendations.push('Consider implementing appointment confirmation system');
    }
    
    if (patterns.completionRate < 80) {
      recommendations.push('Review appointment scheduling process');
    }

    return recommendations;
  }

  private predictAdherenceRisk(adherenceData: any[]) {
    const recentAdherence = adherenceData.slice(0, 14);
    const adherenceRate = recentAdherence.filter(d => d.taken).length / recentAdherence.length;

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (adherenceRate < 0.5) riskLevel = 'HIGH';
    else if (adherenceRate < 0.8) riskLevel = 'MEDIUM';

    return {
      riskLevel,
      adherenceRate: Math.round(adherenceRate * 100),
      recommendations: this.generateAdherenceRecommendations(riskLevel),
      trendAnalysis: this.analyzeTrend(adherenceData),
    };
  }

  private generateAdherenceRecommendations(riskLevel: string): string[] {
    switch (riskLevel) {
      case 'HIGH':
        return [
          'Set up multiple daily reminders',
          'Consider pill organizer',
          'Discuss with doctor about medication concerns',
        ];
      case 'MEDIUM':
        return [
          'Increase reminder frequency',
          'Link medication to daily routines',
        ];
      default:
        return ['Continue current medication routine'];
    }
  }

  private detectVitalAnomalies(vitals: any[]) {
    const anomalies = [];
    
    vitals.forEach(vital => {
      if (vital.type === 'BLOOD_PRESSURE') {
        const [systolic, diastolic] = vital.value.split('/').map(Number);
        if (systolic > 180 || diastolic > 110) {
          anomalies.push({
            type: vital.type,
            value: vital.value,
            severity: 'HIGH',
            message: 'Blood pressure critically high',
          });
        }
      }
      
      if (vital.type === 'HEART_RATE') {
        const rate = parseInt(vital.value);
        if (rate > 120 || rate < 50) {
          anomalies.push({
            type: vital.type,
            value: vital.value,
            severity: rate > 150 || rate < 40 ? 'HIGH' : 'MEDIUM',
            message: 'Heart rate abnormal',
          });
        }
      }
    });

    return anomalies;
  }

  private async sendHighRiskAlert(patientId: string, riskFactors: any[]) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (patient) {
      await this.notificationService.createNotification({
        userId: patient.userId,
        type: 'HIGH_RISK_ALERT' as any,
        title: 'High Risk Symptoms Detected',
        message: 'AI analysis suggests seeking immediate medical attention',
        metadata: JSON.stringify({ riskFactors }),
      });
    }
  }

  private async sendAdherenceAlert(patientId: string, predictions: any) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (patient) {
      await this.notificationService.createNotification({
        userId: patient.userId,
        type: 'ADHERENCE_RISK' as any,
        title: 'Medication Adherence Risk',
        message: 'AI detected potential medication adherence issues',
        metadata: JSON.stringify(predictions),
      });
    }
  }

  private async sendVitalAnomalyAlert(patientId: string, anomalies: any[]) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (patient) {
      await this.notificationService.createNotification({
        userId: patient.userId,
        type: 'VITAL_ANOMALY' as any,
        title: 'Unusual Vital Signs Detected',
        message: 'AI detected anomalous vital signs requiring attention',
        metadata: JSON.stringify({ anomalies }),
      });
    }
  }

  private calculatePeakHours(appointments: any[]): number[] {
    const hourCounts = new Array(24).fill(0);
    
    appointments.forEach(appointment => {
      const hour = new Date(appointment.scheduledAt).getHours();
      hourCounts[hour]++;
    });

    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map(item => item.hour);
  }

  private analyzeTrend(data: any[]): 'IMPROVING' | 'DECLINING' | 'STABLE' {
    if (data.length < 7) return 'STABLE';
    
    const recent = data.slice(0, 7);
    const older = data.slice(7, 14);
    
    const recentRate = recent.filter(d => d.taken).length / recent.length;
    const olderRate = older.filter(d => d.taken).length / older.length;
    
    if (recentRate > olderRate + 0.1) return 'IMPROVING';
    if (recentRate < olderRate - 0.1) return 'DECLINING';
    return 'STABLE';
  }
}