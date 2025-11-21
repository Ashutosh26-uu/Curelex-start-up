'use client';

import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { getInitials } from '@/lib/utils';
import { Bell, LogOut } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (!user) return null;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome back, {user.profile?.firstName || 'User'}
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm">
          <Bell className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
            {user.profile ? getInitials(user.profile.firstName, user.profile.lastName) : 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">
              {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}