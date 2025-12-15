import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req: any) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.login(loginDto, ipAddress, userAgent);
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req: any) {
    const sessionId = req.user.sessionId;
    return this.authService.logout(req.user.id, sessionId);
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

  @ApiOperation({ summary: 'CXO registration (Highly secured)' })
  @Public()
  @Post('register/cxo')
  async registerCxo(@Body() cxoRegisterDto: any, @Request() req: any) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.registerCxo(cxoRegisterDto, ipAddress, userAgent);
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