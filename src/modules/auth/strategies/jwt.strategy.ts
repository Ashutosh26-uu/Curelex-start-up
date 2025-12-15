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
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub, isDeleted: false },
      include: { profile: true, patient: true, doctor: true, officer: true },
    });

    if (!user || !user.isActive || user.isLocked) {
      throw new UnauthorizedException('Account not accessible');
    }

    // Validate session if sessionId is present
    if (payload.sessionId) {
      const session = await this.prisma.userSession.findUnique({
        where: { sessionId: payload.sessionId },
      });
      
      if (!session || !session.isActive || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Session expired or invalid');
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
    };
  }
}