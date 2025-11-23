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
  patient?: Patient;
  doctor?: Doctor;
  officer?: Officer;
}

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
}

export interface Patient {
  id: string;
  patientId: string;
  emergencyContact?: string;
  bloodGroup?: string;
  allergies?: string;
}

export interface Doctor {
  id: string;
  doctorId: string;
  specialization: string;
  licenseNumber: string;
  experience: number;
  consultationFee: number;
}

export interface Officer {
  id: string;
  officerId: string;
  department?: string;
  position?: string;
}