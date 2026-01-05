export interface IAuthService {
  validateUser(email: string, password: string): Promise<any>;
  patientLogin(loginDto: any, ipAddress?: string, userAgent?: string): Promise<any>;
  doctorLogin(loginDto: any, ipAddress?: string, userAgent?: string): Promise<any>;
  patientRegister(registerDto: any, ipAddress?: string, userAgent?: string): Promise<any>;
  logout(userId: string, sessionId: string, jti?: string): Promise<any>;
  generateTokens(userId: string, email: string, role: string, sessionId: string): Promise<any>;
}

export interface INotificationService {
  sendEmail(to: string, subject: string, content: string): Promise<void>;
  sendSMS(phone: string, message: string): Promise<void>;
  createNotification(userId: string, type: string, title: string, message: string): Promise<void>;
}

export interface IPatientService {
  findById(id: string): Promise<any>;
  updateProfile(id: string, data: any): Promise<any>;
  getAppointments(patientId: string): Promise<any[]>;
  getMedicalHistory(patientId: string): Promise<any[]>;
}

export interface IDoctorService {
  findById(id: string): Promise<any>;
  getPatients(doctorId: string): Promise<any[]>;
  createPrescription(doctorId: string, patientId: string, data: any): Promise<any>;
  getSchedule(doctorId: string, date: Date): Promise<any[]>;
}

export interface IAppointmentService {
  create(data: any): Promise<any>;
  findById(id: string): Promise<any>;
  updateStatus(id: string, status: string): Promise<any>;
  findByPatient(patientId: string): Promise<any[]>;
  findByDoctor(doctorId: string): Promise<any[]>;
}