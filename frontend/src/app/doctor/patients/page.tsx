'use client';

import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { apiHelpers } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { getInitials } from '@/lib/utils';
import { Users, Phone, Mail, FileText } from 'lucide-react';

export default function DoctorPatients() {
  const { user } = useAuthStore();

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
            <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
            <p className="text-gray-600">Manage your assigned patients</p>
          </div>

          <div className="grid gap-6">
            {patients?.data?.map((assignment: any) => {
              const patient = assignment.patient;
              const profile = patient.user.profile;
              
              return (
                <Card key={assignment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                          {getInitials(profile.firstName, profile.lastName)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {profile.firstName} {profile.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">Patient ID: {patient.patientId}</p>
                          <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                            {profile.phone && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {profile.phone}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {patient.user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          View Records
                        </Button>
                        <Button size="sm">
                          Schedule Appointment
                        </Button>
                      </div>
                    </div>
                    
                    {(patient.bloodGroup || patient.allergies) && (
                      <div className="mt-4 grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-md">
                        {patient.bloodGroup && (
                          <div>
                            <span className="text-xs font-medium text-gray-500">Blood Group</span>
                            <p className="text-sm text-gray-900">{patient.bloodGroup}</p>
                          </div>
                        )}
                        {patient.allergies && (
                          <div>
                            <span className="text-xs font-medium text-gray-500">Allergies</span>
                            <p className="text-sm text-gray-900">{patient.allergies}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            }) || (
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No patients assigned</h3>
                  <p className="text-gray-600">Patients will appear here once assigned by admin</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}