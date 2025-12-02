import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { IntegrationModule } from '../integration/integration.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, IntegrationModule, NotificationModule],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}