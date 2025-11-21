import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { IntegrationModule } from '../integration/integration.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [IntegrationModule, WebSocketModule],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}