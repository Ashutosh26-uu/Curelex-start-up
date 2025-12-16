'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  requireRecentAuth?: boolean;
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  allowedRoles = [],
  requireRecentAuth = false
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, initializeAuth, checkTokenExpiry, logout } = useAuthStore();
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Validate session on mount and periodically
  useEffect(() => {
    if (isAuthenticated && user) {
      const validateSession = async () => {
        try {
          await authApi.validateSession();
          setSessionValid(true);
        } catch (error) {
          console.error('Session validation failed:', error);
          setSessionValid(false);
          logout();
          router.push('/login?reason=session_invalid');
        }
      };

      validateSession();
      
      // Validate session every 5 minutes
      const interval = setInterval(validateSession, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, logout, router]);

  // Check token expiry
  useEffect(() => {
    if (isAuthenticated && checkTokenExpiry()) {
      // Token is about to expire, try to refresh
      authApi.refreshToken().catch(() => {
        logout();
        router.push('/login?reason=token_expired');
      });
    }
  }, [isAuthenticated, checkTokenExpiry, logout, router]);

  useEffect(() => {
    if (!isLoading && sessionValid !== null) {
      if (requireAuth && (!isAuthenticated || !sessionValid)) {
        router.push('/login?reason=auth_required');
        return;
      }

      if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized?reason=insufficient_permissions');
        return;
      }

      if (requireRecentAuth && user) {
        // Check if user logged in within last 30 minutes for sensitive operations
        const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt).getTime() : 0;
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
        
        if (lastLogin < thirtyMinutesAgo) {
          router.push('/login?reason=reauth_required');
          return;
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requireAuth, allowedRoles, requireRecentAuth, sessionValid, router]);

  if (isLoading || (requireAuth && sessionValid === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && (!isAuthenticated || !sessionValid)) {
    return null;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}