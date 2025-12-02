import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class HealthcareWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // socketId -> userId

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, payload: { userId: string }) {
    this.connectedUsers.set(client.id, payload.userId);
    client.join(`user_${payload.userId}`);
    console.log(`User ${payload.userId} joined`);
  }

  // Send notification to specific user
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }

  // Send appointment reminder
  sendAppointmentReminder(userId: string, appointment: any) {
    this.server.to(`user_${userId}`).emit('appointment_reminder', appointment);
  }

  // Send vital alert
  sendVitalAlert(userId: string, alert: any) {
    this.server.to(`user_${userId}`).emit('vital_alert', alert);
  }

  // Broadcast system message
  broadcastSystemMessage(message: any) {
    this.server.emit('system_message', message);
  }
}