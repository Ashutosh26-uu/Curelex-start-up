import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  @Public()
  async healthCheck() {
    const dbHealthy = await this.databaseService.healthCheck();
    const connectionInfo = dbHealthy ? await this.databaseService.getConnectionInfo() : null;

    return {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbHealthy,
        info: connectionInfo,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  @Get('db')
  @Public()
  async databaseHealth() {
    const isHealthy = await this.databaseService.healthCheck();
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: isHealthy ? await this.databaseService.getConnectionInfo() : null,
    };
  }
}