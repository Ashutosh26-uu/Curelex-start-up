import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SocialAuthService } from './services/social-auth.service';
import { UnifiedAuthService } from './services/unified-auth.service';
import { CaptchaService } from '../../common/services/captcha.service';
import { TokenBlacklistService } from '../../common/services/token-blacklist.service';
import { AuthValidationService } from '../../common/services/auth-validation.service';
import { BusinessLogicService } from '../../common/services/business-logic.service';
import { ServiceRegistry } from '../../common/services/service-registry.service';
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
      useFactory: async (configService: ConfigService, jwtConfigService: JwtConfigService) => {
        const config = jwtConfigService.getJwtConfig();
        return {
          secret: config.secret,
          signOptions: {
            expiresIn: config.expiresIn,
            algorithm: 'HS256',
          },
        };
      },
      inject: [ConfigService, JwtConfigService],
    }),
    NotificationModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    SocialAuthService, 
    UnifiedAuthService, 
    CaptchaService, 
    TokenBlacklistService,
    JwtConfigService,
    AuthValidationService,
    ErrorHandlingService,
    BusinessLogicService,
    ServiceRegistry,
    JwtStrategy, 
    LocalStrategy,
  ],
  exports: [AuthService, TokenBlacklistService],
})
export class AuthModule {}