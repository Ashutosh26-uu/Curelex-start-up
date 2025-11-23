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
import { Shield } from 'lucide-react';

interface StaffLoginForm {
  email: string;
  password: string;
}

export default function StaffLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<StaffLoginForm>();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const { user, access_token } = response.data;
      if (user.role === 'PATIENT') {
        setError('This login is for healthcare staff only. Please use patient login.');
        return;
      }
      login(user, access_token);
      router.push('/');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Login failed');
    },
  });

  const onSubmit = (data: StaffLoginForm) => {
    setError('');
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Staff Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Healthcare Staff Access Portal
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Input
                label="Staff Email"
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
                className="w-full"
                loading={loginMutation.isPending}
              >
                Sign in as Staff
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Patient?{' '}
                  <a href="/patient-login" className="text-primary-600 hover:text-primary-700 font-medium">
                    Patient Login
                  </a>
                </p>
              </div>
            </form>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-1">Demo Staff Credentials:</p>
              <div className="text-xs text-blue-700 space-y-1">
                <div>Admin: admin@healthcare.com / admin123</div>
                <div>Doctor: doctor@healthcare.com / doctor123</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}