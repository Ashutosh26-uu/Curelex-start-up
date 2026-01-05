'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth';
import { Eye, EyeOff, Mail, Phone, Lock, AlertCircle, User, Building2 } from 'lucide-react';
import Image from 'next/image';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    email: '',
    role: 'PATIENT'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { login } = useAuthStore();

  const isEmail = formData.identifier.includes('@');
  const isValidIdentifier = isEmail ? 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier) : 
    /^[6-9]\d{9}$/.test(formData.identifier.replace(/\D/g, ''));

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = activeTab === 'patient' ? 
        (mode === 'login' ? '/api/v1/auth/login/patient' : '/api/v1/auth/register/patient') :
        '/api/v1/auth/login/doctor';

      let requestData;
      
      if (mode === 'login') {
        if (activeTab === 'patient') {
          requestData = isEmail ? 
            { email: formData.identifier, password: formData.password } :
            { phone: `+91${formData.identifier.replace(/\D/g, '')}`, password: formData.password };
        } else {
          requestData = { email: formData.identifier, password: formData.password };
        }
      } else {
        const [firstName, ...lastNameParts] = formData.fullName.split(' ');
        requestData = {
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ''),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName,
          lastName: lastNameParts.join(' ') || ''
        };
      }

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        if (mode === 'signup') {
          setMode('login');
          setError('');
          setFormData({
            identifier: '',
            password: '',
            confirmPassword: '',
            fullName: '',
            phone: '',
            email: '',
            role: 'PATIENT'
          });
          alert('Registration successful! Please login.');
        } else {
          login(data.user, data.accessToken, data.refreshToken);
          
          switch (data.user.role) {
            case 'PATIENT':
              router.push('/patient');
              break;
            case 'DOCTOR':
            case 'JUNIOR_DOCTOR':
              router.push('/doctor');
              break;
            default:
              router.push('/dashboard');
          }
        }
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto p-8 space-y-6 bg-white shadow-2xl border-0">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Image
              src="/images/crelex.jpg"
              alt="CureLex Logo"
              width={60}
              height={60}
              className="w-15 h-15 rounded-xl"
              priority={false}
              loading="lazy"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to CureLex</h1>
            <p className="text-gray-600 text-sm mt-1">
              {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>
        </div>

        {/* User Type Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setActiveTab('patient')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'patient'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            Patient
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('doctor')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'doctor'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Doctor
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'login' ? (
            <>
              {/* Login Form */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 block">
                  {activeTab === 'patient' ? 'Email or Phone Number' : 'Email Address'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isEmail || activeTab === 'doctor' ? (
                      <Mail className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Phone className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <Input
                    type="text"
                    value={formData.identifier}
                    onChange={(e) => handleInputChange('identifier', e.target.value)}
                    placeholder={activeTab === 'patient' ? 'Enter email or phone' : 'Enter email address'}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 block">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-12 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-md"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Signup Form */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 block">Full Name</label>
                <Input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 block">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 block">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md h-12">
                    +91
                  </span>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleInputChange('phone', value);
                    }}
                    placeholder="Enter 10-digit mobile number"
                    className="rounded-l-none h-12"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 block">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a password (min 8 characters)"
                    className="pl-10 pr-12 h-12"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-md"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 block">Confirm Password</label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className="h-12"
                  required
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-600 to-orange-500 hover:from-teal-700 hover:to-orange-600 text-white font-medium py-3 h-12 rounded-lg transition-all duration-200 disabled:opacity-50 mt-6 shadow-lg"
            disabled={loading || (mode === 'login' && !isValidIdentifier)}
          >
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        {/* Mode Switch */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
              setFormData({
                identifier: '',
                password: '',
                confirmPassword: '',
                fullName: '',
                phone: '',
                email: '',
                role: 'PATIENT'
              });
            }}
            className="text-sm text-teal-600 hover:text-orange-500 font-medium transition-colors"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
          <p>Secure • HIPAA Compliant • Trusted Healthcare Platform</p>
        </div>
      </Card>
    </div>
  );
}