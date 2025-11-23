import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebSocketGatewayService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  emitNewPatientRegistered(patientData: any) {
    this.server.emit('new-patient-registered', patientData);
  }

  broadcastAppointmentScheduled(data: any) {
    this.server.emit('appointment:scheduled', data);
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(userId).emit(event, data);
  }

  broadcastVitalsUpdate(data: any) {
    this.server.emit('vitals:updated', data);
  }

  broadcastCriticalAlert(data: any) {
    this.server.emit('critical:alert', data);
  }

  broadcastNewPatientRegistration(data: any) {
    this.server.emit('patient:registered', data);
  }
}