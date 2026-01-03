'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Calendar, 
  Users, 
  FileText, 
  Clock, 
  Activity,
  User,
  Stethoscope
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const stats = [
    {
      title: 'Total Patients',
      value: '24',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      change: '+2 this week'
    },
    {
      title: "Today's Appointments",
      value: '8',
      icon: Calendar,
      color: 'bg-green-100 text-green-600',
      change: '3 completed'
    },
    {
      title: 'Prescriptions',
      value: '15',
      icon: FileText,
      color: 'bg-purple-100 text-purple-600',
      change: '5 pending'
    },
    {
      title: 'Next Patient',
      value: '2:00 PM',
      icon: Clock,
      color: 'bg-orange-100 text-orange-600',
      change: 'John Doe'
    }
  ];

  const quickActions = [
    {
      title: 'View Appointments',
      description: 'Manage your appointment schedule',
      icon: Calendar,
      color: 'bg-blue-500',
      action: () => router.push('/doctor/appointments'),
    },
    {
      title: 'Patient List',
      description: 'View and manage your patients',
      icon: Users,
      color: 'bg-green-500',
      action: () => router.push('/doctor/patients'),
    },
    {
      title: 'Prescriptions',
      description: 'Create and manage prescriptions',
      icon: FileText,
      color: 'bg-purple-500',
      action: () => router.push('/prescriptions'),
    },
    {
      title: 'Patient Vitals',
      description: 'Monitor patient health data',
      icon: Activity,
      color: 'bg-red-500',
      action: () => router.push('/vitals'),
    },
  ];

  if (isLoading) {
    return (
      <AuthGuard>
        <RoleGuard allowedRoles={['DOCTOR', 'JUNIOR_DOCTOR']}>
          <DashboardLayout>
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your dashboard...</p>
              </div>
            </div>
          </DashboardLayout>
        </RoleGuard>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['DOCTOR', 'JUNIOR_DOCTOR']}>
        <DashboardLayout>
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    Welcome, Dr. {user?.profile?.firstName || 'Doctor'}!
                  </h1>
                  <p className="text-green-100">
                    Doctor ID: {user?.doctor?.doctorId || 'N/A'}
                  </p>
                  <p className="text-green-100 text-sm">
                    {user?.doctor?.specialization || 'General Practice'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-xs text-gray-500">{stat.change}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={action.action}>
                    <div className="text-center">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/doctor/appointments')}
                  >
                    View All
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {[
                    { time: '9:00 AM', patient: 'Sarah Johnson', type: 'Consultation' },
                    { time: '10:30 AM', patient: 'Mike Chen', type: 'Follow-up' },
                    { time: '2:00 PM', patient: 'John Doe', type: 'Check-up' },
                  ].map((appointment, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{appointment.patient}</p>
                        <p className="text-sm text-gray-600">{appointment.time} - {appointment.type}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Scheduled
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/doctor/patients')}
                  >
                    View All
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: 'Emma Wilson', condition: 'Hypertension', lastVisit: '2 days ago' },
                    { name: 'David Brown', condition: 'Diabetes', lastVisit: '1 week ago' },
                    { name: 'Lisa Garcia', condition: 'Asthma', lastVisit: '2 weeks ago' },
                  ].map((patient, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.condition}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{patient.lastVisit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </DashboardLayout>
      </RoleGuard>
    </AuthGuard>
  );
}