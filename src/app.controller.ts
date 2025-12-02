import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  @ApiOperation({ summary: 'API health check' })
  @Get()
  getHealth() {
    return {
      status: 'ok',
      message: 'Healthcare Telemedicine Platform API is running',
      timestamp: new Date().toISOString(),
    };
  }

  @ApiOperation({ summary: 'Detailed health check' })
  @Get('health')
  getHealthCheck() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @ApiOperation({ summary: 'API status and endpoints' })
  @Get('status')
  getStatus() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      endpoints: {
        auth: '/api/v1/auth',
        patients: '/api/v1/patients',
        doctors: '/api/v1/doctors',
        appointments: '/api/v1/appointments',
        vitals: '/api/v1/vitals',
        prescriptions: '/api/v1/prescriptions',
        notifications: '/api/v1/notifications',
        officer: '/api/v1/officer',
        admin: '/api/v1/admin',
        integration: '/api/v1/integration',
        docs: '/api/docs',
      },
    };
  }
}