'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { UserRole } from '@/types';
import { appointmentApi, doctorApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Calendar, Clock, Video, Users } from 'lucide-react';

interface AppointmentForm {
  patientId: string;
  scheduledAt: string;
  duration: number;
  notes?: string;
}

export default function DoctorAppointments() {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppointmentForm>();

  const { data: appointments, refetch } = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: () => appointmentApi.getUpcoming(),
  });

  const { data: patients } = useQuery({
    queryKey: ['doctor', 'patients', user?.doctor?.id],
    queryFn: () => doctorApi.getPatients(user?.doctor?.id || ''),
    enabled: !!user?.doctor?.id,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: appointmentApi.create,
    onSuccess: () => {
      reset();
      setShowForm(false);
      refetch();
    },
  });

  const onSubmit = (data: AppointmentForm) => {
    createAppointmentMutation.mutate({
      ...data,
      doctorId: user?.doctor?.id,
    });
  };

  return (
    <RoleGuard allowedRoles={[UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
              <p className="text-gray-600">Manage your appointments</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Schedule Appointment'}
            </Button>
          </div>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule New Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Select
                    label="Patient"
                    options={[
                      { value: '', label: 'Select Patient' },
                      ...(patients?.data?.map((assignment: any) => ({
                        value: assignment.patient.id,
                        label: `${assignment.patient.user.profile.firstName} ${assignment.patient.user.profile.lastName}`
                      })) || [])
                    ]}
                    {...register('patientId', { required: 'Patient is required' })}
                    error={errors.patientId?.message}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Date & Time"
                      type="datetime-local"
                      {...register('scheduledAt', { required: 'Date & time is required' })}
                      error={errors.scheduledAt?.message}
                    />

                    <Select
                      label="Duration"
                      options={[
                        { value: '15', label: '15 minutes' },
                        { value: '30', label: '30 minutes' },
                        { value: '45', label: '45 minutes' },
                        { value: '60', label: '1 hour' }
                      ]}
                      {...register('duration', { required: 'Duration is required' })}
                      error={errors.duration?.message}
                    />
                  </div>

                  <Input
                    label="Notes (Optional)"
                    placeholder="Appointment notes..."
                    {...register('notes')}
                  />

                  <Button 
                    type="submit" 
                    loading={createAppointmentMutation.isPending}
                    className="w-full"
                  >
                    Schedule Appointment
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6">
            {appointments?.data?.length > 0 ? (
              appointments.data.map((appointment: any) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {appointment.patient.user.profile.firstName} {appointment.patient.user.profile.lastName}
                          </h3>
                          <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(appointment.scheduledAt).toLocaleString()}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {appointment.duration} minutes
                            </div>
                          </div>
                          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                            appointment.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {appointment.meetLink && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={appointment.meetLink} target="_blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4 mr-2" />
                              Join Meeting
                            </a>
                          </Button>
                        )}
                        <Button size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{appointment.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments scheduled</h3>
                  <p className="text-gray-600">Schedule your first appointment with a patient</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}