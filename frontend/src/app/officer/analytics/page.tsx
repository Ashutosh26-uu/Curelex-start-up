'use client';

import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserRole } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { officerApi } from '@/lib/api';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';

export default function OfficerAnalytics() {
  const { data: appointmentAnalytics } = useQuery({
    queryKey: ['officer', 'analytics', 'appointments'],
    queryFn: () => officerApi.getAppointmentAnalytics(),
  });

  const { data: patientAnalytics } = useQuery({
    queryKey: ['officer', 'analytics', 'patients'],
    queryFn: () => officerApi.getPatientAnalytics(),
  });

  return (
    <RoleGuard allowedRoles={[UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO, UserRole.ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Detailed insights and performance metrics</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Appointment Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointmentAnalytics?.data?.byStatus?.map((status: any) => {
                    const percentage = (status._count.status / appointmentAnalytics.data.byStatus.reduce((acc: number, s: any) => acc + s._count.status, 0)) * 100;
                    
                    return (
                      <div key={status.status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium capitalize">
                            {status.status.toLowerCase().replace('_', ' ')}
                          </span>
                          <span className="text-gray-600">
                            {status._count.status} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }) || (
                    <p className="text-sm text-gray-500">No appointment data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Patient Registration Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">This Month</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {patientAnalytics?.data?.byMonth?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12% from last month
                  </div>
                  <div className="pt-4">
                    <div className="text-xs text-gray-500 mb-2">Registration Activity</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">API Response Time</span>
                    <span className="text-sm text-green-600 font-medium">125ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Database Queries</span>
                    <span className="text-sm text-green-600 font-medium">Fast</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-sm text-green-600 font-medium">0.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Users</span>
                    <span className="text-sm text-blue-600 font-medium">1,234</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">98.5%</div>
                    <div className="text-xs text-blue-600">Uptime</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">4.8</div>
                    <div className="text-xs text-green-600">Satisfaction</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">2.3k</div>
                    <div className="text-xs text-purple-600">Monthly Users</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">15min</div>
                    <div className="text-xs text-orange-600">Avg Session</div>
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