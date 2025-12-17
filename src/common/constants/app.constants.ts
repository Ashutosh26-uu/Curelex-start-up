export const APP_CONSTANTS = {
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  ACCOUNT_LOCK_DURATION: parseInt(process.env.ACCOUNT_LOCK_DURATION || '1800000'),
  PASSWORD_RESET_EXPIRY: parseInt(process.env.PASSWORD_RESET_EXPIRY || '900000'),
  RATE_LIMIT_TTL: parseInt(process.env.RATE_LIMIT_TTL || '60000'),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
  DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE || '20'),
  MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE || '100'),
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '300'),
  CACHE_MAX_ITEMS: parseInt(process.env.CACHE_MAX_ITEMS || '100'),
  DB_CONNECTION_TIMEOUT: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
  DB_QUERY_TIMEOUT: parseInt(process.env.DB_QUERY_TIMEOUT || '10000'),
  API_VERSION: process.env.API_VERSION || 'v1',
  API_PREFIX: process.env.API_PREFIX || 'api',
  EMAIL_QUEUE_DELAY: parseInt(process.env.EMAIL_QUEUE_DELAY || '1000'),
  SMS_QUEUE_DELAY: parseInt(process.env.SMS_QUEUE_DELAY || '2000'),
  SESSION_EXPIRY: parseInt(process.env.SESSION_EXPIRY || '604800000'),
  MIN_PASSWORD_LENGTH: parseInt(process.env.MIN_PASSWORD_LENGTH || '8'),
  MAX_PASSWORD_LENGTH: parseInt(process.env.MAX_PASSWORD_LENGTH || '128'),
  MIN_NAME_LENGTH: parseInt(process.env.MIN_NAME_LENGTH || '2'),
  MAX_NAME_LENGTH: parseInt(process.env.MAX_NAME_LENGTH || '50'),
  DEFAULT_APPOINTMENT_DURATION: parseInt(process.env.DEFAULT_APPOINTMENT_DURATION || '30'),
  MAX_APPOINTMENTS_PER_DAY: parseInt(process.env.MAX_APPOINTMENTS_PER_DAY || '20'),
  VITAL_RETENTION_DAYS: parseInt(process.env.VITAL_RETENTION_DAYS || '365'),
} as const;

// Validation function for constants
export const validateConstants = (): void => {
  const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'];
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  if (APP_CONSTANTS.BCRYPT_ROUNDS < 10 || APP_CONSTANTS.BCRYPT_ROUNDS > 15) {
    throw new Error('BCRYPT_ROUNDS must be between 10 and 15');
  }
  
  if (APP_CONSTANTS.MIN_PASSWORD_LENGTH < 8) {
    throw new Error('MIN_PASSWORD_LENGTH must be at least 8');
  }
};

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account is locked due to multiple failed login attempts',
  ACCOUNT_DISABLED: 'Account is disabled',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to access this resource',
  ROLE_NOT_AUTHORIZED: 'Your role is not authorized for this action',
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please provide a valid email address',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  PASSWORD_MISMATCH: 'Passwords do not match',
  RECORD_NOT_FOUND: 'Record not found',
  DUPLICATE_ENTRY: 'A record with this information already exists',
  FOREIGN_KEY_CONSTRAINT: 'Cannot delete record due to existing references',
  FILE_TOO_LARGE: 'File size exceeds maximum allowed limit',
  INVALID_FILE_TYPE: 'File type is not supported',
  APPOINTMENT_CONFLICT: 'Appointment time conflicts with existing appointment',
  DOCTOR_NOT_AVAILABLE: 'Doctor is not available at the requested time',
  PATIENT_NOT_ASSIGNED: 'Patient is not assigned to this doctor',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET: 'Password reset successfully',
  CREATED_SUCCESS: 'Record created successfully',
  UPDATED_SUCCESS: 'Record updated successfully',
  DELETED_SUCCESS: 'Record deleted successfully',
  APPOINTMENT_SCHEDULED: 'Appointment scheduled successfully',
  APPOINTMENT_CANCELLED: 'Appointment cancelled successfully',
  APPOINTMENT_COMPLETED: 'Appointment completed successfully',
  EMAIL_SENT: 'Email sent successfully',
  SMS_SENT: 'SMS sent successfully',
  NOTIFICATION_SENT: 'Notification sent successfully',
} as const;