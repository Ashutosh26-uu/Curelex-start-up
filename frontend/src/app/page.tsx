'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { 
  Heart, 
  Shield, 
  Clock, 
  Users, 
  Calendar, 
  Activity,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (isAuthenticated && user) {
      switch (user.role) {
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
  }, [isAuthenticated, user, router]);

  const features = [
    {
      icon: Calendar,
      title: 'Easy Appointment Booking',
      description: 'Schedule appointments with your healthcare providers instantly'
    },
    {
      icon: Activity,
      title: 'Health Monitoring',
      description: 'Track your vitals and health metrics in real-time'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security protects your health information'
    },
    {
      icon: Clock,
      title: '24/7 Access',
      description: 'Access your health records and services anytime, anywhere'
    }
  ];

  const benefits = [
    'Secure patient portal with medical history',
    'Video consultations with healthcare providers',
    'Real-time health monitoring and alerts',
    'Prescription management and refills',
    'Appointment scheduling and reminders',
    'HIPAA compliant data protection'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">HealthCare Platform</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/patient-login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Patient Login
              </Link>
              <Link
                href="/doctor-login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Doctor Login
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-8">
            <Heart className="w-10 h-10 text-blue-600" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Health,{' '}
            <span className="text-blue-600">Our Priority</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience comprehensive healthcare management with our secure telemedicine platform. 
            Connect with healthcare providers, manage your health records, and monitor your wellness journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Create Patient Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/patient-login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In to Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with cutting-edge technology to provide the best healthcare experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Complete Healthcare Management
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our platform provides everything you need to manage your health effectively, 
                from booking appointments to tracking your wellness journey.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Link href="/register">
                  <Button size="lg">
                    Start Your Health Journey
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">10K+</div>
                    <div className="text-blue-100">Patients</div>
                  </div>
                  <div className="text-center">
                    <Shield className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-blue-100">Secure</div>
                  </div>
                  <div className="text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-blue-100">Available</div>
                  </div>
                  <div className="text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">Real-time</div>
                    <div className="text-blue-100">Monitoring</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of patients who trust our platform for their healthcare needs
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                Create Free Account
              </Button>
            </Link>
            <Link href="/patient-login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-gray-900">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Heart className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">HealthCare Platform</span>
            </div>
            
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900">Terms of Service</a>
              <a href="#" className="hover:text-gray-900">Contact Support</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            © 2024 HealthCare Platform. All rights reserved. HIPAA Compliant.
          </div>
        </div>
      </footer>
    </div>
  );
}