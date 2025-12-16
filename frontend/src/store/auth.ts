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
  tokenExpiresAt: number | null;
  lastActivity: number;
  securitySettings: {
    autoLogoutMinutes: number;
    requireReauth: boolean;
  };
  setAuth: (user: User, token: string, refreshToken: string, sessionId?: string) => void;
  logout: () => void;
  logoutAll: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
  setLoginHistory: (history: any[]) => void;
  setActiveSessions: (sessions: any[]) => void;
  updateLastActivity: () => void;
  checkTokenExpiry: () => boolean;
  clearSensitiveData: () => void;
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
      tokenExpiresAt: null,
      lastActivity: Date.now(),
      securitySettings: {
        autoLogoutMinutes: 30,
        requireReauth: false,
      },
      setAuth: (user, token, refreshToken, sessionId) => {
        const now = Date.now();
        const expiresAt = now + (15 * 60 * 1000); // 15 minutes for access token
        
        if (typeof window !== 'undefined') {
          // Use secure storage methods
          try {
            localStorage.setItem('access_token', token);
            localStorage.setItem('refresh_token', refreshToken);
            localStorage.setItem('session_id', sessionId || '');
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token_expires_at', expiresAt.toString());
            localStorage.setItem('last_activity', now.toString());
          } catch (error) {
            console.error('Failed to store auth data:', error);
          }
        }
        
        set({ 
          user, 
          token, 
          refreshToken, 
          sessionId, 
          tokenExpiresAt: expiresAt,
          lastActivity: now,
          isAuthenticated: true, 
          isLoading: false 
        });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          // Clear all auth-related data
          const keysToRemove = [
            'access_token',
            'refresh_token', 
            'session_id',
            'user',
            'token_expires_at',
            'last_activity'
          ];
          
          keysToRemove.forEach(key => {
            try {
              localStorage.removeItem(key);
            } catch (error) {
              console.error(`Failed to remove ${key}:`, error);
            }
          });
          
          // Clear any cached data
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => {
                if (name.includes('auth') || name.includes('user')) {
                  caches.delete(name);
                }
              });
            });
          }
        }
        
        set({ 
          user: null, 
          token: null, 
          refreshToken: null, 
          sessionId: null,
          tokenExpiresAt: null,
          isAuthenticated: false, 
          isLoading: false,
          loginHistory: [],
          activeSessions: [],
          lastActivity: Date.now(),
        });
      },
      logoutAll: () => {
        get().logout();
      },
      updateUser: (userData) => {
        set((state) => {
          const updatedUser = state.user ? { ...state.user, ...userData } : null;
          if (typeof window !== 'undefined' && updatedUser) {
            try {
              localStorage.setItem('user', JSON.stringify(updatedUser));
            } catch (error) {
              console.error('Failed to update user data:', error);
            }
          }
          return { 
            user: updatedUser,
            lastActivity: Date.now()
          };
        });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      initializeAuth: () => {
        if (typeof window !== 'undefined') {
          try {
            const token = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            const sessionId = localStorage.getItem('session_id');
            const userStr = localStorage.getItem('user');
            const expiresAtStr = localStorage.getItem('token_expires_at');
            const lastActivityStr = localStorage.getItem('last_activity');
            
            if (token && refreshToken && userStr) {
              const user = JSON.parse(userStr);
              const expiresAt = expiresAtStr ? parseInt(expiresAtStr) : null;
              const lastActivity = lastActivityStr ? parseInt(lastActivityStr) : Date.now();
              
              // Check if token is expired
              const now = Date.now();
              if (expiresAt && now > expiresAt) {
                console.log('Token expired, clearing auth');
                get().logout();
                return;
              }
              
              // Check for auto-logout due to inactivity
              const inactiveMinutes = (now - lastActivity) / (1000 * 60);
              if (inactiveMinutes > get().securitySettings.autoLogoutMinutes) {
                console.log('Auto-logout due to inactivity');
                get().logout();
                return;
              }
              
              set({ 
                user, 
                token, 
                refreshToken, 
                sessionId, 
                tokenExpiresAt: expiresAt,
                lastActivity,
                isAuthenticated: true, 
                isLoading: false 
              });
            } else {
              set({ isLoading: false });
            }
          } catch (error) {
            console.error('Failed to initialize auth:', error);
            get().logout();
          }
        } else {
          set({ isLoading: false });
        }
      },
      setLoginHistory: (history) => set({ loginHistory: history }),
      setActiveSessions: (sessions) => set({ activeSessions: sessions }),
      
      updateLastActivity: () => {
        const now = Date.now();
        if (typeof window !== 'undefined') {
          localStorage.setItem('last_activity', now.toString());
        }
        set({ lastActivity: now });
      },
      
      checkTokenExpiry: () => {
        const state = get();
        if (!state.tokenExpiresAt) return false;
        
        const now = Date.now();
        const timeUntilExpiry = state.tokenExpiresAt - now;
        
        // Token expires in less than 5 minutes
        if (timeUntilExpiry < 5 * 60 * 1000) {
          return true;
        }
        
        return false;
      },
      
      clearSensitiveData: () => {
        set({
          loginHistory: [],
          activeSessions: [],
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        refreshToken: state.refreshToken,
        sessionId: state.sessionId,
        tokenExpiresAt: state.tokenExpiresAt,
        lastActivity: state.lastActivity,
        isAuthenticated: state.isAuthenticated,
        securitySettings: state.securitySettings
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle migration for version updates
        if (version === 0) {
          return {
            ...persistedState,
            tokenExpiresAt: null,
            lastActivity: Date.now(),
            securitySettings: {
              autoLogoutMinutes: 30,
              requireReauth: false,
            }
          };
        }
        return persistedState;
      },
    }
  )
);

// Auto-logout on inactivity
if (typeof window !== 'undefined') {
  let inactivityTimer: NodeJS.Timeout;
  
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    const store = useAuthStore.getState();
    
    if (store.isAuthenticated) {
      store.updateLastActivity();
      
      inactivityTimer = setTimeout(() => {
        console.log('Auto-logout due to inactivity');
        store.logout();
        window.location.href = '/login?reason=inactivity';
      }, store.securitySettings.autoLogoutMinutes * 60 * 1000);
    }
  };
  
  // Listen for user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  events.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
  });
  
  // Initialize timer
  resetInactivityTimer();
}