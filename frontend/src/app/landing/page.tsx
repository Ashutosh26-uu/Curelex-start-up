'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Stethoscope, Users, Shield, Heart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">HealthCare Platform</span>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => window.location.href = '/patient-login'}>
                Patient Login
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/login'}>
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Your Health, Our Priority
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Complete healthcare management system with telemedicine, appointment scheduling, and comprehensive patient care.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => window.location.href = '/register'}
              >
                Register as Patient
              </Button>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => window.location.href = '/patient-login'}
              >
                Patient Login
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-primary-600 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Patient Care</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Comprehensive patient management with medical history tracking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 text-primary-600 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Telemedicine</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Virtual consultations with integrated Google Meet
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-primary-600 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Secure Platform</h3>
                <p className="mt-2 text-sm text-gray-500">
                  HIPAA compliant with role-based access control
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}