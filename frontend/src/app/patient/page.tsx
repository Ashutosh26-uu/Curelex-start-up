'use client';

import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserRole } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { appointmentApi, vitalsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Calendar, Activity, FileText, Clock } from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuthStore();

  const { data: appointments } = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: () => appointmentApi.getUpcoming(),
  });

  const { data: vitals } = useQuery({
    queryKey: ['vitals', 'latest', user?.patient?.id],
    queryFn: () => vitalsApi.getLatest(user?.patient?.id || ''),
    enabled: !!user?.patient?.id,
  });

  return (
    <RoleGuard allowedRoles={[UserRole.PATIENT]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
            <p className="text-gray-600">Welcome to your healthcare portal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointments?.data?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Latest Vitals</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vitals?.data?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {appointments?.data?.[0] ? 'Today 2:00 PM' : 'No upcoming'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments?.data?.slice(0, 3).map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Dr. {appointment.doctor.user.profile.firstName} {appointment.doctor.user.profile.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{appointment.scheduledAt}</p>
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {appointment.status}
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">No recent appointments</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latest Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vitals?.data?.slice(0, 3).map((vital: any) => (
                    <div key={vital.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{vital.type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{vital.recordedAt}</p>
                      </div>
                      <div className="text-sm font-medium">
                        {vital.value} {vital.unit}
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">No vitals recorded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}