'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserRole } from '@/types';
import { apiHelpers } from '@/lib/api';
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
    queryFn: () => apiHelpers.appointments.getUpcoming(),
  });

  const { data: patients } = useQuery({
    queryKey: ['doctor', 'patients', user?.doctor?.id],
    queryFn: () => apiHelpers.patients.getProfile(),
    enabled: !!user?.doctor?.id,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: apiHelpers.appointments.create,
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
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Patient *
                    </label>
                    <select
                      {...register('patientId', { required: 'Patient is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    >
                      <option value="">Select Patient</option>
                      {patients?.data?.map((assignment: any) => (
                        <option key={assignment.patient.id} value={assignment.patient.id}>
                          {assignment.patient.user.profile.firstName} {assignment.patient.user.profile.lastName}
                        </option>
                      ))}
                    </select>
                    {errors.patientId && (
                      <p className="text-sm text-red-600">{errors.patientId.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Date & Time"
                      type="datetime-local"
                      {...register('scheduledAt', { required: 'Date & time is required' })}
                      error={errors.scheduledAt?.message}
                    />

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Duration *
                      </label>
                      <select
                        {...register('duration', { required: 'Duration is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                      </select>
                      {errors.duration && (
                        <p className="text-sm text-red-600">{errors.duration.message}</p>
                      )}
                    </div>
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
            {appointments?.data && appointments.data.length > 0 ? (
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
                          <a 
                            href={appointment.meetLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join Meeting
                          </a>
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