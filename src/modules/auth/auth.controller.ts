import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Get, UseInterceptors, UsePipes, ValidationPipe, Res, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, PatientLoginDto, DoctorLoginDto } from './dto/login.dto';
import { PatientRegisterDto } from './dto/patient-register.dto';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SocialLoginDto, UnifiedAuthDto } from './dto/social-login.dto';
import { SocialAuthService } from './services/social-auth.service';
import { UnifiedAuthService } from './services/unified-auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private socialAuthService: SocialAuthService,
    private unifiedAuthService: UnifiedAuthService,
  ) {}

  @ApiOperation({ summary: 'Patient Portal Login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @Public()
  @UseInterceptors(LoggingInterceptor)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @HttpCode(HttpStatus.OK)
  @Post('login/patient')
  async patientLogin(
    @Body() loginDto: PatientLoginDto, 
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-forwarded-for') forwardedFor?: string
  ) {
    const ipAddress = forwardedFor || req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    const result = await this.authService.patientLogin(loginDto, ipAddress, userAgent);
    
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    return result;
  }

  @ApiOperation({ summary: 'Doctor Portal Login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @Public()
  @UseInterceptors(LoggingInterceptor)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @HttpCode(HttpStatus.OK)
  @Post('login/doctor')
  async doctorLogin(
    @Body() loginDto: DoctorLoginDto, 
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-forwarded-for') forwardedFor?: string
  ) {
    const ipAddress = forwardedFor || req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    const result = await this.authService.doctorLogin(loginDto, ipAddress, userAgent);
    
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    return result;
  }



  @ApiOperation({ summary: 'General login endpoint' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Public()
  @UseInterceptors(LoggingInterceptor)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto, 
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-forwarded-for') forwardedFor?: string
  ) {
    const ipAddress = forwardedFor || req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    const result = await this.authService.login(loginDto, ipAddress, userAgent);
    
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    return result;
  }

  @ApiOperation({ summary: 'User registration' })
  @Public()
  @Post('register')
  async register(@Body() registerDto: PatientRegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(LoggingInterceptor)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const sessionId = req.user.sessionId;
    const result = await this.authService.logout(req.user.id, sessionId);
    
    // Clear any client-side cookies if they exist
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    return result;
  }

  @ApiOperation({ summary: 'Logout from all sessions' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout-all')
  async logoutAll(@Request() req: any) {
    return this.authService.logoutAllSessions(req.user.id);
  }

  @ApiOperation({ summary: 'Get active sessions' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@Request() req: any) {
    return this.authService.getActiveSessions(req.user.id);
  }

  @ApiOperation({ summary: 'Get login history' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('login-history')
  async getLoginHistory(@Request() req: any) {
    return this.authService.getLoginHistory(req.user.id);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @ApiOperation({ summary: 'Forgot password' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @ApiOperation({ summary: 'Reset password' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiOperation({ summary: 'Change password' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @ApiOperation({ summary: 'Patient registration with password confirmation' })
  @ApiResponse({ status: 201, description: 'Patient registered successfully' })
  @ApiResponse({ status: 400, description: 'Registration failed - validation errors' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @Public()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Post('register/patient')
  async registerPatient(
    @Body() patientRegisterDto: PatientRegisterDto, 
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-forwarded-for') forwardedFor?: string
  ) {
    const ipAddress = forwardedFor || req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    const result = await this.authService.patientRegister(patientRegisterDto, ipAddress, userAgent);
    
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    return result;
  }

  @ApiOperation({ summary: 'Doctor registration (Junior/Senior)' })
  @Public()
  @Post('register/doctor')
  async registerDoctor(@Body() doctorRegisterDto: any, @Request() req: any) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.registerDoctor(doctorRegisterDto, ipAddress, userAgent);
  }



  @ApiOperation({ summary: 'Auto refresh token if near expiry' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('auto-refresh')
  async autoRefresh(@Request() req: any) {
    const user = req.user;
    const tokens = await this.authService.generateTokens(user.id, user.email, user.role, user.sessionId);
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }

  @ApiOperation({ summary: 'Validate current session' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('validate-session')
  async validateSession(@Request() req: any) {
    return {
      valid: true,
      user: req.user,
      timestamp: new Date()
    };
  }

  @ApiOperation({ summary: 'Generate captcha for login security' })
  @ApiResponse({ status: 200, description: 'Captcha generated successfully' })
  @Public()
  @Get('captcha')
  async generateCaptcha() {
    return this.authService.generateCaptcha();
  }

  @ApiOperation({ summary: 'Validate captcha' })
  @ApiResponse({ status: 200, description: 'Captcha validation result' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('captcha/validate')
  async validateCaptcha(@Body() { captchaId, captchaValue }: { captchaId: string; captchaValue: string }) {
    const isValid = await this.authService.validateCaptcha(captchaId, captchaValue);
    return { valid: isValid };
  }

  @ApiOperation({ summary: 'Phone/Email login' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login/phone-email')
  async loginWithPhoneOrEmail(@Body() loginDto: any, @Request() req: any) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.loginWithPhoneOrEmail(loginDto, ipAddress, userAgent);
  }

  @ApiOperation({ summary: 'Unified authentication - Login or Signup like Instagram' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('unified')
  async unifiedAuth(@Body() unifiedAuthDto: UnifiedAuthDto) {
    return this.unifiedAuthService.unifiedAuth(unifiedAuthDto);
  }

  @ApiOperation({ summary: 'Social login (Google, Facebook, Apple)' })
  @ApiResponse({ status: 200, description: 'Social login successful' })
  @ApiResponse({ status: 401, description: 'Invalid social token' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('social')
  async socialLogin(@Body() socialLoginDto: SocialLoginDto) {
    try {
      const user = await this.socialAuthService.validateSocialLogin(socialLoginDto);
      return this.authService.generateTokens(user.id, user.email, user.role, 'social-login');
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Check if user exists by email or phone' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('check-user')
  async checkUser(@Body() { identifier }: { identifier: string }) {
    const isEmail = identifier.includes('@');
    const user = await this.authService.findUserByIdentifier(identifier, isEmail);
    return { exists: !!user, hasPassword: user?.password ? true : false };
  }
}