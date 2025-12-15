import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginHistory: any[];
  activeSessions: any[];
  setAuth: (user: User, token: string, refreshToken: string, sessionId?: string) => void;
  logout: () => void;
  logoutAll: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
  setLoginHistory: (history: any[]) => void;
  setActiveSessions: (sessions: any[]) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      sessionId: null,
      isAuthenticated: false,
      isLoading: true,
      loginHistory: [],
      activeSessions: [],
      setAuth: (user, token, refreshToken, sessionId) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('session_id', sessionId || '');
          localStorage.setItem('user', JSON.stringify(user));
        }
        set({ user, token, refreshToken, sessionId, isAuthenticated: true, isLoading: false });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('session_id');
          localStorage.removeItem('user');
        }
        set({ 
          user: null, 
          token: null, 
          refreshToken: null, 
          sessionId: null,
          isAuthenticated: false, 
          isLoading: false,
          loginHistory: [],
          activeSessions: [],
        });
      },
      logoutAll: () => {
        get().logout();
      },
      updateUser: (userData) => {
        set((state) => {
          const updatedUser = state.user ? { ...state.user, ...userData } : null;
          if (typeof window !== 'undefined' && updatedUser) {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          return { user: updatedUser };
        });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      initializeAuth: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('access_token');
          const refreshToken = localStorage.getItem('refresh_token');
          const sessionId = localStorage.getItem('session_id');
          const userStr = localStorage.getItem('user');
          
          if (token && refreshToken && userStr) {
            try {
              const user = JSON.parse(userStr);
              set({ user, token, refreshToken, sessionId, isAuthenticated: true, isLoading: false });
            } catch (error) {
              console.error('Failed to parse user data:', error);
              get().logout();
            }
          } else {
            set({ isLoading: false });
          }
        }
      },
      setLoginHistory: (history) => set({ loginHistory: history }),
      setActiveSessions: (sessions) => set({ activeSessions: sessions }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);