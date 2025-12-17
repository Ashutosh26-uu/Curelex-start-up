import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('System')
@Controller()
export class AppController {
  private readonly APP_VERSION = '1.0.0';
  private readonly APP_NAME = 'Healthcare Telemedicine Platform API';

  private createBaseResponse() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: this.APP_VERSION,
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
      ...this.createBaseResponse(),
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

  @ApiOperation({ summary: 'Health check' })
  @Public()
  @Get('health')
  getHealthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Healthcare Telemedicine API'
    };
  }

  @ApiOperation({ summary: 'Health check with system status' })
  @Public()
  @Get('api/v1/health')
  getHealth() {
    const endpoints = this.getApiEndpoints();
    
    return {
      ...this.createBaseResponse(),
      message: `${this.APP_NAME} is running`,
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      endpoints,
    };
  }

  private getApiEndpoints() {
    const baseUrl = '/api/v1';
    const endpoints = [
      'auth', 'patients', 'doctors', 'appointments', 
      'vitals', 'prescriptions', 'notifications', 'integration'
    ];
    
    const endpointMap: Record<string, string> = {};
    endpoints.forEach(endpoint => {
      endpointMap[endpoint] = `${baseUrl}/${endpoint}`;
    });
    
    endpointMap.docs = '/api/docs';
    return endpointMap;
  }
}