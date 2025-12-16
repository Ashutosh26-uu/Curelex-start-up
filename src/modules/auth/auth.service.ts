import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PasswordUtil } from '../../common/utils/password.util';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
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

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email, password, captcha } = loginDto;
    
    // Rate limiting check
    await this.checkRateLimit(email, ipAddress);
    
    // Log login attempt
    await this.logLoginAttempt(email, ipAddress, userAgent, false);
    
    const user = await this.prisma.user.findUnique({
      where: { email, isDeleted: false },
      include: { profile: true, patient: true, doctor: true, officer: true },
    });

    // Always use constant time comparison to prevent timing attacks
    const dummyHash = '$2b$10$dummyhashtopreventtimingattacks';
    const userExists = !!user;
    const passwordToCheck = user?.password || dummyHash;
    
    // Verify password (always runs to prevent timing attacks)
    const isPasswordValid = await PasswordUtil.compare(password, passwordToCheck);
    
    // Check if user exists and password is valid
    if (!userExists || !isPasswordValid) {
      if (user) {
        await this.incrementFailedAttempts(user.id);
      }
      await this.logLoginAttempt(email, ipAddress, userAgent, false, 'Invalid credentials');
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is locked
    if (user.isLocked) {
      await this.logLoginAttempt(email, ipAddress, userAgent, false, 'Account locked');
      throw new UnauthorizedException('Account is temporarily locked. Please contact support.');
    }

    // Check failed login attempts (lock after 5 attempts)
    if (user.failedLoginAttempts >= 5) {
      await this.lockUser(user.id, 'Too many failed login attempts');
      throw new UnauthorizedException('Account locked due to multiple failed login attempts. Please reset your password.');
    }

    // Check if account is active
    if (!user.isActive) {
      await this.logLoginAttempt(email, ipAddress, userAgent, false, 'Account deactivated');
      throw new UnauthorizedException('Account is deactivated. Please contact support.');
    }

    // Validate captcha if required (after 3 failed attempts)
    if (user.failedLoginAttempts >= 3 && !captcha) {
      throw new UnauthorizedException('Captcha verification required');
    }

    // Generate session and tokens
    const sessionId = this.generateSessionId();
    const tokens = await this.generateTokens(user.id, user.email, user.role, sessionId);
    
    // Create user session
    await this.createUserSession(user.id, sessionId, ipAddress, userAgent);
    
    // Update user login info
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        refreshToken: await bcrypt.hash(tokens.refreshToken, 12),
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        sessionId,
        ipAddress,
        userAgent,
        loginCount: { increment: 1 },
      },
    });

    // Log successful login
    await this.logLoginAttempt(email, ipAddress, userAgent, true);

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        patient: user.patient,
        doctor: user.doctor,
        officer: user.officer,
        lastLoginAt: new Date(),
        loginCount: user.loginCount + 1,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId,
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '24h',
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, role, firstName, lastName, ...profileData } = registerDto;
    
    return await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const hashedPassword = await PasswordUtil.hash(password);
      
      const user = await tx.user.create({
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

      // Send notification after transaction commits
      setImmediate(() => {
        this.notificationService.sendWelcomeNotification(user.id, firstName).catch(console.error);
      });

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
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    });
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub, isDeleted: false },
        include: { profile: true, patient: true, doctor: true, officer: true },
      });
      
      if (!user || !user.refreshToken || !await bcrypt.compare(refreshToken, user.refreshToken)) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      // Validate session if exists
      if (user.sessionId) {
        const sessionValid = await this.validateSession(user.sessionId);
        if (!sessionValid) {
          throw new UnauthorizedException('Session expired');
        }
      }
      
      const tokens = await this.generateTokens(user.id, user.email, user.role, user.sessionId);
      
      await this.prisma.user.update({
        where: { id: user.id },
        data: { 
          refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
          lastLoginAt: new Date()
        },
      });
      
      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          patient: user.patient,
          doctor: user.doctor,
          officer: user.officer,
        }
      };
    } catch (error) {
      console.error('Refresh token validation failed:', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, sessionId?: string) {
    // Invalidate user session
    if (sessionId) {
      await this.prisma.userSession.updateMany({
        where: { userId, sessionId },
        data: { isActive: false },
      });
    } else {
      // Invalidate all user sessions
      await this.prisma.userSession.updateMany({
        where: { userId },
        data: { isActive: false },
      });
    }
    
    // Clear user tokens and session info
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        refreshToken: null,
        sessionId: null,
        lastLogoutAt: new Date(),
      },
    });
    
    return { 
      message: 'Logged out successfully',
      timestamp: new Date(),
    };
  }

  async logoutAllSessions(userId: string) {
    // Invalidate all user sessions
    await this.prisma.userSession.updateMany({
      where: { userId },
      data: { isActive: false },
    });
    
    // Clear user tokens
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        refreshToken: null,
        sessionId: null,
        lastLogoutAt: new Date(),
      },
    });
    
    return { 
      message: 'Logged out from all sessions successfully',
      timestamp: new Date(),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If email exists, reset link has been sent' };
    }
    
    const resetToken = require('crypto').randomBytes(32).toString('hex');
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
    
    const hashedPassword = await PasswordUtil.hash(newPassword);
    
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

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }
    
    const isCurrentPasswordValid = await PasswordUtil.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }
    
    const hashedNewPassword = await PasswordUtil.hash(newPassword);
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        passwordChangedAt: new Date(),
        mustChangePassword: false,
      },
    });
    
    return { message: 'Password changed successfully' };
  }

  async unlockUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isLocked: false,
        lockReason: null,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
      },
    });
  }



  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private async createUserSession(userId: string, sessionId: string, ipAddress?: string, userAgent?: string) {
    return await this.prisma.$transaction(async (tx) => {
      // First, deactivate any existing sessions for this user
      await tx.userSession.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false }
      });
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
      
      return tx.userSession.create({
        data: {
          userId,
          sessionId,
          ipAddress,
          userAgent,
          expiresAt,
        },
      });
    });
  }

  private async logLoginAttempt(email: string, ipAddress?: string, userAgent?: string, success: boolean = false, failReason?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    return this.prisma.loginHistory.create({
      data: {
        userId: user?.id,
        email,
        ipAddress,
        userAgent,
        success,
        failReason,
        device: this.extractDevice(userAgent),
      },
    });
  }

  private async incrementFailedAttempts(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: { increment: 1 },
        lastFailedLoginAt: new Date(),
      },
    });
  }

  private async lockUser(userId: string, reason: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isLocked: true,
        lockReason: reason,
      },
    });
  }

  private extractDevice(userAgent?: string): string {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    return 'Desktop';
  }

  async getActiveSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.prisma.userSession.findUnique({
      where: { sessionId },
    });
    
    return session?.isActive && session.expiresAt > new Date();
  }

  async getLoginHistory(userId: string) {
    return this.prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async generateTokens(userId: string, email: string, role: string, sessionId?: string) {
    const now = Math.floor(Date.now() / 1000);
    const payload = { 
      sub: userId, 
      email, 
      role, 
      sessionId,
      iat: now,
      jti: require('crypto').randomUUID() // JWT ID for token tracking
    };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m', // Shorter access token lifetime
      }),
      this.jwtService.signAsync({ ...payload, type: 'refresh' }, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d', // Shorter refresh token lifetime
      }),
    ]);
    
    return { accessToken, refreshToken };
  }

  async registerPatient(data: any, ipAddress?: string, userAgent?: string) {
    return this.register({ ...data, role: UserRole.PATIENT });
  }

  async registerDoctor(data: any, ipAddress?: string, userAgent?: string) {
    return this.register({ ...data, role: UserRole.DOCTOR });
  }

  async loginWithPhoneOrEmail(loginDto: any, ipAddress?: string, userAgent?: string) {
    return this.login(loginDto, ipAddress, userAgent);
  }

  async generateCaptcha() {
    const captcha = Math.random().toString(36).substring(2, 8).toUpperCase();
    return {
      captcha,
      timestamp: new Date(),
      expiresIn: '5 minutes'
    };
  }

  // Portal-specific login methods with role validation
  async patientLogin(loginDto: any, ipAddress?: string, userAgent?: string) {
    try {
      const result = await this.login(loginDto, ipAddress, userAgent);
      
      // Validate user is patient
      if (!['PATIENT'].includes(result.user.role)) {
        await this.logLoginAttempt(loginDto.email, ipAddress, userAgent, false, 'Invalid portal access - not a patient');
        throw new UnauthorizedException('Access denied. This portal is for patients only.');
      }
      
      return {
        ...result,
        portalType: 'PATIENT',
        redirectUrl: '/patient/dashboard'
      };
    } catch (error) {
      throw error;
    }
  }

  async doctorLogin(loginDto: any, ipAddress?: string, userAgent?: string) {
    try {
      const result = await this.login(loginDto, ipAddress, userAgent);
      
      // Validate user is doctor or junior doctor
      if (!['DOCTOR', 'JUNIOR_DOCTOR'].includes(result.user.role)) {
        await this.logLoginAttempt(loginDto.email, ipAddress, userAgent, false, 'Invalid portal access - not a doctor');
        throw new UnauthorizedException('Access denied. This portal is for medical professionals only.');
      }
      
      return {
        ...result,
        portalType: 'DOCTOR',
        redirectUrl: result.user.role === 'DOCTOR' ? '/doctor/dashboard' : '/junior-doctor/dashboard'
      };
    } catch (error) {
      throw error;
    }
  }

  // Rate limiting implementation
  private async checkRateLimit(email: string, ipAddress?: string) {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    // Check attempts by email
    const emailAttempts = await this.prisma.loginHistory.count({
      where: {
        email,
        createdAt: { gte: fiveMinutesAgo },
        success: false,
      },
    });
    
    if (emailAttempts >= 10) {
      throw new UnauthorizedException('Too many login attempts. Please try again in 5 minutes.');
    }
    
    // Check attempts by IP
    if (ipAddress) {
      const ipAttempts = await this.prisma.loginHistory.count({
        where: {
          ipAddress,
          createdAt: { gte: fiveMinutesAgo },
          success: false,
        },
      });
      
      if (ipAttempts >= 20) {
        throw new UnauthorizedException('Too many login attempts from this IP. Please try again later.');
      }
    }
  }


}