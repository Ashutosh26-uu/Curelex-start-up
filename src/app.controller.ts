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

  @ApiOperation({ summary: 'API root information' })
  @Public()
  @Get()
  getRoot() {
    return {
      message: this.appName,
      ...this.getBaseResponse(),
      docs: '/api/docs',
      health: '/api/v1/health',
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
        officer: '/api/v1/officer',
        admin: '/api/v1/admin',
        integration: '/api/v1/integration',
        docs: '/api/docs',
      },
    };
  }
}