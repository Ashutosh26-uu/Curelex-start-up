'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, getStoredTokens, isTokenExpired } from '@/store/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = '/patient-login' }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user, setLoading, clearAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { accessToken, refreshToken } = getStoredTokens();

        // No tokens found
        if (!accessToken || !refreshToken) {
          clearAuth();
          router.push(redirectTo);
          return;
        }

        // Check if access token is expired
        if (isTokenExpired(accessToken)) {
          // Try to refresh token
          try {
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
              throw new Error('Token refresh failed');
            }

            const data = await response.json();
            // Update tokens in store
            useAuthStore.getState().updateTokens(data.accessToken, data.refreshToken);
          } catch (error) {
            // Refresh failed, clear auth and redirect
            clearAuth();
            router.push(redirectTo);
            return;
          }
        }

        // If we have a valid token but no user data, redirect to login
        if (!user && accessToken) {
          clearAuth();
          router.push(redirectTo);
          return;
        }

      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuth();
        router.push(redirectTo);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, user, router, redirectTo, clearAuth]);

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!isAuthenticated || !user) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}