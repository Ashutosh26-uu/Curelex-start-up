import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { TokenBlacklistService } from '../../common/services/token-blacklist.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
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

    // Check token version
    if (payload.ver && user.refreshTokenVersion > payload.ver) {
      throw new UnauthorizedException('Token version mismatch');
    }

    // Check session validity
    if (payload.sessionId && user.sessionId !== payload.sessionId) {
      throw new UnauthorizedException('Session expired');
    }

    // Device fingerprint validation
    if (payload.dev && user.deviceFingerprint) {
      const currentFingerprint = this.generateDeviceFingerprint(req);
      const expectedFingerprint = crypto.createHash('sha256').update(currentFingerprint).digest('hex').substring(0, 16);
      if (payload.dev !== expectedFingerprint) {
        throw new UnauthorizedException('Device mismatch detected');
      }
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      sessionId: payload.sessionId,
      jti: payload.jti,
      tokenVersion: payload.ver,
      profile: user.profile,
      patient: user.patient,
      doctor: user.doctor,
      officer: user.officer,
    };
  }

  private generateDeviceFingerprint(req: any): string {
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    return `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
  }
}