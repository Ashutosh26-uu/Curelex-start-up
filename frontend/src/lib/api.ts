import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getStoredTokens, useAuthStore } from '@/store/auth';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const { accessToken } = getStoredTokens();
    
    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = getStoredTokens();
        
        if (refreshToken) {
          // Try to refresh the token
          const refreshResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/refresh`,
            { refreshToken }
          );

          if (refreshResponse.data.accessToken) {
            const { updateTokens } = useAuthStore.getState();
            updateTokens(refreshResponse.data.accessToken, refreshResponse.data.refreshToken);

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        const { logout } = useAuthStore.getState();
        logout();
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      if (typeof window !== 'undefined') {
        window.location.href = '/unauthorized';
      }
    }

    if (error.response?.status >= 500) {
      // Server errors
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const apiHelpers = {
  // Auth endpoints
  auth: {
    patientRegister: (data: any) => api.post('/auth/register/patient', data),
    patientLogin: (data: any) => api.post('/auth/login/patient', data),
    doctorLogin: (data: any) => api.post('/auth/login/doctor', data),
    logout: () => api.post('/auth/logout'),
    refreshToken: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
    getProfile: () => api.get('/auth/me'),
    changePassword: (data: any) => api.post('/auth/change-password', data),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data: any) => api.post('/auth/reset-password', data),
  },

  // Patient endpoints
  patients: {
    getProfile: () => api.get('/patients/me'),
    updateProfile: (data: any) => api.patch('/patients/me', data),
    getMedicalHistory: (patientId: string) => api.get(`/patients/${patientId}/medical-history`),
    getPastVisits: (patientId: string, page?: number, limit?: number) => 
      api.get(`/patients/${patientId}/past-visits`, { params: { page, limit } }),
  },

  // Appointments endpoints
  appointments: {
    getUpcoming: () => api.get('/appointments/upcoming/me'),
    getAll: (page?: number, limit?: number) => 
      api.get('/appointments', { params: { page, limit } }),
    create: (data: any) => api.post('/appointments', data),
    update: (id: string, data: any) => api.patch(`/appointments/${id}`, data),
    cancel: (id: string, reason: string) => 
      api.patch(`/appointments/${id}`, { status: 'CANCELLED', cancelReason: reason }),
  },

  // Vitals endpoints
  vitals: {
    getLatest: (patientId: string) => api.get(`/vitals/patient/${patientId}/latest`),
    getHistory: (patientId: string, page?: number, limit?: number) => 
      api.get(`/vitals/patient/${patientId}/history`, { params: { page, limit } }),
    create: (data: any) => api.post('/vitals', data),
  },

  // Notifications endpoints
  notifications: {
    getAll: () => api.get('/notifications/me'),
    markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  },

  // Prescriptions endpoints
  prescriptions: {
    getAll: (patientId?: string) => 
      api.get('/prescriptions', { params: { patientId } }),
    create: (data: any) => api.post('/prescriptions', data),
    update: (id: string, data: any) => api.patch(`/prescriptions/${id}`, data),
  },
};

// Error handler utility
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'An error occurred';
    const status = error.response.status;
    
    return {
      message,
      status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      data: null,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      data: null,
    };
  }
};

export { api };
export default api;