export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  JUNIOR_DOCTOR = 'JUNIOR_DOCTOR',
  NURSE = 'NURSE',
  CEO = 'CEO',
  CTO = 'CTO',
  CFO = 'CFO',
  CMO = 'CMO',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  profile?: Profile;
}

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
}

export interface Patient {
  id: string;
  patientId: string;
  emergencyContact?: string;
  bloodGroup?: string;
  allergies?: string;
  user: User;
}

export interface Doctor {
  id: string;
  doctorId: string;
  specialization: string;
  experience: number;
  consultationFee: number;
  user: User;
}

export interface Appointment {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  meetLink?: string;
  notes?: string;
  patient: Patient;
  doctor: Doctor;
}

export interface Vital {
  id: string;
  type: string;
  value: string;
  unit: string;
  recordedAt: string;
  notes?: string;
}