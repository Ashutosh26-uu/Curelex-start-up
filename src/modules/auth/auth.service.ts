import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    const user = await this.prisma.user.findUnique({
      where: { email, isDeleted: false },
      include: { profile: true, patient: true, doctor: true, officer: true },
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
        lastLoginAt: new Date(),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        patient: user.patient,
        doctor: user.doctor,
        officer: user.officer,
      },
      ...tokens,
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, role, firstName, lastName, ...profileData } = registerDto;
    
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        profile: {
          create: {
            firstName,
            lastName,
            ...profileData,
          },
        },
        ...(role === UserRole.PATIENT && {
          patient: {
            create: {
              patientId: `PAT-${Date.now()}`,
            },
          },
        }),
        ...(role === UserRole.DOCTOR && {
          doctor: {
            create: {
              doctorId: `DOC-${Date.now()}`,
              specialization: registerDto.specialization || 'General',
              licenseNumber: registerDto.licenseNumber || `LIC-${Date.now()}`,
              experience: registerDto.experience || 0,
              consultationFee: registerDto.consultationFee || 100,
            },
          },
        }),
        ...([UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO].includes(role as UserRole) && {
          officer: {
            create: {
              officerId: `OFF-${Date.now()}`,
              department: registerDto.department,
              position: role,
            },
          },
        }),
      },
      include: { profile: true, patient: true, doctor: true, officer: true },
    });

    await this.notificationService.sendWelcomeNotification(user.id, firstName);

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        patient: user.patient,
        doctor: user.doctor,
        officer: user.officer,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub, isDeleted: false },
      });
      
      if (!user || !user.refreshToken || !await bcrypt.compare(refreshToken, user.refreshToken)) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      const tokens = await this.generateTokens(user.id, user.email, user.role);
      
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
      });
      
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If email exists, reset link has been sent' };
    }
    
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });
    
    await this.notificationService.sendPasswordResetEmail(email, resetToken);
    
    return { message: 'If email exists, reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;
    
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });
    
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    
    return { message: 'Password reset successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);
    
    return { accessToken, refreshToken };
  }
}