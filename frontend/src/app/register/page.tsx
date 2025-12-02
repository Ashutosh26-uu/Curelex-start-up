'use client';

import { useState, useEffect } from 'react';
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
  firstName: string;
  middleName?: string;
  lastName: string;
  age: number;
  gender: string;
  mobile: string;
  email: string;
  emergencyContact: string;
  identificationNumber: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isPatientRegistration, setIsPatientRegistration] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  useEffect(() => {
    setIsPatientRegistration(window.location.search.includes('type=patient'));
  }, []);

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        ...data,
        name: `${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}`,
        medicalHistory: []
      };
      await api.post('/patients/register', payload);
      setSuccess(true);
      setTimeout(() => router.push('/patient-login'), 3000);
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
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            {isPatientRegistration ? 'Patient Registration' : 'User Registration'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isPatientRegistration ? 'Register as a patient to access healthcare services' : 'Join our healthcare platform - Made in India 🇮🇳'}
          </p>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="First Name *"
                  {...register('firstName', { required: 'First name is required' })}
                  error={errors.firstName?.message}
                />
                
                <Input
                  label="Middle Name (Optional)"
                  {...register('middleName')}
                  error={errors.middleName?.message}
                />
                
                <Input
                  label="Last Name *"
                  {...register('lastName', { required: 'Last name is required' })}
                  error={errors.lastName?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Age *"
                  type="number"
                  {...register('age', { 
                    required: 'Age is required',
                    min: { value: 1, message: 'Age must be positive' }
                  })}
                  error={errors.age?.message}
                />
                
                <Input
                  label="Identification Number (Aadhaar/Phone) *"
                  placeholder="Enter Aadhaar or Phone number"
                  {...register('identificationNumber', { 
                    required: 'Identification number is required',
                    minLength: { value: 10, message: 'Must be at least 10 digits' },
                    maxLength: { value: 12, message: 'Must not exceed 12 digits' }
                  })}
                  error={errors.identificationNumber?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Gender *"
                  options={[
                    { value: '', label: 'Select Gender' },
                    { value: 'MALE', label: 'Male' },
                    { value: 'FEMALE', label: 'Female' },
                    { value: 'OTHER', label: 'Other' }
                  ]}
                  {...register('gender', { required: 'Gender is required' })}
                  error={errors.gender?.message}
                />

                <div>
                  <label className="text-sm font-medium text-gray-700">Mobile Number *</label>
                  <div className="flex mt-1">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      className="flex-1 rounded-r-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter 10-digit mobile number"
                      {...register('mobile', { 
                        required: 'Mobile number is required',
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Mobile number must be exactly 10 digits'
                        }
                      })}
                    />
                  </div>
                  {errors.mobile && (
                    <p className="text-sm text-red-600 mt-1">{errors.mobile.message}</p>
                  )}
                </div>
              </div>

              <Input
                label="Email *"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                })}
                error={errors.email?.message}
              />

              <Input
                label="Emergency Contact *"
                placeholder="Emergency contact number"
                {...register('emergencyContact', { required: 'Emergency contact is required' })}
                error={errors.emergencyContact?.message}
              />



              <Button type="submit" className="w-full" loading={loading}>
                {isPatientRegistration ? 'Register as Patient' : 'Register'}
              </Button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <a 
                    href={isPatientRegistration ? "/patient-login" : "/login"} 
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Sign in here
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