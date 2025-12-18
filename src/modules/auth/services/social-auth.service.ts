import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { SocialLoginDto, SocialProvider } from '../dto/social-login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SocialAuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async validateSocialLogin(socialLoginDto: SocialLoginDto) {
    const { token, provider, email, name, picture } = socialLoginDto;

    let userInfo: any;

    switch (provider) {
      case SocialProvider.GOOGLE:
        userInfo = await this.validateGoogleToken(token);
        break;
      default:
        throw new UnauthorizedException('Unsupported social provider');
    }

    let user: any = await this.prisma.user.findUnique({
      where: { email: userInfo.email },
      include: { profile: true, patient: true, doctor: true },
    });

    if (!user) {
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 12);
      
      user = await this.prisma.user.create({
        data: {
          email: userInfo.email,
          password: randomPassword,
          role: 'PATIENT',
          isActive: true,
          emailVerifiedAt: new Date(),
          profile: {
            create: {
              firstName: userInfo.firstName || name?.split(' ')[0] || 'User',
              lastName: userInfo.lastName || name?.split(' ').slice(1).join(' ') || '',
              phone: userInfo.phone || '',
            },
          },
          patient: {
            create: {
              patientId: `PAT-${Date.now()}`,
              status: 'ACTIVE',
            },
          },
        },
        include: { profile: true, patient: true },
      });
    }

    return user;
  }

  private async validateGoogleToken(token: string) {
    try {
      // Simplified validation - in production use Google Auth Library
      return {
        email: 'user@gmail.com',
        firstName: 'Social',
        lastName: 'User',
        picture: '',
        verified: true,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}