export const APP_CONSTANTS = {
  API_VERSION: 'v1',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  SESSION_TIMEOUT: 15 * 60 * 1000, // 15 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  ACCOUNT_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  BCRYPT_ROUNDS: 12,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
} as const;

export const ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  JUNIOR_DOCTOR: 'JUNIOR_DOCTOR',
  NURSE: 'NURSE',
  ADMIN: 'ADMIN',
  CEO: 'CEO',
  CTO: 'CTO',
  CFO: 'CFO',
  CMO: 'CMO',
} as const;

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
  RESCHEDULED: 'RESCHEDULED',
} as const;

export const VITAL_TYPES = {
  BLOOD_PRESSURE: 'BLOOD_PRESSURE',
  HEART_RATE: 'HEART_RATE',
  TEMPERATURE: 'TEMPERATURE',
  OXYGEN_SATURATION: 'OXYGEN_SATURATION',
  BLOOD_SUGAR: 'BLOOD_SUGAR',
  WEIGHT: 'WEIGHT',
  HEIGHT: 'HEIGHT',
  BMI: 'BMI',
  RESPIRATORY_RATE: 'RESPIRATORY_RATE',
} as const;

export function validateConstants(): void {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}