import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnifiedAuthDto } from '../dto/social-login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UnifiedAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async unifiedAuth(unifiedAuthDto: UnifiedAuthDto) {
    const { identifier, password, fullName, role, action } = unifiedAuthDto;

    if (action === 'signup') {
      return this.handleSignup(identifier, password, fullName, role);
    } else {
      return this.handleLogin(identifier, password);
    }
  }

  private async handleSignup(identifier: string, password: string, fullName: string, role: string) {
    const isEmail = identifier.includes('@');
    
    // Check if user exists
    const existingUser = isEmail 
      ? await this.prisma.user.findUnique({ where: { email: identifier } })
      : await this.prisma.user.findFirst({ where: { profile: { phone: identifier } } });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    if (!password || !fullName) {
      throw new BadRequestException('Password and full name are required for signup');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    const userData: any = {
      password: hashedPassword,
      role: role || 'PATIENT',
      isActive: true,
      profile: {
        create: {
          firstName,
          lastName,
        },
      },
    };

    if (isEmail) {
      userData.email = identifier;
      userData.profile.create.phone = '';
    } else {
      userData.email = `${identifier.replace(/[^0-9]/g, '')}@temp.com`;
      userData.profile.create.phone = identifier;
    }

    // Create role-specific data
    if (role === 'PATIENT' || !role) {
      userData.patient = {
        create: {
          patientId: `PAT-${Date.now()}`,
          status: 'ACTIVE',
        },
      };
    } else if (role === 'DOCTOR') {
      userData.doctor = {
        create: {
          doctorId: `DOC-${Date.now()}`,
          specialization: 'General Medicine',
          isAvailable: true,
        },
      };
    }

    const user = await this.prisma.user.create({
      data: userData,
      include: { profile: true, patient: true, doctor: true },
    });

    return this.generateTokens(user);
  }

  private async handleLogin(identifier: string, password: string) {
    const isEmail = identifier.includes('@');
    
    const user = await this.prisma.user.findFirst({
      where: isEmail 
        ? { email: identifier }
        : { profile: { phone: identifier } },
      include: { profile: true, patient: true, doctor: true },
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        patient: user.patient,
        doctor: user.doctor,
      },
      accessToken: this.jwtService.sign(payload, { expiresIn: '24h' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }
}