import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getStoredTokens, useAuthStore } from '@/store/auth';

// Enhanced request retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Create axios instance with enhanced configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false, // Managed via cookies
});

// Request interceptor with enhanced security
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const { accessToken, sessionId } = getStoredTokens();
    
    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
    
    if (sessionId) {
      config.headers = {
        ...config.headers,
        'X-Session-ID': sessionId,
      };
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor with retry logic
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time in development
    if (process.env.NODE_ENV === 'development' && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite retry loops
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._isRefreshRequest) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = getStoredTokens();
        
        if (refreshToken) {
          const refreshResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/refresh`,
            { refreshToken },
            { _isRefreshRequest: true }
          );

          if (refreshResponse.data.accessToken) {
            const { updateTokens } = useAuthStore.getState();
            updateTokens(refreshResponse.data.accessToken, refreshResponse.data.refreshToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        const { logout } = useAuthStore.getState();
        logout();
        
        if (typeof window !== 'undefined') {
          window.location.href = '/auth?reason=session_expired';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors with retry
    if (!error.response && originalRequest.retryCount < MAX_RETRIES) {
      originalRequest.retryCount = (originalRequest.retryCount || 0) + 1;
      
      await new Promise(resolve => 
        setTimeout(resolve, RETRY_DELAY * originalRequest.retryCount)
      );
      
      return api(originalRequest);
    }

    // Handle specific error codes
    switch (error.response?.status) {
      case 403:
        if (typeof window !== 'undefined') {
          window.location.href = '/unauthorized';
        }
        break;
      case 429:
        // Rate limited - exponential backoff
        if (originalRequest.retryCount < MAX_RETRIES) {
          originalRequest.retryCount = (originalRequest.retryCount || 0) + 1;
          const delay = Math.pow(2, originalRequest.retryCount) * 1000;
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return api(originalRequest);
        }
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        console.error('Server error:', error.response.data);
        break;
    }

    return Promise.reject(error);
  }
);

// Enhanced API helper functions with better typing
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
    getPastVisits: (patientId: string, page = 1, limit = 10) => 
      api.get(`/patients/${patientId}/past-visits`, { params: { page, limit } }),
  },

  // Appointments endpoints
  appointments: {
    getUpcoming: () => api.get('/appointments/upcoming/me'),
    getAll: (page = 1, limit = 10) => 
      api.get('/appointments', { params: { page, limit } }),
    create: (data: any) => api.post('/appointments', data),
    update: (id: string, data: any) => api.patch(`/appointments/${id}`, data),
    cancel: (id: string, reason: string) => 
      api.patch(`/appointments/${id}`, { status: 'CANCELLED', cancelReason: reason }),
  },

  // Vitals endpoints
  vitals: {
    getLatest: (patientId: string) => api.get(`/vitals/patient/${patientId}/latest`),
    getHistory: (patientId: string, page = 1, limit = 10) => 
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
      api.get('/prescriptions', { params: patientId ? { patientId } : {} }),
    create: (data: any) => api.post('/prescriptions', data),
    update: (id: string, data: any) => api.patch(`/prescriptions/${id}`, data),
  },
};

// Enhanced error handler utility
export const handleApiError = (error: any) => {
  const defaultError = {
    message: 'An unexpected error occurred',
    status: 0,
    data: null,
  };

  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 
                   error.response.data?.error || 
                   `Server error (${error.response.status})`;
    
    return {
      message,
      status: error.response.status,
      data: error.response.data,
      code: error.response.data?.code,
    };
  } 
  
  if (error.request) {
    // Request was made but no response received
    return {
      ...defaultError,
      message: 'Network error. Please check your connection and try again.',
    };
  }
  
  // Something else happened
  return {
    ...defaultError,
    message: error.message || defaultError.message,
  };
};

// Request cancellation utility
export const createCancelToken = () => {
  const controller = new AbortController();
  return {
    token: controller.signal,
    cancel: () => controller.abort(),
  };
};

export { api };
export default api;