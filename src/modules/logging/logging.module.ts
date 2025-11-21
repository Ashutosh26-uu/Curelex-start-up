import { Module } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { AuditInterceptor } from './audit.interceptor';

@Module({
  providers: [LoggingService, AuditInterceptor],
  exports: [LoggingService, AuditInterceptor],
})
export class LoggingModule {}