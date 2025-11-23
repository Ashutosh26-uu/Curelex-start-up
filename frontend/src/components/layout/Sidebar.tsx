'use client';

import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Stethoscope, Home, Users, Calendar, Activity, 
  FileText, Settings, BarChart3, Bell, Shield 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN, UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO] },
  { name: 'Patients', href: '/doctor/patients', icon: Users, roles: [UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR] },
  { name: 'Appointments', href: '/appointments', icon: Calendar, roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR] },
  { name: 'Vitals', href: '/vitals', icon: Activity, roles: [UserRole.NURSE, UserRole.JUNIOR_DOCTOR, UserRole.DOCTOR] },
  { name: 'Prescriptions', href: '/prescriptions', icon: FileText, roles: [UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR] },
  { name: 'Analytics', href: '/officer/analytics', icon: BarChart3, roles: [UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO] },
  { name: 'Admin', href: '/admin', icon: Shield, roles: [UserRole.ADMIN] },
  { name: 'Notifications', href: '/notifications', icon: Bell, roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN] },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  if (!user) return null;

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Stethoscope className="h-8 w-8 text-primary-600" />
        <span className="ml-2 text-xl font-semibold text-gray-900">HealthCare</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}