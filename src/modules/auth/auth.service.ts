import { Injectable, UnauthorizedException, BadRequestException, ConflictException, ForbiddenException, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../../common/database/database.service';
import { AuthValidationService } from '../../common/services/auth-validation.service';
import { ErrorHandlingService } from '../../common/services/error-handling.service';
import { BusinessLogicService } from '../../common/services/business-logic.service';
import { QueryOptimizationService } from '../../common/services/query-optimization.service';
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
import { TwoFactorService } from './services/two-factor.service';
import { RateLimitService } from './services/rate-limit.service';
import { SessionManagementService } from './services/session-management.service';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

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
    private queryOptimizationService: QueryOptimizationService,
    private twoFactorService: TwoFactorService,
    private rateLimitService: RateLimitService,
    private sessionManagementService: SessionManagementService,
  ) {
    // Register this service to prevent circular dependencies
    this.serviceRegistry.registerService(ServiceRegistry.AUTH_SERVICE, this);
  }

  async validateUser(email: string, password: string) {
    const user = await this.queryOptimizationService.findUserWithProfile(email);

    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
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
    // Check rate limits
    const rateLimitResult = await this.rateLimitService.checkAdvancedRateLimit(ipAddress, undefined, 'login');
    if (!rateLimitResult.allowed) {
      throw new UnauthorizedException(`Login temporarily blocked: ${rateLimitResult.reason}`);
    }

    // Centralized validation
    const { normalizedPhone } = this.authValidationService.validateLoginCredentials(
      loginDto.email,
      loginDto.phone,
      loginDto.password
    );

    // Optimized user lookup
    let user;
    if (loginDto.email) {
      user = await this.queryOptimizationService.findUserWithProfile(loginDto.email);
    } else if (normalizedPhone) {
      user = await this.queryOptimizationService.findUserByPhone(normalizedPhone, UserRole.PATIENT);
    }

    if (!user) {
      await this.rateLimitService.recordFailedLogin(ipAddress);
      await this.logFailedLogin(loginDto.email || loginDto.phone, 'User not found', ipAddress, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check captcha if required
    const shouldRequireCaptcha = this.authValidationService.shouldRequireCaptcha(user.failedLoginAttempts, ipAddress);
    await this.authValidationService.validateCaptcha(loginDto.captchaId, loginDto.captchaValue, shouldRequireCaptcha);

    return this.processLogin(user, loginDto.password, UserRole.PATIENT, ipAddress, userAgent, loginDto.twoFactorToken);
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

      // Optimized user lookup with caching
      const user = await this.queryOptimizationService.findUserWithProfile(loginDto.email);

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

  async generateTokens(userId: string, email: string, role: string, sessionId: string, deviceFingerprint?: string) {
    return await this.prisma.safeTransaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new UnauthorizedException('User not found');

      const jti = uuidv4();
      const refreshJti = uuidv4();
      const tokenVersion = user.refreshTokenVersion + 1;
      const tokenConfig = this.businessLogicService.getTokenConfiguration();
      
      const payload = { 
        sub: userId, 
        email, 
        role, 
        sessionId,
        jti,
        ver: tokenVersion,
        dev: deviceFingerprint ? crypto.createHash('sha256').update(deviceFingerprint).digest('hex').substring(0, 16) : undefined,
        iat: Math.floor(Date.now() / 1000)
      };

      const refreshPayload = {
        ...payload,
        jti: refreshJti,
        type: 'refresh'
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, { expiresIn: tokenConfig.accessTokenExpiry }),
        this.jwtService.signAsync(refreshPayload, {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: tokenConfig.refreshTokenExpiry,
        })
      ]);

      const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
      const refreshTokenFamily = crypto.randomUUID();
      
      await tx.user.update({
        where: { id: userId },
        data: { 
          refreshToken: refreshTokenHash,
          refreshTokenFamily,
          refreshTokenVersion: tokenVersion,
          deviceFingerprint
        }
      });

      return { accessToken, refreshToken, refreshTokenFamily, tokenVersion };
    });
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto, deviceFingerprint?: string) {
    return await this.prisma.safeTransaction(async (tx) => {
      const payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await tx.user.findUnique({
        where: { id: payload.sub }
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Verify refresh token and detect reuse
      const isRefreshTokenValid = await bcrypt.compare(refreshTokenDto.refreshToken, user.refreshToken);
      if (!isRefreshTokenValid) {
        // Token reuse detected - invalidate all sessions
        await this.sessionManagementService.invalidateAllUserSessions(user.id);
        await this.sessionManagementService.handleSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          userId: user.id,
          metadata: { reason: 'Refresh token reuse detected' }
        });
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Validate token type and version
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      if (payload.ver && user.refreshTokenVersion !== payload.ver) {
        throw new UnauthorizedException('Token version mismatch');
      }

      // Generate new tokens with rotation
      const newTokens = await this.generateTokens(
        user.id, 
        user.email, 
        user.role, 
        payload.sessionId,
        deviceFingerprint
      );
      
      this.logger.log(`Token refreshed for user: ${user.email}`);
      
      return newTokens;
    });
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

      // Clear refresh token and session
      await tx.user.update({
        where: { id: userId },
        data: { 
          refreshToken: null,
          sessionId: null,
          lastLogoutAt: new Date(),
          refreshTokenFamily: null,
        }
      });
    });

    // Invalidate session
    await this.sessionManagementService.invalidateSession(sessionId);

    // Handle security event
    await this.sessionManagementService.handleSecurityEvent({
      type: 'LOGOUT',
      userId
    });

    // Invalidate user cache
    await this.queryOptimizationService.invalidateUserCache(userId);

    return { success: true, message: 'Logout successful' };
  }

  async logoutAllSessions(userId: string) {
    await this.prisma.safeTransaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { 
          refreshToken: null,
          sessionId: null,
          lastLogoutAt: new Date(),
          refreshTokenFamily: null,
          refreshTokenVersion: { increment: 1 }
        }
      });
    });

    // Invalidate all sessions
    await this.sessionManagementService.invalidateAllUserSessions(userId);

    // Handle security event
    await this.sessionManagementService.handleSecurityEvent({
      type: 'LOGOUT',
      userId,
      metadata: { type: 'all_sessions' }
    });

    // Invalidate user cache
    await this.queryOptimizationService.invalidateUserCache(userId);

    return { success: true, message: 'Logged out from all sessions' };
  }

  // 2FA Methods
  async setup2FA(userId: string) {
    return this.twoFactorService.generateTwoFactorSecret(userId);
  }

  async enable2FA(userId: string, token: string) {
    const result = await this.twoFactorService.enableTwoFactor(userId, token);
    
    await this.sessionManagementService.handleSecurityEvent({
      type: 'PASSWORD_CHANGE', // Using closest available type
      userId,
      metadata: { action: '2FA_ENABLED' }
    });
    
    return result;
  }

  async disable2FA(userId: string, token: string) {
    const result = await this.twoFactorService.disableTwoFactor(userId, token);
    
    await this.sessionManagementService.handleSecurityEvent({
      type: 'PASSWORD_CHANGE',
      userId,
      metadata: { action: '2FA_DISABLED' }
    });
    
    return result;
  }

  private async generateTempToken(userId: string): Promise<string> {
    const payload = { sub: userId, type: 'temp', exp: Math.floor(Date.now() / 1000) + 300 }; // 5 minutes
    return this.jwtService.signAsync(payload);
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

      // Handle security event for account lock
      await this.sessionManagementService.handleSecurityEvent({
        type: 'ACCOUNT_LOCKED',
        userId,
        ipAddress,
        userAgent,
        metadata: { reason: 'Too many failed login attempts' }
      });
    }

    await this.logFailedLogin(email, 'Invalid password', ipAddress, userAgent);
  }

  private async logFailedLogin(email: string, reason: string, ipAddress?: string, userAgent?: string) {
    try {
      // Limit login history per user to prevent unlimited growth
      const existingCount = await this.prisma.loginHistory.count({
        where: { email }
      });

      if (existingCount >= 100) {
        // Delete oldest records, keep latest 50
        const oldestRecords = await this.prisma.loginHistory.findMany({
          where: { email },
          orderBy: { createdAt: 'asc' },
          take: existingCount - 50,
          select: { id: true }
        });

        await this.prisma.loginHistory.deleteMany({
          where: { id: { in: oldestRecords.map(r => r.id) } }
        });
      }

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
    twoFactorToken?: string,
    rememberMe = false
  ) {
    // Check if user is active
    if (!user.isActive) {
      await this.rateLimitService.recordFailedLogin(ipAddress, user.id);
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
      await this.rateLimitService.recordFailedLogin(ipAddress, user.id);
      await this.handleFailedLogin(user.id, user.email, ipAddress, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check 2FA if enabled
    if (user.isTwoFactorEnabled) {
      if (!twoFactorToken) {
        return {
          success: false,
          requiresTwoFactor: true,
          message: 'Two-factor authentication required',
          tempToken: await this.generateTempToken(user.id)
        };
      }

      const is2FAValid = await this.twoFactorService.verifyTwoFactor(user.id, twoFactorToken);
      if (!is2FAValid) {
        await this.rateLimitService.recordFailedLogin(ipAddress, user.id);
        throw new UnauthorizedException('Invalid two-factor authentication code');
      }
    }

    // Check role if specified
    if (expectedRole && user.role !== expectedRole) {
      await this.logFailedLogin(user.email, 'Invalid role access', ipAddress, userAgent);
      throw new ForbiddenException(`Access denied. This login is for ${expectedRole} users only.`);
    }

    // Check for concurrent sessions
    await this.sessionManagementService.detectConcurrentSessions(user.id);

    // Generate session and tokens
    const sessionId = await this.sessionManagementService.createSession(user.id, ipAddress, userAgent);
    const tokens = await this.generateTokens(user.id, user.email, user.role, sessionId);

    // Update user login info
    await this.prisma.user.update({
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

    // Log successful login
    await this.prisma.loginHistory.create({
      data: {
        userId: user.id,
        email: user.email,
        success: true,
        ipAddress,
        userAgent,
      }
    });

    // Handle security event
    await this.sessionManagementService.handleSecurityEvent({
      type: 'LOGIN',
      userId: user.id,
      ipAddress,
      userAgent
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
      sessionId,
    };
  }