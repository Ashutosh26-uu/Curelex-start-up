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
  sessionId: string | null;
}

interface AuthActions {
  login: (user: User, accessToken: string, refreshToken: string, sessionId?: string) => void;
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
  sessionId: null,
};

const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  httpOnly: false, // Client needs access for API calls
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: (user: User, accessToken: string, refreshToken: string, sessionId?: string) => {
        // Store tokens in secure cookies
        Cookies.set('access_token', accessToken, { 
          expires: 1/24, // 1 hour
          ...COOKIE_OPTIONS
        });
        
        Cookies.set('refresh_token', refreshToken, { 
          expires: 7, // 7 days
          ...COOKIE_OPTIONS
        });

        if (sessionId) {
          Cookies.set('session_id', sessionId, {
            expires: 7,
            ...COOKIE_OPTIONS
          });
        }

        set({
          user,
          accessToken,
          refreshToken,
          sessionId,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        // Clear all auth cookies
        ['access_token', 'refresh_token', 'session_id'].forEach(cookie => {
          Cookies.remove(cookie, { path: '/' });
        });
        
        set({ ...initialState });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      updateTokens: (accessToken: string, refreshToken: string) => {
        Cookies.set('access_token', accessToken, { 
          expires: 1/24,
          ...COOKIE_OPTIONS
        });
        
        Cookies.set('refresh_token', refreshToken, { 
          expires: 7,
          ...COOKIE_OPTIONS
        });

        set({ accessToken, refreshToken });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      clearAuth: () => {
        ['access_token', 'refresh_token', 'session_id'].forEach(cookie => {
          Cookies.remove(cookie, { path: '/' });
        });
        set({ ...initialState });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionId: state.sessionId,
      }),
    }
  )
);

// Helper functions
export const getStoredTokens = () => ({
  accessToken: Cookies.get('access_token'),
  refreshToken: Cookies.get('refresh_token'),
  sessionId: Cookies.get('session_id'),
});

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now() + 60000; // 1 minute buffer
  } catch {
    return true;
  }
};

// Enhanced token validation
if (typeof window !== 'undefined') {
  let tokenCheckInterval: NodeJS.Timeout;
  
  const startTokenMonitoring = () => {
    tokenCheckInterval = setInterval(() => {
      const { accessToken } = getStoredTokens();
      const { isAuthenticated, logout } = useAuthStore.getState();
      
      if (isAuthenticated && accessToken && isTokenExpired(accessToken)) {
        logout();
      }
    }, 30000); // Check every 30 seconds
  };
  
  const stopTokenMonitoring = () => {
    if (tokenCheckInterval) clearInterval(tokenCheckInterval);
  };
  
  // Start monitoring when authenticated
  useAuthStore.subscribe((state) => {
    if (state.isAuthenticated) {
      startTokenMonitoring();
    } else {
      stopTokenMonitoring();
    }
  });
}