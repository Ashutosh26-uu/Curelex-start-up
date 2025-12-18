'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import Image from 'next/image';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative">
      {/* Background Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <Image
          src="/images/crelex.jpg"
          alt="CureLex Background"
          width={600}
          height={600}
          className="opacity-10 grayscale"
        />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/images/crelex.jpg"
                alt="CureLex Logo"
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900">CureLex</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/auth?role=patient"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Patient Login
              </Link>
              <Link
                href="/auth?role=doctor"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Doctor Login
              </Link>
              <Link href="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center mb-8">
            <Image
              src="/images/crelex.jpg"
              alt="CureLex Logo"
              width={80}
              height={80}
              className="w-20 h-20 rounded-xl"
            />
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
            <Link href="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In
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

      {/* About Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About CureLex
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              Curelex is a next-generation hybrid e-clinic model designed to bring super-speciality healthcare, telemedicine, diagnostics, pathology, and pharmacy support to rural and semi-urban communities — without performing any invasive procedures. We provide pure OPD-based services focused on accurate consultation and timely treatment.
            </p>
            
            <p>
              At Curelex, patients visit their nearest e-clinic where a qualified junior doctor performs physical examination, checks vitals, and documents medical history. During the same visit, the patient is connected to a super-specialist through secure telemedicine, ensuring expert diagnosis without travelling to big cities.
            </p>
            
            <p>
              Curelex centres follow a zero-invasive care model (only OPD). For complete clinical support, we have partnerships with pathology/laboratory service providers for sample collection and reporting, nearby pharmacies for quick access to prescribed medicines, and hospitals for referral and admission only when required.
            </p>
            
            <p>
              This ensures that every patient gets the right doctor, right diagnosis, and right treatment at the right time, while maintaining full safety, transparency, and affordability.
            </p>
            
            <p className="text-center font-semibold text-blue-600 text-xl">
              We believe that quality healthcare should reach everyone, not just metropolitan cities. Curelex is committed to bridging the gap between rural and urban healthcare by combining modern telemedicine with physical doctor support for trustworthy, personalised care.
            </p>
            
            <p className="text-center text-2xl font-bold text-gray-900 mt-8">
              Curelex — Telemedicine that feels like offline care.
            </p>
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
            <Link href="/auth">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                Create Your Account
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-gray-900">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/crelex.jpg"
                  alt="CureLex Logo"
                  width={50}
                  height={50}
                  className="w-12 h-12 bg-white rounded-lg p-1"
                />
                <span className="text-xl font-bold">CureLex</span>
              </div>
              <p className="text-gray-300 text-sm">
                Telemedicine that feels like offline care. Bringing super-speciality healthcare to rural communities.
              </p>
            </div>



            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Us</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>📞 +91 89578 09085</p>
                <p>📍 C/o Shiv Kumari Devi, Muhmmadpur Pachewara, Pachevara, Mirzapur, Chunar, Uttar Pradesh, India, 231305</p>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Follow Us</h3>
              <div className="grid grid-cols-2 gap-3">
                <a href="https://www.instagram.com/curelexofficial?igsh=MWNobGQzMHdhdTRpNg==" target="_blank" className="flex items-center gap-2 text-gray-300 hover:text-pink-400 transition-colors">
                  <span className="text-lg">📷</span> Instagram
                </a>
                <a href="https://www.youtube.com/@CurelexOfficial" target="_blank" className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition-colors">
                  <span className="text-lg">📺</span> YouTube
                </a>
                <a href="https://whatsapp.com/channel/0029Vb6h5rD90x2oWxVpiF1N" target="_blank" className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors">
                  <span className="text-lg">💬</span> WhatsApp
                </a>
                <a href="#" className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors">
                  <span className="text-lg">📘</span> Facebook
                </a>
                <a href="#" className="flex items-center gap-2 text-gray-300 hover:text-blue-300 transition-colors">
                  <span className="text-lg">🐦</span> Twitter
                </a>
                <a href="#" className="flex items-center gap-2 text-gray-300 hover:text-blue-500 transition-colors">
                  <span className="text-lg">💼</span> LinkedIn
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            © 2024 CureLex Healthcare Platform. All rights reserved. HIPAA Compliant.
          </div>
        </div>
      </footer>
    </div>
  );
}