'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Stethoscope } from 'lucide-react';

interface DoctorLoginForm {
  email: string;
  password: string;
}

export default function DoctorLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<DoctorLoginForm>();

  const loginMutation = useMutation({
    mutationFn: authApi.doctorLogin,
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response;
      setAuth(user, accessToken, refreshToken);
      router.push('/doctor');
    },
    onError: (error: any) => {
      setError(error.message || 'Login failed');
    },
  });

  const onSubmit = (data: DoctorLoginForm) => {
    setError('');
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Stethoscope className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Doctor Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your medical dashboard
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login to Doctor Portal</CardTitle>
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

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                loading={loginMutation.isPending}
              >
                Sign in as Doctor
              </Button>

              <div className="text-center mt-4 space-y-2">
                <p className="text-xs text-gray-500">
                  Patient? <a href="/patient-login" className="text-blue-600 hover:text-blue-700">Patient Portal</a>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}