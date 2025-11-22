'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { UserRole } from '@/types';
import { api } from '@/lib/api';
import { Users, UserPlus, Settings, Activity } from 'lucide-react';

export default function AdminPage() {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');

  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get('/admin/users'),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/admin/stats'),
  });

  const assignDoctorMutation = useMutation({
    mutationFn: (data: { doctorId: string; patientId: string }) =>
      api.post('/admin/assign-doctor', data),
    onSuccess: () => {
      setSelectedDoctor('');
      setSelectedPatient('');
      refetchUsers();
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      api.patch(`/admin/users/${userId}`, { isActive: !isActive }),
    onSuccess: () => refetchUsers(),
  });

  const handleAssignDoctor = () => {
    if (selectedDoctor && selectedPatient) {
      assignDoctorMutation.mutate({
        doctorId: selectedDoctor,
        patientId: selectedPatient,
      });
    }
  };

  const doctors = users?.data?.filter((u: any) => 
    [UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR].includes(u.role)
  ) || [];

  const patients = users?.data?.filter((u: any) => u.role === UserRole.PATIENT) || [];

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users and system settings</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.data?.totalUsers || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserPlus className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.data?.activeUsers || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.data?.totalPatients || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Settings className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.data?.totalDoctors || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assign Doctor */}
            <Card>
              <CardHeader>
                <CardTitle>Assign Doctor to Patient</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Select Doctor"
                  options={[
                    { value: '', label: 'Choose Doctor' },
                    ...doctors.map((d: any) => ({
                      value: d.doctor?.id || '',
                      label: `Dr. ${d.profile?.firstName} ${d.profile?.lastName} - ${d.doctor?.specialization}`
                    }))
                  ]}
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                />

                <Select
                  label="Select Patient"
                  options={[
                    { value: '', label: 'Choose Patient' },
                    ...patients.map((p: any) => ({
                      value: p.patient?.id || '',
                      label: `${p.profile?.firstName} ${p.profile?.lastName} (${p.patient?.patientId})`
                    }))
                  ]}
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                />

                <Button
                  onClick={handleAssignDoctor}
                  disabled={!selectedDoctor || !selectedPatient}
                  loading={assignDoctorMutation.isPending}
                  className="w-full"
                >
                  Assign Doctor
                </Button>
              </CardContent>
            </Card>

            {/* User Management */}
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {users?.data?.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {user.profile?.firstName} {user.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {user.role}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant={user.isActive ? "outline" : "primary"}
                        onClick={() => toggleUserStatusMutation.mutate({
                          userId: user.id,
                          isActive: user.isActive
                        })}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}