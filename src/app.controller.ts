import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Healthcare Telemedicine Platform',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  @ApiResponse({ status: 200, description: 'Welcome message' })
  getRoot() {
    return {
      message: 'Welcome to Healthcare Telemedicine Platform API',
      version: '1.0.0',
      documentation: '/api/docs',
      health: '/health',
    };
  }
}