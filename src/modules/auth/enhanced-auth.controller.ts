import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request, 
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseInterceptors
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EnhancedCSRFGuard } from './guards/enhanced-csrf.guard';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto, PatientLoginDto, DoctorLoginDto } from './dto/login.dto';
import { PatientRegisterDto } from './dto/patient-register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';

@ApiTags('Authentication')\n@Controller('auth')\n@UseInterceptors(LoggingInterceptor)\nexport class AuthController {\n  constructor(private authService: AuthService) {}\n\n  @Public()\n  @Post('register/patient')\n  @UseGuards(RateLimitGuard, EnhancedCSRFGuard)\n  @HttpCode(HttpStatus.CREATED)\n  @ApiOperation({ summary: 'Register new patient' })\n  async registerPatient(\n    @Body() registerDto: PatientRegisterDto,\n    @Request() req\n  ) {\n    return this.authService.patientRegister(\n      registerDto,\n      req.ip,\n      req.get('user-agent')\n    );\n  }\n\n  @Public()\n  @Post('login/patient')\n  @UseGuards(RateLimitGuard)\n  @HttpCode(HttpStatus.OK)\n  @ApiOperation({ summary: 'Patient login' })\n  async patientLogin(\n    @Body() loginDto: PatientLoginDto,\n    @Request() req\n  ) {\n    return this.authService.patientLogin(\n      loginDto,\n      req.ip,\n      req.get('user-agent')\n    );\n  }\n\n  @Public()\n  @Post('login/doctor')\n  @UseGuards(RateLimitGuard)\n  @HttpCode(HttpStatus.OK)\n  @ApiOperation({ summary: 'Doctor login' })\n  async doctorLogin(\n    @Body() loginDto: DoctorLoginDto,\n    @Request() req\n  ) {\n    return this.authService.doctorLogin(\n      loginDto,\n      req.ip,\n      req.get('user-agent')\n    );\n  }\n\n  @Public()\n  @Post('refresh')\n  @UseGuards(RateLimitGuard)\n  @HttpCode(HttpStatus.OK)\n  @ApiOperation({ summary: 'Refresh access token' })\n  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {\n    return this.authService.refreshTokens(refreshTokenDto);\n  }\n\n  @Post('logout')\n  @UseGuards(JwtAuthGuard)\n  @HttpCode(HttpStatus.OK)\n  @ApiOperation({ summary: 'Logout current session' })\n  async logout(@CurrentUser() user, @Request() req) {\n    return this.authService.logout(\n      user.sub,\n      user.sessionId,\n      user.jti\n    );\n  }\n\n  @Post('logout-all')\n  @UseGuards(JwtAuthGuard)\n  @HttpCode(HttpStatus.OK)\n  @ApiOperation({ summary: 'Logout all sessions' })\n  async logoutAll(@CurrentUser() user) {\n    return this.authService.logoutAllSessions(user.sub);\n  }\n\n  // 2FA Endpoints\n  @Post('2fa/setup')\n  @UseGuards(JwtAuthGuard)\n  @ApiOperation({ summary: 'Setup two-factor authentication' })\n  async setup2FA(@CurrentUser() user) {\n    return this.authService.setup2FA(user.sub);\n  }\n\n  @Post('2fa/enable')\n  @UseGuards(JwtAuthGuard)\n  @ApiOperation({ summary: 'Enable two-factor authentication' })\n  async enable2FA(\n    @CurrentUser() user,\n    @Body() body: { token: string }\n  ) {\n    return this.authService.enable2FA(user.sub, body.token);\n  }\n\n  @Post('2fa/disable')\n  @UseGuards(JwtAuthGuard)\n  @ApiOperation({ summary: 'Disable two-factor authentication' })\n  async disable2FA(\n    @CurrentUser() user,\n    @Body() body: { token: string }\n  ) {\n    return this.authService.disable2FA(user.sub, body.token);\n  }\n\n  // Session Management\n  @Get('sessions')\n  @UseGuards(JwtAuthGuard)\n  @ApiOperation({ summary: 'Get active sessions' })\n  async getActiveSessions(@CurrentUser() user) {\n    return this.authService.getActiveSessions(user.sub);\n  }\n\n  @Delete('sessions/:sessionId')\n  @UseGuards(JwtAuthGuard)\n  @ApiOperation({ summary: 'Terminate specific session' })\n  async terminateSession(\n    @CurrentUser() user,\n    @Param('sessionId') sessionId: string\n  ) {\n    // Implementation would go here\n    return { success: true, message: 'Session terminated' };\n  }\n\n  // Security Information\n  @Get('security/login-history')\n  @UseGuards(JwtAuthGuard)\n  @ApiOperation({ summary: 'Get login history' })\n  async getLoginHistory(@CurrentUser() user) {\n    return this.authService.getLoginHistory(user.sub);\n  }\n\n  @Get('me')\n  @UseGuards(JwtAuthGuard)\n  @ApiOperation({ summary: 'Get current user info' })\n  async getCurrentUser(@CurrentUser() user) {\n    // Implementation would fetch user details\n    return { user };\n  }\n}