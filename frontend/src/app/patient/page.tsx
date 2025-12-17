'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiHelpers } from '@/lib/api';
import { 
  Calendar, 
  Heart, 
  FileText, 
  Bell, 
  User, 
  Activity,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface DashboardStats {
  upcomingAppointments: number;
  totalAppointments: number;
  unreadNotifications: number;
  activePrescriptions: number;
}

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    totalAppointments: 0,
    unreadNotifications: 0,
    activePrescriptions: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentVitals, setRecentVitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load upcoming appointments
      const appointmentsResponse = await apiHelpers.appointments.getUpcoming();
      const appointments = appointmentsResponse.data.data || [];
      setUpcomingAppointments(appointments.slice(0, 3)); // Show only 3 recent

      // Load notifications
      const notificationsResponse = await apiHelpers.notifications.getAll();
      const notifications = notificationsResponse.data.data || [];
      const unreadCount = notifications.filter((n: any) => !n.isRead).length;

      // Load recent vitals if patient ID is available
      let vitals = [];
      if (user?.patient?.id) {
        try {
          const vitalsResponse = await apiHelpers.vitals.getHistory(user.patient.id, 1, 5);
          vitals = vitalsResponse.data.data || [];
        } catch (error) {
          console.log('Vitals not available yet');
        }
      }
      setRecentVitals(vitals);

      // Update stats
      setStats({
        upcomingAppointments: appointments.length,
        totalAppointments: appointments.length, // This would come from a different endpoint
        unreadNotifications: unreadCount,
        activePrescriptions: 0, // This would come from prescriptions endpoint
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Book Appointment',
      description: 'Schedule a new appointment with your doctor',
      icon: Calendar,
      color: 'bg-blue-500',
      action: () => router.push('/patient/appointments'),
    },
    {
      title: 'View Medical History',
      description: 'Access your complete medical records',
      icon: FileText,
      color: 'bg-green-500',
      action: () => router.push('/patient/medical-history'),
    },
    {
      title: 'Check Vitals',
      description: 'View your latest health measurements',
      icon: Activity,
      color: 'bg-purple-500',
      action: () => router.push('/vitals'),
    },
    {
      title: 'Notifications',
      description: 'View important health updates',
      icon: Bell,
      color: 'bg-orange-500',
      action: () => router.push('/notifications'),
    },
  ];

  if (isLoading) {
    return (
      <AuthGuard>
        <RoleGuard allowedRoles={['PATIENT']}>
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
      <RoleGuard allowedRoles={['PATIENT']}>
        <DashboardLayout>
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    Welcome back, {user?.profile?.firstName || 'Patient'}!
                  </h1>
                  <p className="text-blue-100">
                    Patient ID: {user?.patient?.patientId || 'N/A'}
                  </p>
                  <p className="text-blue-100 text-sm">
                    Last login: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
                    <p className="text-sm text-gray-600">Upcoming Appointments</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{recentVitals.length}</p>
                    <p className="text-sm text-gray-600">Recent Vitals</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.unreadNotifications}</p>
                    <p className="text-sm text-gray-600">New Notifications</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.activePrescriptions}</p>
                    <p className="text-sm text-gray-600">Active Prescriptions</p>
                  </div>
                </div>
              </Card>
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

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Appointments */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/patient/appointments')}
                  >
                    View All
                  </Button>
                </div>
                
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment: any, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            Dr. {appointment.doctor?.user?.profile?.firstName || 'Doctor'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.scheduledAt).toLocaleDateString()} at{' '}
                            {new Date(appointment.scheduledAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No upcoming appointments</p>
                    <Button 
                      className="mt-3"
                      onClick={() => router.push('/patient/appointments')}
                    >
                      Book Appointment
                    </Button>
                  </div>
                )}
              </Card>

              {/* Recent Vitals */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Vitals</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/vitals')}
                  >
                    View All
                  </Button>
                </div>
                
                {recentVitals.length > 0 ? (
                  <div className="space-y-3">
                    {recentVitals.map((vital: any, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Activity className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{vital.type}</p>
                          <p className="text-sm text-gray-600">
                            {vital.value} {vital.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(vital.recordedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No vitals recorded yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Vitals will be recorded during your appointments
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </DashboardLayout>
      </RoleGuard>
    </AuthGuard>
  );
}