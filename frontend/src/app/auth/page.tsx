'use client';

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth';
import { Eye, EyeOff, Mail, Phone, User, Lock, Heart, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [experience, setExperience] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  // Generate unique IDs for accessibility
  const formId = useId();
  const errorId = useId();
  const identifierId = useId();
  const passwordId = useId();
  
  const router = useRouter();
  const { login } = useAuthStore();

  const isEmail = identifier.includes('@');
  const isValidIdentifier = isEmail ? 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) : 
    /^\+91[6-9]\d{9}$/.test(identifier);
  
  const isValidPhone = /^[6-9]\d{9}$/.test(phone);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (mode === 'signup') {
      if (!fullName.trim()) errors.fullName = 'Full name is required';
      if (!isValidPhone) errors.phone = 'Valid 10-digit phone number required';
      if (!email.includes('@')) errors.email = 'Valid email address required';
      if (!dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
      if (!gender) errors.gender = 'Gender selection is required';
      if (!address.trim()) errors.address = 'Address is required';
      if (!emergencyContact || emergencyContact.length !== 10) errors.emergencyContact = 'Valid emergency contact required';
      if (!aadharNumber || aadharNumber.length !== 12) errors.aadharNumber = 'Valid 12-digit Aadhar number required';
    }
    
    if (!password || password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (mode === 'login' && !isValidIdentifier) errors.identifier = 'Valid email or phone number required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkUserExists = async () => {
    if (!isValidIdentifier) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      
      const data = await response.json();
      setUserExists(data.exists);
      
      if (data.exists) {
        setMode('login');
      } else {
        setMode('signup');
      }
    } catch (error) {
      setError('Unable to verify user. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: mode === 'signup' ? `+91${phone}` : identifier,
          password,
          fullName: mode === 'signup' ? fullName : undefined,
          role: mode === 'signup' ? role : undefined,
          action: mode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
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
      } else {
        setError(data.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">
      {/* Background Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0" aria-hidden="true">
        <Image
          src="/images/crelex.jpg"
          alt=""
          width={400}
          height={400}
          className="opacity-15 grayscale"
        />
      </div>

      <Card className="w-full max-w-md p-8 space-y-6 relative z-10 bg-white/95 backdrop-blur-sm shadow-xl">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <Image
              src="/images/crelex.jpg"
              alt="CureLex Healthcare Platform Logo"
              width={48}
              height={48}
              className="w-12 h-12 rounded-lg"
              priority
            />
            <h1 className="text-2xl font-bold text-gray-900">CureLex</h1>
          </div>
          <p className="text-gray-700 text-base">
            {mode === 'login' ? 'Welcome back to your healthcare dashboard' : 'Join our secure healthcare community'}
          </p>
        </header>

        {error && (
          <div 
            id={errorId}
            role="alert"
            aria-live="polite"
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-start gap-2"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form 
          id={formId}
          onSubmit={handleSubmit} 
          className="space-y-4"
          aria-describedby={error ? errorId : undefined}
          noValidate
        >
          <div className="space-y-2">
            <label 
              htmlFor={identifierId}
              className="text-sm font-medium text-gray-900 block"
            >
              Email or Phone Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isEmail ? (
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                ) : (
                  <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
                )}
              </div>
              <Input
                id={identifierId}
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onBlur={checkUserExists}
                placeholder="Enter email or phone number"
                className="pl-10"
                aria-required="true"
                aria-invalid={validationErrors.identifier ? 'true' : 'false'}
                aria-describedby={validationErrors.identifier ? `${identifierId}-error` : undefined}
                autoComplete={isEmail ? 'email' : 'tel'}
                required
              />
            </div>
            {validationErrors.identifier && (
              <p id={`${identifierId}-error`} className="text-xs text-red-600" role="alert">
                {validationErrors.identifier}
              </p>
            )}
            {userExists !== null && (
              <p 
                className={`text-xs ${userExists ? 'text-green-700' : 'text-blue-700'}`}
                aria-live="polite"
              >
                {userExists ? 'Account found - please login' : 'New user - please sign up'}
              </p>
            )}
          </div>

          {mode === 'signup' && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-900 block">
                  Full Name *
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  aria-required="true"
                  aria-invalid={validationErrors.fullName ? 'true' : 'false'}
                  aria-describedby={validationErrors.fullName ? 'fullName-error' : undefined}
                  autoComplete="name"
                  required
                />
                {validationErrors.fullName && (
                  <p id="fullName-error" className="text-xs text-red-600" role="alert">
                    {validationErrors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-900 block">
                  Phone Number *
                </label>
                <div className="flex">
                  <span 
                    className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md"
                    aria-label="Country code India"
                  >
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(value);
                    }}
                    placeholder="Enter 10-digit mobile number"
                    className="rounded-l-none"
                    aria-required="true"
                    aria-invalid={validationErrors.phone || (phone && !isValidPhone) ? 'true' : 'false'}
                    aria-describedby={validationErrors.phone || (phone && !isValidPhone) ? 'phone-error' : undefined}
                    autoComplete="tel"
                    maxLength={10}
                    required
                  />
                </div>
                {(validationErrors.phone || (phone && !isValidPhone)) && (
                  <p id="phone-error" className="text-xs text-red-600" role="alert">
                    {validationErrors.phone || 'Please enter a valid 10-digit mobile number'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-900 block">
                  Email Address *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-required="true"
                  aria-invalid={validationErrors.email ? 'true' : 'false'}
                  aria-describedby={validationErrors.email ? 'email-error' : undefined}
                  autoComplete="email"
                  required
                />
                {validationErrors.email && (
                  <p id="email-error" className="text-xs text-red-600" role="alert">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date of Birth *</label>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="gender" className="text-sm font-medium text-gray-900 block">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    aria-required="true"
                    aria-invalid={validationErrors.gender ? 'true' : 'false'}
                    aria-describedby={validationErrors.gender ? 'gender-error' : undefined}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {validationErrors.gender && (
                    <p id="gender-error" className="text-xs text-red-600" role="alert">
                      {validationErrors.gender}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Address *</label>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your complete address"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Emergency Contact *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">+91</span>
                  <Input
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setEmergencyContact(value);
                    }}
                    placeholder="Emergency contact number"
                    className="rounded-l-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Aadhar Number *</label>
                <Input
                  type="text"
                  value={aadharNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                    setAadharNumber(value);
                  }}
                  placeholder="Enter 12-digit Aadhar number"
                  required
                />
              </div>

              {(role === 'DOCTOR' || role === 'JUNIOR_DOCTOR') && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Specialization *</label>
                    <Input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="Enter your specialization"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Experience (Years) *</label>
                    <Input
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="Years of experience"
                      min="0"
                      max="50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">License Number *</label>
                    <Input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="Enter your medical license number"
                      required
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor={passwordId} className="text-sm font-medium text-gray-900 block">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <Input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? 'Enter password' : 'Create password (min 8 characters)'}
                className="pl-10 pr-12"
                aria-required="true"
                aria-invalid={validationErrors.password ? 'true' : 'false'}
                aria-describedby={validationErrors.password ? `${passwordId}-error` : mode === 'signup' ? `${passwordId}-help` : undefined}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                )}
              </button>
            </div>
            {mode === 'signup' && !validationErrors.password && (
              <p id={`${passwordId}-help`} className="text-xs text-gray-600">
                Password must be at least 8 characters long
              </p>
            )}
            {validationErrors.password && (
              <p id={`${passwordId}-error`} className="text-xs text-red-600" role="alert">
                {validationErrors.password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className={`w-full min-h-[44px] text-base font-medium focus:ring-4 focus:ring-offset-2 ${mode === 'login' ? 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-300' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={loading}
            aria-describedby={loading ? 'loading-status' : undefined}
          >
            {loading ? (
              <>
                <span className="sr-only">Processing your request</span>
                <span aria-hidden="true">Please wait...</span>
              </>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Your Account'
            )}
          </Button>
          {loading && (
            <div id="loading-status" className="sr-only" aria-live="polite">
              Processing your {mode === 'login' ? 'login' : 'registration'} request
            </div>
          )}
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
              setValidationErrors({});
            }}
            className="text-sm text-blue-600 hover:text-blue-500 underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded px-2 py-1"
            aria-describedby="mode-switch-help"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
          <div id="mode-switch-help" className="sr-only">
            Switch between login and registration forms
          </div>
        </div>
      </Card>
    </div>
  );
}