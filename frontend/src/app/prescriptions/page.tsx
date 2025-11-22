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
import { Textarea } from '@/components/ui/Textarea';
import { UserRole } from '@/types';
import { doctorApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Pill, Plus, Calendar } from 'lucide-react';

interface PrescriptionForm {
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export default function PrescriptionsPage() {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PrescriptionForm>();

  const { data: patients } = useQuery({
    queryKey: ['doctor', 'patients', user?.doctor?.id],
    queryFn: () => doctorApi.getPatients(user?.doctor?.id || ''),
    enabled: !!user?.doctor?.id,
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: doctorApi.createPrescription,
    onSuccess: () => {
      reset();
      setShowForm(false);
    },
  });

  const onSubmit = (data: PrescriptionForm) => {
    createPrescriptionMutation.mutate(data);
  };

  return (
    <RoleGuard allowedRoles={[UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
              <p className="text-gray-600">Manage patient prescriptions</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              {showForm ? 'Cancel' : 'New Prescription'}
            </Button>
          </div>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Prescription</CardTitle>
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
                      label="Medication"
                      placeholder="e.g., Amoxicillin"
                      {...register('medication', { required: 'Medication is required' })}
                      error={errors.medication?.message}
                    />

                    <Input
                      label="Dosage"
                      placeholder="e.g., 500mg"
                      {...register('dosage', { required: 'Dosage is required' })}
                      error={errors.dosage?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Frequency"
                      options={[
                        { value: '', label: 'Select Frequency' },
                        { value: 'Once daily', label: 'Once daily' },
                        { value: 'Twice daily', label: 'Twice daily' },
                        { value: 'Three times daily', label: 'Three times daily' },
                        { value: 'Four times daily', label: 'Four times daily' },
                        { value: 'As needed', label: 'As needed' }
                      ]}
                      {...register('frequency', { required: 'Frequency is required' })}
                      error={errors.frequency?.message}
                    />

                    <Input
                      label="Duration"
                      placeholder="e.g., 7 days"
                      {...register('duration', { required: 'Duration is required' })}
                      error={errors.duration?.message}
                    />
                  </div>

                  <Textarea
                    label="Instructions"
                    placeholder="Special instructions for the patient..."
                    {...register('instructions')}
                  />

                  <Button 
                    type="submit" 
                    loading={createPrescriptionMutation.isPending}
                    className="w-full"
                  >
                    Create Prescription
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions yet</h3>
                    <p className="text-gray-600">Create your first prescription for a patient</p>
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