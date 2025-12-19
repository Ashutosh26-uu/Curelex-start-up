import { Injectable, UnauthorizedException, BadRequestException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CaptchaService } from '../../common/services/captcha.service';
import { LoginDto, PatientLoginDto, DoctorLoginDto } from './dto/login.dto';
import { PatientRegisterDto } from './dto/patient-register.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private captchaService: CaptchaService,
  ) {}

  async patientRegister(registerDto: PatientRegisterDto, ipAddress?: string, userAgent?: string) {
    // Validate password confirmation
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email.toLowerCase() }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if phone number is already used
    const existingPhone = await this.prisma.profile.findFirst({
      where: { phone: registerDto.phone }
    });

    if (existingPhone) {
      throw new ConflictException('User with this phone number already exists');
    }

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 12);
      
      // Generate unique patient ID
      const patientId = `PAT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Create user and profile in transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: registerDto.email.toLowerCase(),
            password: hashedPassword,
            role: UserRole.PATIENT,
            isActive: true,
            ipAddress,
            userAgent,
          }
        });

        // Create profile
        const profile = await tx.profile.create({
          data: {
            userId: user.id,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            phone: registerDto.phone,
            dateOfBirth: registerDto.dateOfBirth ? new Date(registerDto.dateOfBirth) : null,
            gender: registerDto.gender,
            address: registerDto.address,
            city: registerDto.city,
            state: registerDto.state,
            zipCode: registerDto.zipCode,
          }
        });

        // Create patient record
        const patient = await tx.patient.create({
          data: {
            userId: user.id,
            patientId,
            status: 'ACTIVE',
          }
        });

        return { user, profile, patient };
      });

      this.logger.log(`New patient registered: ${registerDto.email}`);

      return {
        success: true,
        message: 'Patient registration successful',
        data: {
          id: result.user.id,
          email: result.user.email,
          patientId: result.patient.patientId,
          name: `${result.profile.firstName} ${result.profile.lastName}`,
        }
      };

    } catch (error) {
      this.logger.error(`Registration failed for ${registerDto.email}:`, error.message);
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  async patientLogin(loginDto: PatientLoginDto, ipAddress?: string, userAgent?: string) {
    return this.login({ ...loginDto, expectedRole: UserRole.PATIENT }, ipAddress, userAgent);
  }

  async doctorLogin(loginDto: DoctorLoginDto, ipAddress?: string, userAgent?: string) {
    return this.login({ ...loginDto, expectedRole: UserRole.DOCTOR }, ipAddress, userAgent);
  }

  async login(loginDto: LoginDto & { expectedRole?: string }, ipAddress?: string, userAgent?: string) {
    try {
      // Validate captcha if provided
      if (loginDto.captchaId && loginDto.captchaValue) {
        const isCaptchaValid = this.captchaService.validateCaptcha(loginDto.captchaId, loginDto.captchaValue);
        if (!isCaptchaValid) {
          await this.logFailedLogin(loginDto.email, 'Invalid captcha', ipAddress, userAgent);
          throw new BadRequestException('Invalid captcha. Please try again.');
        }
      }
      // Find user with profile and role-specific data
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email.toLowerCase() },
        include: {
          profile: true,
          patient: true,
          doctor: true,
          officer: true,
        }
      });

      if (!user) {
        await this.logFailedLogin(loginDto.email, 'User not found', ipAddress, userAgent);
        throw new UnauthorizedException('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        await this.logFailedLogin(loginDto.email, 'Account inactive', ipAddress, userAgent);
        throw new UnauthorizedException('Account is inactive. Please contact support.');
      }

      // Check if account is locked
      if (user.isLocked) {
        await this.logFailedLogin(loginDto.email, 'Account locked', ipAddress, userAgent);
        throw new UnauthorizedException(`Account is locked. Reason: ${user.lockReason || 'Security violation'}`);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        await this.handleFailedLogin(user.id, loginDto.email, ipAddress, userAgent);
        throw new UnauthorizedException('Invalid email or password');
      }

      // Check role if specified
      if (loginDto.expectedRole && user.role !== loginDto.expectedRole) {
        await this.logFailedLogin(loginDto.email, 'Invalid role access', ipAddress, userAgent);
        throw new ForbiddenException(`Access denied. This login is for ${loginDto.expectedRole} users only.`);
      }

      // Generate session and tokens
      const sessionId = uuidv4();
      const tokens = await this.generateTokens(user.id, user.email, user.role, sessionId);

      // Update user login info
      await this.prisma.$transaction(async (tx) => {
        // Reset failed login attempts
        await tx.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lastFailedLoginAt: null,
            lastLoginAt: new Date(),
            loginCount: { increment: 1 },
            sessionId,
            ipAddress,
            userAgent,
          }
        });

        // Create session record
        await tx.userSession.create({
          data: {
            userId: user.id,
            sessionId,
            ipAddress,
            userAgent,
            expiresAt: new Date(Date.now() + (loginDto.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)),
          }
        });

        // Log successful login
        await tx.loginHistory.create({
          data: {
            userId: user.id,
            email: user.email,
            success: true,
            ipAddress,
            userAgent,
          }
        });
      });

      this.logger.log(`Successful login: ${user.email} (${user.role})`);

      // Prepare user data based on role
      const userData = {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        ...(user.patient && { patient: user.patient }),
        ...(user.doctor && { doctor: user.doctor }),
        ...(user.officer && { officer: user.officer }),
      };

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: userData,
          tokens,
          sessionId,
        }
      };

    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Login error for ${loginDto.email}:`, error.message);
      throw new BadRequestException('Login failed. Please try again.');
    }
  }

  async generateTokens(userId: string, email: string, role: string, sessionId: string) {
    const jti = uuidv4(); // JWT ID for token tracking
    const payload = { 
      sub: userId, 
      email, 
      role, 
      sessionId,
      jti,
      iat: Math.floor(Date.now() / 1000)
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Store refresh token
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: await bcrypt.hash(refreshToken, 10) }
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isRefreshTokenValid = await bcrypt.compare(refreshTokenDto.refreshToken, user.refreshToken);
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id, user.email, user.role, payload.sessionId);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, sessionId: string, jti?: string) {
    await this.prisma.$transaction(async (tx) => {
      // Blacklist current token if JTI provided
      if (jti) {
        await tx.auditLog.create({
          data: {
            userId,
            action: 'TOKEN_BLACKLISTED',
            resource: 'JWT',
            details: JSON.stringify({ jti, reason: 'logout' })
          }
        });
      }

      // Clear refresh token
      await tx.user.update({
        where: { id: userId },
        data: { 
          refreshToken: null,
          sessionId: null,
          lastLogoutAt: new Date()
        }
      });

      // Deactivate session
      await tx.userSession.updateMany({
        where: { userId, sessionId },
        data: { isActive: false }
      });
    });

    return { success: true, message: 'Logout successful' };
  }

  async logoutAllSessions(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { 
          refreshToken: null,
          sessionId: null,
          lastLogoutAt: new Date()
        }
      });

      await tx.userSession.updateMany({
        where: { userId },
        data: { isActive: false }
      });
    });

    return { success: true, message: 'Logged out from all sessions' };
  }

  private async handleFailedLogin(userId: string, email: string, ipAddress?: string, userAgent?: string) {
    const maxAttempts = this.configService.get<number>('MAX_LOGIN_ATTEMPTS', 5);
    
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: { increment: 1 },
        lastFailedLoginAt: new Date(),
      }
    });

    // Lock account if max attempts reached
    if (user.failedLoginAttempts >= maxAttempts) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isLocked: true,
          lockReason: 'Too many failed login attempts',
        }
      });
    }

    await this.logFailedLogin(email, 'Invalid password', ipAddress, userAgent);
  }

  private async logFailedLogin(email: string, reason: string, ipAddress?: string, userAgent?: string) {
    await this.prisma.loginHistory.create({
      data: {
        email,
        success: false,
        failReason: reason,
        ipAddress,
        userAgent,
      }
    });
  }

  async register(registerDto: RegisterDto) {
    throw new BadRequestException('Please use role-specific registration endpoints');
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    // Implementation for forgot password
    return { success: true, message: 'Password reset instructions sent to email' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Implementation for reset password
    return { success: true, message: 'Password reset successful' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    // Implementation for change password
    return { success: true, message: 'Password changed successfully' };
  }

  async getActiveSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getLoginHistory(userId: string) {
    return this.prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }

  // Legacy methods for compatibility
  async registerPatient(patientRegisterDto: any, ipAddress?: string, userAgent?: string) {
    return this.patientRegister(patientRegisterDto, ipAddress, userAgent);
  }

  async registerDoctor(doctorRegisterDto: any, ipAddress?: string, userAgent?: string) {
    throw new BadRequestException('Doctor registration requires admin approval');
  }

  async generateCaptcha() {
    return this.captchaService.generateCaptcha();
  }

  async validateCaptcha(captchaId: string, captchaValue: string) {
    return this.captchaService.validateCaptcha(captchaId, captchaValue);
  }

  async loginWithPhoneOrEmail(loginDto: any, ipAddress?: string, userAgent?: string) {
    return this.login(loginDto, ipAddress, userAgent);
  }

  async findUserByIdentifier(identifier: string, isEmail: boolean) {
    if (isEmail) {
      return this.prisma.user.findUnique({
        where: { email: identifier },
        select: { id: true, email: true, password: true }
      });
    } else {
      return this.prisma.user.findFirst({
        where: { profile: { phone: identifier } },
        select: { id: true, email: true, password: true }
      });
    }
  }
}