import { Module } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { AuditInterceptor } from './audit.interceptor';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LoggingService, AuditInterceptor],
  exports: [LoggingService, AuditInterceptor],
})
export class LoggingModule {}