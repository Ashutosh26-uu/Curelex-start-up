import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      algorithms: ['HS256'], // Explicitly specify algorithm
    });
  }

  async validate(payload: any) {
    // Validate payload structure
    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Check token age (reject tokens older than expected)
    const tokenAge = Date.now() / 1000 - payload.iat;
    const maxAge = 24 * 60 * 60; // 24 hours in seconds
    if (tokenAge > maxAge) {
      throw new UnauthorizedException('Token too old');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub, isDeleted: false },
      include: { profile: true, patient: true, doctor: true, officer: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (user.isLocked) {
      throw new UnauthorizedException('Account is locked');
    }

    // Validate session if sessionId is present
    if (payload.sessionId) {
      const session = await this.prisma.userSession.findUnique({
        where: { sessionId: payload.sessionId },
      });
      
      if (!session || !session.isActive || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Session expired or invalid');
      }

      // Check if session belongs to the user
      if (session.userId !== user.id) {
        throw new UnauthorizedException('Session mismatch');
      }
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt && payload.iat) {
      const passwordChangedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (passwordChangedTimestamp > payload.iat) {
        throw new UnauthorizedException('Password changed. Please login again.');
      }
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      sessionId: payload.sessionId,
      profile: user.profile,
      patient: user.patient,
      doctor: user.doctor,
      officer: user.officer,
      tokenIssuedAt: payload.iat,
      jwtId: payload.jti,
    };
  }
}