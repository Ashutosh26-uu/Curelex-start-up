'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { UserRole } from '@/types';
import { vitalsApi, patientApi } from '@/lib/api';
import { Activity, Heart, Thermometer } from 'lucide-react';

interface VitalForm {
  patientId: string;
  type: string;
  value: string;
  unit: string;
  notes?: string;
}

const vitalTypes = [
  { value: 'BLOOD_PRESSURE', label: 'Blood Pressure', unit: 'mmHg' },
  { value: 'HEART_RATE', label: 'Heart Rate', unit: 'bpm' },
  { value: 'OXYGEN_SATURATION', label: 'Oxygen Saturation', unit: '%' },
  { value: 'BLOOD_SUGAR', label: 'Blood Sugar', unit: 'mg/dL' },
  { value: 'TEMPERATURE', label: 'Temperature', unit: '°F' },
  { value: 'WEIGHT', label: 'Weight', unit: 'lbs' },
  { value: 'HEIGHT', label: 'Height', unit: 'inches' },
];

export default function VitalsPage() {
  const [selectedType, setSelectedType] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<VitalForm>();

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientApi.getAll(),
  });

  const createVitalMutation = useMutation({
    mutationFn: vitalsApi.create,
    onSuccess: () => {
      reset();
      setSelectedType('');
    },
  });

  const onSubmit = (data: VitalForm) => {
    const selectedVitalType = vitalTypes.find(v => v.value === data.type);
    createVitalMutation.mutate({
      ...data,
      unit: selectedVitalType?.unit || '',
    });
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
  };

  return (
    <RoleGuard allowedRoles={[UserRole.NURSE, UserRole.JUNIOR_DOCTOR, UserRole.DOCTOR]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Record Vitals</h1>
            <p className="text-gray-600">Record patient vital signs</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Record New Vitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Select
                    label="Patient"
                    options={[
                      { value: '', label: 'Select Patient' },
                      ...(patients?.data?.map((p: any) => ({
                        value: p.id,
                        label: `${p.user.profile.firstName} ${p.user.profile.lastName} (${p.patientId})`
                      })) || [])
                    ]}
                    {...register('patientId', { required: 'Patient is required' })}
                    error={errors.patientId?.message}
                  />

                  <Select
                    label="Vital Type"
                    options={[
                      { value: '', label: 'Select Vital Type' },
                      ...vitalTypes.map(v => ({ value: v.value, label: v.label }))
                    ]}
                    {...register('type', { required: 'Vital type is required' })}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    error={errors.type?.message}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Value"
                      placeholder={selectedType === 'BLOOD_PRESSURE' ? '120/80' : 'Enter value'}
                      {...register('value', { required: 'Value is required' })}
                      error={errors.value?.message}
                    />
                    
                    <Input
                      label="Unit"
                      value={vitalTypes.find(v => v.value === selectedType)?.unit || ''}
                      disabled
                    />
                  </div>

                  <Textarea
                    label="Notes (Optional)"
                    placeholder="Additional notes..."
                    {...register('notes')}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    loading={createVitalMutation.isPending}
                  >
                    Record Vitals
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {vitalTypes.slice(0, 4).map((vital) => (
                    <Button
                      key={vital.value}
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => setSelectedType(vital.value)}
                    >
                      <Thermometer className="h-6 w-6 mb-2" />
                      <span className="text-xs">{vital.label}</span>
                    </Button>
                  ))}
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Critical Values Alert</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• BP: &gt;180/120 mmHg</li>
                    <li>• Heart Rate: &lt;50 or &gt;120 bpm</li>
                    <li>• O2 Sat: &lt;90%</li>
                    <li>• Temperature: &lt;95°F or &gt;103°F</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}