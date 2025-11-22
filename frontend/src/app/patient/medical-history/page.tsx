'use client';

import { useQuery } from '@tanstack/react-query';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserRole } from '@/types';
import { patientApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { FileText, Calendar, Activity } from 'lucide-react';

export default function MedicalHistoryPage() {
  const { user } = useAuthStore();

  const { data: medicalHistory } = useQuery({
    queryKey: ['patient', 'medical-history', user?.patient?.id],
    queryFn: () => patientApi.getMedicalHistory(user?.patient?.id || ''),
    enabled: !!user?.patient?.id,
  });

  const { data: pastVisits } = useQuery({
    queryKey: ['patient', 'past-visits', user?.patient?.id],
    queryFn: () => patientApi.getPastVisits(user?.patient?.id || ''),
    enabled: !!user?.patient?.id,
  });

  return (
    <RoleGuard allowedRoles={[UserRole.PATIENT]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
            <p className="text-gray-600">Your complete medical records</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Medical Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medicalHistory?.data?.length > 0 ? (
                  <div className="space-y-4">
                    {medicalHistory.data.map((condition: any) => (
                      <div key={condition.id} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium text-gray-900">{condition.condition}</h4>
                        <p className="text-sm text-gray-600">{condition.diagnosis}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(condition.diagnosedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No medical conditions recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Past Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pastVisits?.data?.length > 0 ? (
                  <div className="space-y-4">
                    {pastVisits.data.map((visit: any) => (
                      <div key={visit.id} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">
                          Dr. {visit.doctor.user.profile.firstName} {visit.doctor.user.profile.lastName}
                        </h4>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(visit.scheduledAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No past visits recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}