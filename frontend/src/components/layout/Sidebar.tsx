'use client';

import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  Users, 
  Activity, 
  FileText, 
  Settings, 
  BarChart3,
  Stethoscope,
  User
} from 'lucide-react';

const patientNavItems = [
  { href: '/patient', label: 'Dashboard', icon: BarChart3 },
  { href: '/patient/appointments', label: 'Appointments', icon: Calendar },
  { href: '/patient/medical-history', label: 'Medical History', icon: FileText },
  { href: '/patient/vitals', label: 'Vitals', icon: Activity },
  { href: '/patient/profile', label: 'Profile', icon: User },
];

const doctorNavItems = [
  { href: '/doctor', label: 'Dashboard', icon: BarChart3 },
  { href: '/doctor/patients', label: 'Patients', icon: Users },
  { href: '/doctor/appointments', label: 'Appointments', icon: Calendar },
  { href: '/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
  { href: '/doctor/profile', label: 'Profile', icon: User },
];

const officerNavItems = [
  { href: '/officer', label: 'Dashboard', icon: BarChart3 },
  { href: '/officer/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/officer/reports', label: 'Reports', icon: FileText },
  { href: '/officer/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const getNavItems = () => {
    if (!user) return [];
    
    if (user.role === UserRole.PATIENT) return patientNavItems;
    if ([UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR].includes(user.role)) return doctorNavItems;
    if ([UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO, UserRole.ADMIN].includes(user.role)) return officerNavItems;
    
    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Stethoscope className="h-8 w-8 text-primary-600" />
        <span className="ml-2 text-xl font-semibold text-gray-900">HealthCare</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}