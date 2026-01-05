import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BusinessLogicService {
  constructor(private configService: ConfigService) {}

  // Authentication Business Rules
  getPasswordRequirements() {
    return {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    };
  }

  getLoginAttemptLimits() {
    return {
      maxAttempts: this.configService.get<number>('MAX_LOGIN_ATTEMPTS', 5),
      lockoutDuration: this.configService.get<number>('LOCKOUT_DURATION', 30 * 60 * 1000), // 30 minutes
      captchaThreshold: 3,
    };
  }

  getTokenConfiguration() {
    return {
      accessTokenExpiry: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      refreshTokenExpiry: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      rememberMeExpiry: '30d',
      algorithm: 'HS256',
    };
  }

  // Patient Business Rules
  generatePatientId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `PAT${timestamp}${random}`;
  }

  getPatientStatusRules() {
    return {
      defaultStatus: 'ACTIVE',
      allowedTransitions: {
        ACTIVE: ['INACTIVE', 'DISCHARGED'],
        INACTIVE: ['ACTIVE'],
        DISCHARGED: ['ACTIVE'],
      },
    };
  }

  // Doctor Business Rules
  generateDoctorId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `DOC${timestamp}${random}`;
  }

  getDoctorWorkingHours() {
    return {
      defaultStart: '09:00',
      defaultEnd: '17:00',
      maxPatientsPerDay: 20,
      consultationDuration: 30, // minutes
    };
  }

  // Appointment Business Rules
  getAppointmentRules() {
    return {
      advanceBookingDays: 30,
      cancellationHours: 24,
      reminderHours: [24, 2], // Send reminders 24h and 2h before
      defaultDuration: 30,
      allowedStatuses: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    };
  }

  canCancelAppointment(scheduledAt: Date): boolean {
    const hoursUntilAppointment = (scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntilAppointment >= this.getAppointmentRules().cancellationHours;
  }

  // Prescription Business Rules
  getPrescriptionRules() {
    return {
      maxDuration: 90, // days
      defaultRefills: 0,
      requiresApproval: ['controlled', 'narcotic'],
    };
  }

  // Notification Business Rules
  getNotificationRules() {
    return {
      priorities: ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY'],
      retryAttempts: 3,
      retryDelay: 5000, // 5 seconds
    };
  }

  shouldSendNotification(type: string, userPreferences: any): boolean {
    const defaultPreferences = {
      email: true,
      sms: false,
      push: true,
    };

    const preferences = userPreferences || defaultPreferences;
    
    switch (type) {
      case 'APPOINTMENT_REMINDER':
        return preferences.email || preferences.sms;
      case 'MEDICATION_REMINDER':
        return preferences.push || preferences.sms;
      case 'SECURITY_ALERT':
        return true; // Always send security alerts
      default:
        return preferences.email;
    }
  }

  // Security Business Rules
  getSecurityRules() {
    return {
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      maxActiveSessions: 5,
      passwordChangeInterval: 90 * 24 * 60 * 60 * 1000, // 90 days
      twoFactorRequired: ['ADMIN', 'CEO', 'CTO', 'CFO'],
    };
  }

  isHighPrivilegeRole(role: string): boolean {
    return this.getSecurityRules().twoFactorRequired.includes(role);
  }

  // Data Validation Rules
  getValidationRules() {
    return {
      phoneRegex: /^[6-9]\d{9}$/,
      emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      nameRegex: /^[a-zA-Z\s]{2,50}$/,
      zipCodeRegex: /^\d{6}$/,
    };
  }
}