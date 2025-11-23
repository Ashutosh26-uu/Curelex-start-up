const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('access_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  get(endpoint: string) {
    return this.request(endpoint);
  }

  post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout', {}),
};

export const patientApi = {
  getProfile: (id: string) => api.get(`/patients/${id}`),
  getMedicalHistory: (id: string) => api.get(`/patients/${id}/medical-history`),
};

export const doctorApi = {
  getPatients: (id: string) => api.get(`/doctors/${id}/patients`),
  createPrescription: (data: any) => api.post('/doctors/prescriptions', data),
};

export const appointmentApi = {
  create: (data: any) => api.post('/appointments', data),
  getUpcoming: () => api.get('/appointments/upcoming/me'),
};

export const vitalsApi = {
  create: (data: any) => api.post('/vitals', data),
  getLatest: (patientId: string) => api.get(`/vitals/patient/${patientId}/latest`),
};

export const notificationApi = {
  getByUser: () => api.get('/notifications/me'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`, {}),
};

export const adminApi = {
  assignDoctor: (data: any) => api.post('/admin/assign-doctor', data),
  getUsers: () => api.get('/admin/users'),
  getStats: () => api.get('/admin/stats'),
};

export const officerApi = {
  getDashboard: () => api.get('/officer/dashboard'),
  getAnalytics: () => api.get('/officer/analytics'),
};