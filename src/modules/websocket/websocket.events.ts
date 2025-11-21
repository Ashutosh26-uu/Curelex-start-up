export enum WebSocketEvents {
  // Patient events
  PATIENT_REGISTERED = 'patient:registered',
  PATIENT_UPDATED = 'patient:updated',
  
  // Vitals events
  VITALS_UPDATED = 'vitals:updated',
  VITALS_CRITICAL = 'vitals:critical',
  
  // Appointment events
  APPOINTMENT_SCHEDULED = 'appointment:scheduled',
  APPOINTMENT_UPDATED = 'appointment:updated',
  APPOINTMENT_CANCELLED = 'appointment:cancelled',
  
  // Alert events
  CRITICAL_ALERT = 'alert:critical',
  EXECUTIVE_ALERT = 'alert:executive',
  SYSTEM_ALERT = 'alert:system',
  
  // General events
  NOTIFICATION_SENT = 'notification:sent',
  USER_CONNECTED = 'user:connected',
  USER_DISCONNECTED = 'user:disconnected',
}

export interface WebSocketPayload {
  type: string;
  data: any;
  timestamp: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}