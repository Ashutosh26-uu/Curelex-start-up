'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Stethoscope, Eye, EyeOff, Shield, AlertTriangle, UserCheck } from 'lucide-react';

interface DoctorLoginForm {
  email: string;
  password: string;
  captcha?: string;
  rememberMe?: boolean;
}

export default function DoctorLoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<DoctorLoginForm>({
    defaultValues: {
      email: '',
      password: '',
      captcha: '',
      rememberMe: false
    }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/doctor/dashboard');
    }
  }, [isAuthenticated, router]);

  // Handle lockout timer
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttemptCount(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  const loginMutation = useMutation({
    mutationFn: authApi.doctorLogin,
    onSuccess: (response) => {
      const { user, accessToken, refreshToken, sessionId } = response;
      setAuth(user, accessToken, refreshToken, sessionId);
      setError('');
      setAttemptCount(0);
      
      // Redirect based on response or user role
      const redirectUrl = response.redirectUrl || 
        (user.role === 'DOCTOR' ? '/doctor/dashboard' : '/junior-doctor/dashboard');
      router.push(redirectUrl);
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      // Show captcha after 3 attempts
      if (newAttemptCount >= 3) {
        setShowCaptcha(true);
      }
      
      // Lock after 5 attempts
      if (newAttemptCount >= 5) {
        setIsLocked(true);
        setLockoutTime(300); // 5 minutes
      }
      
      // Clear password field on error
      setValue('password', '');
      if (showCaptcha) {
        setValue('captcha', '');
      }
    },
  });

  const onSubmit = (data: DoctorLoginForm) => {
    if (isLocked) {
      setError(`Account temporarily locked. Try again in ${Math.ceil(lockoutTime / 60)} minutes.`);
      return;
    }
    
    setError('');
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="relative">
              <Stethoscope className="h-12 w-12 text-green-600" />
              <UserCheck className="h-6 w-6 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Medical Professional Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Secure access for doctors and medical staff
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>Secure Medical Login</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Input
                label="Professional Email"
                type="email"
                placeholder="doctor@hospital.com"
                autoComplete="email"
                {...register('email', { 
                  required: 'Professional email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid professional email address'
                  },
                  maxLength: {
                    value: 255,
                    message: 'Email must not exceed 255 characters'
                  }
                })}
                error={errors.email?.message}
                disabled={loginMutation.isPending || isLocked}
              />

              <div className="relative">
                <Input
                  label="Secure Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your secure password"
                  autoComplete="current-password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                    maxLength: {
                      value: 128,
                      message: 'Password must not exceed 128 characters'
                    }
                  })}
                  error={errors.password?.message}
                  disabled={loginMutation.isPending || isLocked}
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loginMutation.isPending || isLocked}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {showCaptcha && (
                <div className="space-y-2">
                  <Input
                    label="Security Verification"
                    type="text"
                    placeholder="Enter captcha"
                    {...register('captcha', {
                      required: showCaptcha ? 'Captcha is required' : false,
                      minLength: {
                        value: 4,
                        message: 'Captcha must be at least 4 characters'
                      }
                    })}
                    error={errors.captcha?.message}
                    disabled={loginMutation.isPending || isLocked}
                  />
                  <div className="flex items-center space-x-2 text-sm text-yellow-600">
                    <Shield size={16} />
                    <span>Enhanced security verification required</span>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  {...register('rememberMe')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  disabled={loginMutation.isPending || isLocked}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Keep me signed in on this device
                </label>
              </div>

              {isLocked && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center space-x-2">
                  <AlertTriangle size={20} />
                  <div>
                    <p className="font-medium">Account Temporarily Locked</p>
                    <p className="text-sm">Too many failed attempts. Try again in {Math.ceil(lockoutTime / 60)} minutes.</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500"
                loading={loginMutation.isPending}
                disabled={isLocked}
              >
                {loginMutation.isPending ? 'Authenticating...' : 'Access Medical Portal'}
              </Button>

              {attemptCount > 0 && attemptCount < 5 && (
                <div className="text-center text-sm text-yellow-600">
                  {5 - attemptCount} attempts remaining before temporary lockout
                </div>
              )}

              <div className="text-center mt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <a href="/auth/forgot-password" className="text-green-600 hover:text-green-700 font-medium">
                    Forgot your password?
                  </a>
                </p>
                <div className="border-t pt-2 mt-4">
                  <p className="text-xs text-gray-500">
                    Patient? <a href="/patient-login" className="text-blue-600 hover:text-blue-700">Patient Portal</a>
                  </p>
                  <p className="text-xs text-gray-500">
                    Other staff? <a href="/staff-login" className="text-purple-600 hover:text-purple-700">Staff Portal</a>
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Security Notice */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
            <Shield size={14} />
            <span>HIPAA compliant secure connection</span>
          </div>
        </div>
        
        {/* Professional Notice */}
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-400">
            This portal is restricted to licensed medical professionals only
          </p>
        </div>
      </div>
    </div>
  );
}