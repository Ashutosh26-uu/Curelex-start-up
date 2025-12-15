import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('System')
@Controller()
export class AppController {
  private readonly version = '1.0.0';
  private readonly appName = 'Healthcare Telemedicine Platform API';

  private getBaseResponse() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: this.version,
    };
  }

  @ApiOperation({ summary: 'Curelex HealthTech - Landing Page' })
  @Public()
  @Get()
  getRoot() {
    return {
      company: 'Curelex HealthTech',
      tagline: 'Advanced Healthcare Solutions',
      message: 'Welcome to Curelex HealthTech - Your Digital Healthcare Partner',
      ...this.getBaseResponse(),
      portals: {
        patient: '/patient-portal',
        doctor: '/doctor-portal'
      },
      pages: {
        about: '/about',
        services: '/services',
        contact: '/contact'
      },
      docs: '/api/docs'
    };
  }

  @ApiOperation({ summary: 'About Curelex HealthTech' })
  @Public()
  @Get('about')
  getAbout() {
    return {
      company: 'Curelex HealthTech',
      founded: '2024',
      mission: 'Revolutionizing healthcare through technology',
      vision: 'Accessible healthcare for everyone, everywhere',
      services: [
        'Telemedicine Consultations',
        'Digital Health Records',
        'Appointment Scheduling',
        'Prescription Management',
        'Health Monitoring'
      ],
      team: {
        doctors: '50+ Certified Doctors',
        specialists: '15+ Specializations',
        support: '24/7 Medical Support'
      }
    };
  }

  @ApiOperation({ summary: 'Healthcare Services' })
  @Public()
  @Get('services')
  getServices() {
    return {
      services: [
        {
          name: 'Virtual Consultations',
          description: 'Connect with certified doctors via video calls',
          features: ['Google Meet Integration', 'Secure & Private', 'Instant Access']
        },
        {
          name: 'Health Monitoring',
          description: 'Track vitals and health metrics',
          features: ['BP Monitoring', 'Heart Rate', 'Oxygen Levels', 'Blood Sugar']
        },
        {
          name: 'Digital Prescriptions',
          description: 'Get digital prescriptions from doctors',
          features: ['Instant Delivery', 'Pharmacy Integration', 'Refill Reminders']
        },
        {
          name: 'Medical Records',
          description: 'Secure digital health records',
          features: ['Cloud Storage', 'Easy Access', 'History Tracking']
        }
      ]
    };
  }

  @ApiOperation({ summary: 'Contact Information' })
  @Public()
  @Get('contact')
  getContact() {
    return {
      contact: {
        email: 'info@curelexhealthtech.com',
        phone: '+91-9999-888-777',
        address: 'Curelex HealthTech Pvt Ltd, Tech Park, India',
        support: 'support@curelexhealthtech.com',
        emergency: '+91-9999-000-111'
      },
      hours: {
        consultation: '24/7 Available',
        support: 'Mon-Sun: 8:00 AM - 10:00 PM',
        emergency: '24/7 Emergency Support'
      }
    };
  }

  @ApiOperation({ summary: 'Health check with system status' })
  @Public()
  @Get('api/v1/health')
  getHealth() {
    return {
      ...this.getBaseResponse(),
      message: `${this.appName} is running`,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        auth: '/api/v1/auth',
        patients: '/api/v1/patients',
        doctors: '/api/v1/doctors',
        appointments: '/api/v1/appointments',
        vitals: '/api/v1/vitals',
        prescriptions: '/api/v1/prescriptions',
        notifications: '/api/v1/notifications',
        integration: '/api/v1/integration',
        docs: '/api/docs',
      },
    };
  }
}