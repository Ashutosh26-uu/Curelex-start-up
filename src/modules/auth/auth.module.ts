import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SocialAuthService } from './services/social-auth.service';
import { UnifiedAuthService } from './services/unified-auth.service';
import { CaptchaService } from '../../common/services/captcha.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
    NotificationModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    SocialAuthService, 
    UnifiedAuthService, 
    CaptchaService, 
    JwtStrategy, 
    LocalStrategy,
    {
      provide: 'TokenBlacklistService',
      useValue: {
        isTokenBlacklisted: () => false,
        blacklistToken: () => Promise.resolve(),
      },
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}