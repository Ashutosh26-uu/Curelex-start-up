'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
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
  const { setAuth: login } = useAuthStore();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response;
      login(user, accessToken, refreshToken);
      
      // Redirect based on user role
      switch (user.role) {
        case 'PATIENT':
          router.push('/patient');
          break;
        case 'DOCTOR':
        case 'JUNIOR_DOCTOR':
          router.push('/doctor');
          break;
        case 'CEO':
        case 'CTO':
        case 'CFO':
        case 'CMO':
          router.push('/officer');
          break;
        case 'ADMIN':
          router.push('/admin');
          break;
        case 'NURSE':
          router.push('/vitals');
          break;
        default:
          router.push('/home');
      }
    },
    onError: (error: any) => {
      setError(error.message || 'Login failed');
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
            <p className="text-xs text-blue-800 font-medium mb-1">Login Credentials:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <div><strong>Admin:</strong> ashutosh@curelex.com / admin@123</div>
              <div><strong>Doctor:</strong> doctor@healthcare.com / doctor123</div>
              <div><strong>Patient:</strong> patient@healthcare.com / patient123</div>
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

              <PasswordInput
                label="Password"
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
                Sign in
              </Button>

              <div className="text-center mt-4 space-y-3">
                <p className="text-sm text-gray-600">
                  New patient?{' '}
                  <a href="/register?type=patient" className="text-primary-600 hover:text-primary-700 font-medium">
                    Register here
                  </a>
                </p>
                
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2">Or use specific portals:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="/patient-login"
                      className="text-xs bg-blue-50 text-blue-600 py-2 px-3 rounded text-center hover:bg-blue-100"
                    >
                      Patient Portal
                    </a>
                    <a
                      href="/staff-login"
                      className="text-xs bg-green-50 text-green-600 py-2 px-3 rounded text-center hover:bg-green-100"
                    >
                      Staff Portal
                    </a>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}