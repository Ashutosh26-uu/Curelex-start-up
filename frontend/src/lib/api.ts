import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
};

export const patientApi = {
  getProfile: (id: string) => api.get(`/patients/${id}`),
  updateProfile: (id: string, data: any) => api.patch(`/patients/${id}`, data),
  getMedicalHistory: (id: string) => api.get(`/patients/${id}/medical-history`),
  getPastVisits: (id: string) => api.get(`/patients/${id}/past-visits`),
};

export const doctorApi = {
  getProfile: (id: string) => api.get(`/doctors/${id}`),
  getPatients: (id: string) => api.get(`/doctors/${id}/patients`),
  createPrescription: (data: any) => api.post('/doctors/prescriptions', data),
  getVisitHistory: (id: string) => api.get(`/doctors/${id}/visit-history`),
};

export const appointmentApi = {
  create: (data: any) => api.post('/appointments', data),
  getAll: () => api.get('/appointments'),
  getUpcoming: () => api.get('/appointments/upcoming/me'),
  update: (id: string, data: any) => api.patch(`/appointments/${id}`, data),
};

export const vitalsApi = {
  create: (data: any) => api.post('/vitals', data),
  getByPatient: (patientId: string) => api.get(`/vitals/patient/${patientId}`),
  getLatest: (patientId: string) => api.get(`/vitals/patient/${patientId}/latest`),
};

export const officerApi = {
  getDashboard: () => api.get('/officer/dashboard'),
  getAppointmentAnalytics: () => api.get('/officer/analytics/appointments'),
  getPatientAnalytics: () => api.get('/officer/analytics/patients'),
};

export const notificationApi = {
  getAll: () => api.get('/notifications/me'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
};