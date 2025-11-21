'use client';

import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserRole } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { officerApi } from '@/lib/api';
import { Users, Calendar, TrendingUp, Activity } from 'lucide-react';

export default function OfficerDashboard() {
  const { data: dashboardData } = useQuery({
    queryKey: ['officer', 'dashboard'],
    queryFn: () => officerApi.getDashboard(),
  });

  const { data: appointmentAnalytics } = useQuery({
    queryKey: ['officer', 'analytics', 'appointments'],
    queryFn: () => officerApi.getAppointmentAnalytics(),
  });

  const stats = dashboardData?.data;

  return (
    <RoleGuard allowedRoles={[UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO, UserRole.ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
            <p className="text-gray-600">Healthcare system overview and analytics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalPatients || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalDoctors || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +2 new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalAppointments || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.todayAppointments || 0} today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.completionRate ? `${stats.completionRate.toFixed(1)}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointmentAnalytics?.data?.byStatus?.map((status: any) => (
                    <div key={status.status} className="flex items-center justify-between">
                      <div className="text-sm font-medium capitalize">
                        {status.status.toLowerCase().replace('_', ' ')}
                      </div>
                      <div className="text-sm font-bold">
                        {status._count.status}
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Server Status</div>
                    <div className="text-sm text-green-600 font-medium">Online</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Database</div>
                    <div className="text-sm text-green-600 font-medium">Healthy</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">API Response</div>
                    <div className="text-sm text-green-600 font-medium">Fast</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Uptime</div>
                    <div className="text-sm text-green-600 font-medium">99.9%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}