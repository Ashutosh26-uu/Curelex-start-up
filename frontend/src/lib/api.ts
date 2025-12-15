const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Add request interceptor for debugging
if (typeof window !== 'undefined') {
  console.log('API Base URL:', API_BASE_URL);
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
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
  patientLogin: async (data: any) => {
    const response = await api.post('/auth/login/patient', data);
    if (response.accessToken) {
      api.setToken(response.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('session_id', response.sessionId || '');
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }
    return response;
  },
  doctorLogin: async (data: any) => {
    const response = await api.post('/auth/login/doctor', data);
    if (response.accessToken) {
      api.setToken(response.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('session_id', response.sessionId || '');
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }
    return response;
  },
  login: async (data: any) => {
    const response = await api.post('/auth/login', data);
    if (response.accessToken) {
      api.setToken(response.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('session_id', response.sessionId || '');
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }
    return response;
  },
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    if (response.accessToken) {
      api.setToken(response.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }
    return response;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } finally {
      api.clearToken();
    }
  },
  logoutAll: async () => {
    try {
      await api.post('/auth/logout-all', {});
    } finally {
      api.clearToken();
    }
  },
  getSessions: () => api.get('/auth/sessions'),
  getLoginHistory: () => api.get('/auth/login-history'),
  getProfile: () => api.get('/auth/me'),
  refreshToken: async () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await api.post('/auth/refresh', { refreshToken });
    if (response.accessToken) {
      api.setToken(response.accessToken);
    }
    return response;
  },
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.post('/auth/change-password', data),
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; newPassword: string }) => 
    api.post('/auth/reset-password', data),
};

export const patientApi = {
  selfRegister: (data: any) => api.post('/patients/self-register', data),
  register: (data: any) => api.post('/patients/register', data),
  getAll: (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return api.get(`/patients${query}`);
  },
  getProfile: (id: string) => api.get(`/patients/${id}`),
  getMyProfile: () => api.get('/patients/me'),
  update: (id: string, data: any) => api.patch(`/patients/${id}`, data),
  getMedicalHistory: (id: string) => api.get(`/patients/${id}/medical-history`),
  addMedicalHistory: (id: string, data: any) => api.post(`/patients/${id}/medical-history`, data),
  getPastVisits: (id: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return api.get(`/patients/${id}/past-visits${query}`);
  },
};

export const doctorApi = {
  getAll: (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return api.get(`/doctors${query}`);
  },
  getProfile: (id: string) => api.get(`/doctors/${id}`),
  getMyProfile: () => api.get('/doctors/me'),
  getPatients: (id: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return api.get(`/doctors/${id}/patients${query}`);
  },
  createPrescription: (data: any) => api.post('/doctors/prescriptions', data),
  getVisitHistory: (id: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return api.get(`/doctors/${id}/visit-history${query}`);
  },
  getStats: (id: string) => api.get(`/doctors/${id}/stats`),
  updateAvailability: (id: string, isAvailable: boolean) => api.patch(`/doctors/${id}/availability`, { isAvailable }),
};

export const appointmentApi = {
  create: (data: any) => api.post('/appointments', data),
  getAll: (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return api.get(`/appointments${query}`);
  },
  getMyAppointments: (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return api.get(`/appointments/me/all${query}`);
  },
  getUpcoming: () => api.get('/appointments/upcoming/me'),
  getById: (id: string) => api.get(`/appointments/${id}`),
  update: (id: string, data: any) => api.patch(`/appointments/${id}`, data),
  cancel: (id: string, reason: string) => api.patch(`/appointments/${id}/cancel`, { reason }),
  complete: (id: string, data: any) => api.patch(`/appointments/${id}/complete`, data),
  reschedule: (id: string, scheduledAt: string) => api.patch(`/appointments/${id}/reschedule`, { scheduledAt }),
};

export const vitalsApi = {
  create: (data: any) => api.post('/vitals', data),
  getPatientVitals: (patientId: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return api.get(`/vitals/patient/${patientId}${query}`);
  },
  getLatest: (patientId: string) => api.get(`/vitals/patient/${patientId}/latest`),
  getHistory: (patientId: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return api.get(`/vitals/patient/${patientId}/history${query}`);
  },
  update: (id: string, data: any) => api.patch(`/vitals/${id}`, data),
  delete: (id: string) => api.delete(`/vitals/${id}`),
};

export const notificationApi = {
  getByUser: (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return api.get(`/notifications/me${query}`);
  },
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`, {}),
};



export const prescriptionApi = {
  getMy: (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return api.get(`/prescriptions/me${query}`);
  },
  updateStatus: (id: string, status: string) => api.patch(`/prescriptions/${id}/status`, { status }),
};

export const integrationApi = {
  getGoogleAuthUrl: () => api.get('/integration/google/auth'),
};

// Health check
export const healthApi = {
  check: () => api.get('/health'),
  status: () => api.get('/status'),
};