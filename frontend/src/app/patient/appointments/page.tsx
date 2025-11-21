'use client';

import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { appointmentApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Calendar, Video, Clock } from 'lucide-react';

export default function PatientAppointments() {
  const { data: appointments } = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: () => appointmentApi.getUpcoming(),
  });

  return (
    <RoleGuard allowedRoles={[UserRole.PATIENT]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600">View and manage your appointments</p>
            </div>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </div>

          <div className="grid gap-4">
            {appointments?.data?.map((appointment: any) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Dr. {appointment.doctor.user.profile.firstName} {appointment.doctor.user.profile.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{appointment.doctor.specialization}</p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(appointment.scheduledAt)} • {appointment.duration} min
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'CONFIRMED' 
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'SCHEDULED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                      {appointment.meetLink && (
                        <Button size="sm" variant="outline">
                          <Video className="h-4 w-4 mr-2" />
                          Join Meeting
                        </Button>
                      )}
                    </div>
                  </div>
                  {appointment.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">{appointment.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )) || (
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments scheduled</h3>
                  <p className="text-gray-600 mb-4">Book your first appointment to get started</p>
                  <Button>Book Appointment</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}