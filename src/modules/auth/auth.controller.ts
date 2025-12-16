import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Get, UseInterceptors, UsePipes, ValidationPipe, Res, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiRateLimitResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, PatientLoginDto, DoctorLoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
  async register(@Body() registerDto: RegisterDto) {
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

  @ApiOperation({ summary: 'Patient registration with captcha' })
  @Public()
  @Post('register/patient')
  async registerPatient(@Body() patientRegisterDto: any, @Request() req: any) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.registerPatient(patientRegisterDto, ipAddress, userAgent);
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

  @ApiOperation({ summary: 'Generate captcha' })
  @Public()
  @Get('captcha')
  async generateCaptcha() {
    return this.authService.generateCaptcha();
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
}