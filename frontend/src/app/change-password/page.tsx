'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import AuthGuard from '@/components/guards/AuthGuard';
import { ArrowLeft, Key } from 'lucide-react';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ChangePasswordForm>();
  const newPassword = watch('newPassword');

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      authApi.changePassword(data),
    onSuccess: () => {
      setSuccess('Password changed successfully!');
      setError('');
      setTimeout(() => {
        router.back();
      }, 2000);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to change password');
      setSuccess('');
    },
  });

  const onSubmit = (data: ChangePasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setError('');
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <Key className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Change Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Update your account password
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}

                <PasswordInput
                  label="Current Password"
                  {...register('currentPassword', { 
                    required: 'Current password is required'
                  })}
                  error={errors.currentPassword?.message}
                />

                <PasswordInput
                  label="New Password"
                  {...register('newPassword', { 
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  error={errors.newPassword?.message}
                />

                <PasswordInput
                  label="Confirm New Password"
                  {...register('confirmPassword', { 
                    required: 'Please confirm your new password',
                    validate: (value) => 
                      value === newPassword || 'Passwords do not match'
                  })}
                  error={errors.confirmPassword?.message}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    loading={changePasswordMutation.isPending}
                  >
                    Change Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}