import { Controller, Post, Body, Ip, Headers, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, PatientLoginDto } from './dto/login.dto';
import { PatientRegisterDto } from './dto/patient-register.dto';
import { Public } from '../../common/decorators/public.decorator';
import { RateLimit } from '../../common/guards/enhanced-rate-limit.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  @RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Post('patient/login')
  @Public()
  @RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  })
  async patientLogin(
    @Body() loginDto: PatientLoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.patientLogin(loginDto, ipAddress, userAgent);
  }

  @Post('register')
  @Public()
  @RateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 registrations per hour
  })
  async register(
    @Body() registerDto: PatientRegisterDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.patientRegister(registerDto, ipAddress, userAgent);
  }

  @Post('forgot-password')
  @Public()
  @RateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 password reset requests per hour
  })
  async forgotPassword(@Body() forgotPasswordDto: any) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }
}