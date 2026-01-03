'use client';

import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserRole } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { apiHelpers } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Users, Calendar, FileText, Clock } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuthStore();

  const { data: appointments } = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: () => apiHelpers.appointments.getUpcoming(),
  });

  const { data: patients } = useQuery({
    queryKey: ['doctor', 'patients', user?.doctor?.id],
    queryFn: () => apiHelpers.patients.getProfile(),
    enabled: !!user?.doctor?.id,
  });

  return (
    <RoleGuard allowedRoles={[UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600">Manage your patients and appointments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patients?.data?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointments?.data?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Patient</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {appointments?.data?.[0] ? '2:00 PM' : 'No appointments'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments?.data?.slice(0, 5).map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {appointment.patient.user.profile.firstName} {appointment.patient.user.profile.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{appointment.scheduledAt}</p>
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {appointment.status}
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">No appointments today</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patients?.data?.slice(0, 5).map((assignment: any) => (
                    <div key={assignment.id} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {assignment.patient.user.profile.firstName} {assignment.patient.user.profile.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Patient ID: {assignment.patient.patientId}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        Active
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">No assigned patients</p>
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