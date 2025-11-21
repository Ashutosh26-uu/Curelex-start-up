'use client';

import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Redirect based on user role
    if (user) {
      if (user.role === UserRole.PATIENT) {
        router.push('/patient');
      } else if ([UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR].includes(user.role)) {
        router.push('/doctor');
      } else if ([UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO, UserRole.ADMIN].includes(user.role)) {
        router.push('/officer');
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        <p className="text-gray-600 mt-2">Redirecting to your dashboard</p>
      </div>
    </div>
  );
}