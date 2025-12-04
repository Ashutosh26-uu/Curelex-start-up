'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  allowedRoles = [] 
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push('/login');
        return;
      }

      if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requireAuth, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}