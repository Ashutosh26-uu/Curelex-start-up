import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { TokenBlacklistService } from '../../common/services/token-blacklist.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private prisma = new PrismaClient();

  constructor(
    private configService: ConfigService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Check if token is blacklisted
    if (payload.jti && await this.tokenBlacklistService.isTokenBlacklisted(payload.jti)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        profile: true,
        patient: true,
        doctor: true,
        officer: true,
      },
    });

    if (!user || !user.isActive || user.isDeleted) {
      throw new UnauthorizedException('User not found or inactive');
    }

    if (user.isLocked) {
      throw new UnauthorizedException('Account is locked');
    }

    // Check if session is still valid
    if (payload.sessionId && user.sessionId !== payload.sessionId) {
      throw new UnauthorizedException('Session expired');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      sessionId: payload.sessionId,
      jti: payload.jti,
      profile: user.profile,
      patient: user.patient,
      doctor: user.doctor,
      officer: user.officer,
    };
  }
}