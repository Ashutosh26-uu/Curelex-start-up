import { Module } from '@nestjs/common';
import { HealthcareWebSocketGateway } from './websocket.gateway';

@Module({
  providers: [HealthcareWebSocketGateway],
  exports: [HealthcareWebSocketGateway],
})
export class WebSocketModule {}