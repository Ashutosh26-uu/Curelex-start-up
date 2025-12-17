import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { validateConstants } from './common/constants/app.constants';

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

const createCoreModules = () => {
  try {
    // Validate environment constants
    validateConstants();
    
    return [
      ConfigModule.forRoot({ 
        isGlobal: true,
        validate,
        cache: true,
        validationOptions: {
          allowUnknown: false,
          abortEarly: true,
        },
      }),
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.registerAsync({
        global: true,
        useFactory: (configService: ConfigService) => {
          const secret = configService.get<string>('JWT_SECRET');
          if (!secret) {
            throw new Error('JWT_SECRET is required');
          }
          return {
            secret,
            signOptions: { 
              expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
              algorithm: 'HS256',
            },
          };
        },
        inject: [ConfigService],
      }),
      CacheModule.registerAsync({
        isGlobal: true,
        useFactory: (configService: ConfigService) => ({
          ttl: configService.get<number>('CACHE_TTL', 300),
          max: configService.get<number>('CACHE_MAX_ITEMS', 100),
        }),
        inject: [ConfigService],
      }),
      ThrottlerModule.forRootAsync({
        useFactory: (configService: ConfigService) => [{
          ttl: configService.get<number>('RATE_LIMIT_TTL', 60000),
          limit: configService.get<number>('RATE_LIMIT_MAX', 100),
        }],
        inject: [ConfigService],
      }),
      ScheduleModule.forRoot(),
      PrismaModule,
    ];
  } catch (error) {
    Logger.error('Failed to initialize core modules', error.message, 'AppModule');
    throw error;
  }
};

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
  imports: [...createCoreModules(), ...featureModules],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  onModuleInit() {
    try {
      this.logger.log('Healthcare Telemedicine Platform initialized successfully');
      this.logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      this.logger.log(`API Version: ${process.env.API_VERSION || 'v1'}`);
    } catch (error) {
      this.logger.error('Module initialization failed', error.message);
      throw error;
    }
  }
}