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
import { ErrorHandlingService } from './common/services/error-handling.service';
import { validateConstants } from './common/constants/app.constants';

import { AppController } from './app.controller';
import { PrismaModule } from './common/prisma/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { CsrfGuard } from './common/guards/csrf.guard';

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
import { DatabaseModule } from './common/database/database.module';

const globalProviders = [
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
  { provide: APP_GUARD, useClass: CsrfGuard },
  { provide: APP_GUARD, useClass: ThrottlerGuard },
  { 
    provide: APP_FILTER, 
    useFactory: (errorHandlingService: ErrorHandlingService) => new GlobalExceptionFilter(errorHandlingService),
    inject: [ErrorHandlingService]
  },
  { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ErrorHandlingService,
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
          const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET');
          
          if (!secret || !refreshSecret) {
            throw new Error('JWT_SECRET and JWT_REFRESH_SECRET are required');
          }
          
          if (process.env.NODE_ENV === 'production') {
            if (secret.length < 32 || refreshSecret.length < 32) {
              throw new Error('JWT secrets must be at least 32 characters in production');
            }
            if (secret === refreshSecret) {
              throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
            }
          }
          
          return {
            secret,
            signOptions: { 
              expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
              algorithm: 'HS256',
              issuer: 'healthcare-platform',
              audience: 'healthcare-users',
            },
          };
        },
        inject: [ConfigService],
      }),
      CacheModule.register({
        isGlobal: true,
        ttl: 300000,
        max: 1000,
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
  DatabaseModule,
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