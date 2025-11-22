'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Stethoscope } from 'lucide-react';
import { api } from '@/lib/api';

interface RegisterForm {
  name: string;
  age: number;
  gender: string;
  mobile: string;
  email: string;
  emergencyContact: string;
  symptoms: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    
    try {
      await api.post('/patients/register', { ...data, medicalHistory: [] });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600">Your account has been created. Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Stethoscope className="h-12 w-12 text-primary-600 mx-auto" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Patient Registration</h1>
          <p className="mt-2 text-gray-600">Join our healthcare platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register as Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  {...register('name', { required: 'Name is required' })}
                  error={errors.name?.message}
                />
                
                <Input
                  label="Age"
                  type="number"
                  {...register('age', { 
                    required: 'Age is required',
                    min: { value: 1, message: 'Age must be positive' }
                  })}
                  error={errors.age?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Gender"
                  options={[
                    { value: '', label: 'Select Gender' },
                    { value: 'MALE', label: 'Male' },
                    { value: 'FEMALE', label: 'Female' },
                    { value: 'OTHER', label: 'Other' }
                  ]}
                  {...register('gender', { required: 'Gender is required' })}
                  error={errors.gender?.message}
                />

                <Input
                  label="Mobile Number"
                  {...register('mobile', { required: 'Mobile is required' })}
                  error={errors.mobile?.message}
                />
              </div>

              <Input
                label="Email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                })}
                error={errors.email?.message}
              />

              <Input
                label="Emergency Contact"
                {...register('emergencyContact', { required: 'Emergency contact is required' })}
                error={errors.emergencyContact?.message}
              />

              <Textarea
                label="Current Symptoms"
                placeholder="Describe your current symptoms..."
                {...register('symptoms')}
                error={errors.symptoms?.message}
              />

              <Button type="submit" className="w-full" loading={loading}>
                Register
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}