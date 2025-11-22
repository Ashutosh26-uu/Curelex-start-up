import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import * as redisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';

import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PatientModule } from './modules/patient/patient.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { OfficerModule } from './modules/officer/officer.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { VitalsModule } from './modules/vitals/vitals.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';
import { LoggingModule } from './modules/logging/logging.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { WebSocketModule } from './modules/websocket/websocket.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      ttl: 300,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    PatientModule,
    DoctorModule,
    OfficerModule,
    AppointmentModule,
    VitalsModule,
    NotificationModule,
    AdminModule,
    LoggingModule,
    IntegrationModule,
    WebSocketModule,
  ],
})
export class AppModule {}