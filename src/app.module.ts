import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

import { AppController } from './app.controller';
import { PrismaModule } from './common/prisma/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { PatientModule } from './modules/patient/patient.module';
import { DoctorModule } from './modules/doctor/doctor.module';

import { AppointmentModule } from './modules/appointment/appointment.module';
import { VitalsModule } from './modules/vitals/vitals.module';
import { NotificationModule } from './modules/notification/notification.module';
import { LoggingModule } from './modules/logging/logging.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { PrescriptionModule } from './modules/prescription/prescription.module';

const globalProviders = [
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
  { provide: APP_GUARD, useClass: ThrottlerGuard },
  { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
];

const coreModules = [
  ConfigModule.forRoot({ 
    isGlobal: true,
    validate,
    cache: true,
  }),
  PassportModule,
  JwtModule.register({
    global: true,
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '24h' },
  }),
  CacheModule.register({
    isGlobal: true,
    ttl: 300,
    max: 100,
  }),
  ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
  ScheduleModule.forRoot(),
  PrismaModule,
];

const featureModules = [
  AuthModule,
  PatientModule,
  DoctorModule,
  AppointmentModule,
  VitalsModule,
  NotificationModule,
  LoggingModule,
  IntegrationModule,
  WebSocketModule,
  PrescriptionModule,
];

@Module({
  controllers: [AppController],
  providers: globalProviders,
  imports: [...coreModules, ...featureModules],
})
export class AppModule {}