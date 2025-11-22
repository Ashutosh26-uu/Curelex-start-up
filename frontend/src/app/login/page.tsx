'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Stethoscope } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
  role?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const { user, access_token } = response.data;
      login(user, access_token);
      router.push('/');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Login failed');
    },
  });

  const onSubmit = (data: LoginForm) => {
    setError('');
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Stethoscope className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Healthcare Telemedicine Platform
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 font-medium mb-1">Demo Credentials:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <div>Admin: admin@healthcare.com / admin123</div>
              <div>Doctor: doctor@healthcare.com / doctor123</div>
              <div>Patient: patient@healthcare.com / patient123</div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
                error={errors.email?.message}
              />

              <Input
                label="Password"
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                error={errors.password?.message}
              />

              <Select
                label="Login As (Optional)"
                options={[
                  { value: '', label: 'Auto-detect role' },
                  { value: 'PATIENT', label: 'Patient' },
                  { value: 'DOCTOR', label: 'Doctor' },
                  { value: 'JUNIOR_DOCTOR', label: 'Junior Doctor' },
                  { value: 'NURSE', label: 'Nurse' },
                  { value: 'ADMIN', label: 'Administrator' },
                  { value: 'CEO', label: 'CEO' },
                  { value: 'CTO', label: 'CTO' },
                  { value: 'CFO', label: 'CFO' },
                  { value: 'CLO', label: 'CLO' },
                  { value: 'CMO', label: 'CMO' }
                ]}
                {...register('role')}
              />

              <Button
                type="submit"
                className="w-full"
                loading={loginMutation.isPending}
              >
                Sign in
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  New patient?{' '}
                  <a href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                    Register here
                  </a>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}