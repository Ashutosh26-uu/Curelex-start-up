import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  role: string;
  profile?: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
  };
  patient?: {
    id: string;
    patientId: string;
    status: string;
  };
  doctor?: {
    id: string;
    doctorId: string;
    specialization: string;
  };
  officer?: {
    id: string;
    officerId: string;
    department?: string;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: (user: User, accessToken: string, refreshToken: string) => {
        // Store tokens in cookies for security
        Cookies.set('access_token', accessToken, { 
          expires: 1, // 1 day
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        Cookies.set('refresh_token', refreshToken, { 
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        // Clear cookies
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        
        set({
          ...initialState,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      updateTokens: (accessToken: string, refreshToken: string) => {
        // Update cookies
        Cookies.set('access_token', accessToken, { 
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        Cookies.set('refresh_token', refreshToken, { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        set({
          accessToken,
          refreshToken,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearAuth: () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        set({ ...initialState });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper functions
export const getStoredTokens = () => {
  return {
    accessToken: Cookies.get('access_token'),
    refreshToken: Cookies.get('refresh_token'),
  };
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Auto-logout on token expiry
if (typeof window !== 'undefined') {
  setInterval(() => {
    const { accessToken } = getStoredTokens();
    const { isAuthenticated, logout } = useAuthStore.getState();
    
    if (isAuthenticated && accessToken && isTokenExpired(accessToken)) {
      logout();
    }
  }, 60000); // Check every minute
}