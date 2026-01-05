import { Injectable, UnauthorizedException, BadRequestException, ConflictException, ForbiddenException, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../../common/database/database.service';
import { AuthValidationService } from '../../common/services/auth-validation.service';
import { ErrorHandlingService } from '../../common/services/error-handling.service';
import { BusinessLogicService } from '../../common/services/business-logic.service';
import { IAuthService, INotificationService } from '../../common/interfaces/service.interfaces';
import { ServiceRegistry } from '../../common/services/service-registry.service';
import { ValidationUtils } from '../../common/utils/validation.utils';
import { LoginDto, PatientLoginDto, DoctorLoginDto } from './dto/login.dto';
import { PatientRegisterDto } from './dto/patient-register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private authValidationService: AuthValidationService,
    private errorHandlingService: ErrorHandlingService,
    private businessLogicService: BusinessLogicService,
    private serviceRegistry: ServiceRegistry,
  ) {
    // Register this service to prevent circular dependencies
    this.serviceRegistry.registerService(ServiceRegistry.AUTH_SERVICE, this);
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true, patient: true, doctor: true, officer: true },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async patientRegister(registerDto: PatientRegisterDto, ipAddress?: string, userAgent?: string) {
    // Centralized validation
    const { normalizedPhone } = this.authValidationService.validateRegistrationData({
      email: registerDto.email,
      password: registerDto.password,
      confirmPassword: registerDto.confirmPassword,
      phone: registerDto.phone,
    });

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email.toLowerCase() }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if phone number is already used
    const existingPhone = await this.prisma.profile.findFirst({
      where: { phone: normalizedPhone }
    });

    if (existingPhone) {
      throw new ConflictException('User with this phone number already exists');
    }

    try {
      // Hash password with higher rounds for better security
      const hashedPassword = await bcrypt.hash(registerDto.password, 14);
      
      // Generate unique patient ID using business logic
      const patientId = this.businessLogicService.generatePatientId();
      const statusRules = this.businessLogicService.getPatientStatusRules();

      // Create user and profile in transaction
      const result = await this.prisma.safeTransaction(async (tx) => {
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
            phone: normalizedPhone,
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
            status: statusRules.defaultStatus,
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
      const errorResponse = this.errorHandlingService.createSafeErrorResponse(
        error,
        'Patient Registration',
        undefined
      );
      throw new BadRequestException(errorResponse.error.message);
    }
  }

  async patientLogin(loginDto: PatientLoginDto, ipAddress?: string, userAgent?: string) {
    // Centralized validation
    const { normalizedPhone } = this.authValidationService.validateLoginCredentials(
      loginDto.email,
      loginDto.phone,
      loginDto.password
    );

    // Find user by email or phone
    let user;
    if (loginDto.email) {
      user = await this.prisma.user.findUnique({
        where: { email: loginDto.email.toLowerCase() },
        include: { profile: true, patient: true, doctor: true, officer: true }
      });
    } else if (normalizedPhone) {
      user = await this.prisma.user.findFirst({
        where: { 
          profile: { phone: normalizedPhone },
          role: UserRole.PATIENT 
        },
        include: { profile: true, patient: true, doctor: true, officer: true }
      });
    }

    if (!user) {
      await this.logFailedLogin(loginDto.email || loginDto.phone, 'User not found', ipAddress, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check captcha if required
    const shouldRequireCaptcha = this.authValidationService.shouldRequireCaptcha(user.failedLoginAttempts, ipAddress);
    await this.authValidationService.validateCaptcha(loginDto.captchaId, loginDto.captchaValue, shouldRequireCaptcha);

    return this.processLogin(user, loginDto.password, UserRole.PATIENT, ipAddress, userAgent);
  }

  async doctorLogin(loginDto: DoctorLoginDto, ipAddress?: string, userAgent?: string) {
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
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      await this.logFailedLogin(user.email, 'Account inactive', ipAddress, userAgent);
      throw new UnauthorizedException('Account is inactive. Please contact support.');
    }

    if (user.isLocked) {
      await this.logFailedLogin(user.email, 'Account locked', ipAddress, userAgent);
      throw new UnauthorizedException(`Account is locked. Reason: ${user.lockReason || 'Security violation'}`);
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id, user.email, ipAddress, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role !== UserRole.DOCTOR) {
      await this.logFailedLogin(user.email, 'Invalid role access', ipAddress, userAgent);
      throw new ForbiddenException('Access denied. This login is for doctors only.');
    }

    const sessionId = uuidv4();
    const tokens = await this.generateTokens(user.id, user.email, user.role, sessionId);

    await this.prisma.$transaction(async (tx) => {
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

      await tx.userSession.create({
        data: {
          userId: user.id,
          sessionId,
          ipAddress,
          userAgent,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }
      });

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

    this.logger.log(`Successful doctor login: ${user.email}`);

    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      doctor: user.doctor,
    };

    return {
      success: true,
      message: 'Login successful',
      user: userData,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(loginDto: LoginDto & { expectedRole?: string }, ipAddress?: string, userAgent?: string) {
    try {
      // Centralized validation
      this.authValidationService.validateLoginCredentials(loginDto.email, undefined, loginDto.password);

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email.toLowerCase() },
        include: { profile: true, patient: true, doctor: true, officer: true }
      });

      if (!user) {
        await this.logFailedLogin(loginDto.email, 'User not found', ipAddress, userAgent);
        throw new UnauthorizedException('Invalid email or password');
      }

      // Check captcha if required
      const shouldRequireCaptcha = this.authValidationService.shouldRequireCaptcha(user.failedLoginAttempts, ipAddress);
      await this.authValidationService.validateCaptcha(loginDto.captchaId, loginDto.captchaValue, shouldRequireCaptcha);

      return this.processLogin(user, loginDto.password, loginDto.expectedRole, ipAddress, userAgent, loginDto.rememberMe);

    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      const errorResponse = this.errorHandlingService.createSafeErrorResponse(
        error,
        'Login Process',
        undefined
      );
      throw new BadRequestException(errorResponse.error.message);
    }
  }

  async generateTokens(userId: string, email: string, role: string, sessionId: string) {
    const jti = uuidv4();
    const tokenConfig = this.businessLogicService.getTokenConfiguration();
    
    const payload = { 
      sub: userId, 
      email, 
      role, 
      sessionId,
      jti,
      iat: Math.floor(Date.now() / 1000)
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: tokenConfig.accessTokenExpiry,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: tokenConfig.refreshTokenExpiry,
    });

    // Store refresh token with higher security
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: await bcrypt.hash(refreshToken, 12) }
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
    await this.prisma.safeTransaction(async (tx) => {
      // Blacklist current token if JTI provided
      if (jti) {
        const tokenBlacklistService = new (await import('../../common/services/token-blacklist.service')).TokenBlacklistService(
          this.prisma,
          this.configService
        );
        await tokenBlacklistService.blacklistToken(jti, userId, 'logout');
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
    await this.prisma.safeTransaction(async (tx) => {
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
    const loginLimits = this.businessLogicService.getLoginAttemptLimits();
    
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: { increment: 1 },
        lastFailedLoginAt: new Date(),
      }
    });

    // Lock account if max attempts reached
    if (user.failedLoginAttempts >= loginLimits.maxAttempts) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isLocked: true,
          lockReason: 'Too many failed login attempts',
          accountLockUntil: new Date(Date.now() + loginLimits.lockoutDuration),
        }
      });
    }

    await this.logFailedLogin(email, 'Invalid password', ipAddress, userAgent);
  }

  private async logFailedLogin(email: string, reason: string, ipAddress?: string, userAgent?: string) {
    try {
      await this.prisma.loginHistory.create({
        data: {
          email,
          success: false,
          failReason: reason,
          ipAddress,
          userAgent,
        }
      });
    } catch (error) {
      this.errorHandlingService.logError(error, 'Failed Login Logging');
    }
  }

  async register(registerDto: PatientRegisterDto) {
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
  private async processLogin(
    user: any,
    password: string,
    expectedRole?: string,
    ipAddress?: string,
    userAgent?: string,
    rememberMe = false
  ) {
    // Check if user is active
    if (!user.isActive) {
      await this.logFailedLogin(user.email, 'Account inactive', ipAddress, userAgent);
      throw new UnauthorizedException('Account is inactive. Please contact support.');
    }

    // Check if account is locked
    if (user.isLocked) {
      await this.logFailedLogin(user.email, 'Account locked', ipAddress, userAgent);
      throw new UnauthorizedException(`Account is locked. Reason: ${user.lockReason || 'Security violation'}`);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id, user.email, ipAddress, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check role if specified
    if (expectedRole && user.role !== expectedRole) {
      await this.logFailedLogin(user.email, 'Invalid role access', ipAddress, userAgent);
      throw new ForbiddenException(`Access denied. This login is for ${expectedRole} users only.`);
    }

    // Generate session and tokens
    const sessionId = uuidv4();
    const tokens = await this.generateTokens(user.id, user.email, user.role, sessionId);

    // Update user login info
    await this.prisma.safeTransaction(async (tx) => {
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

      await tx.userSession.create({
        data: {
          userId: user.id,
          sessionId,
          ipAddress,
          userAgent,
          expiresAt: new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)),
        }
      });

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
      user: userData,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }