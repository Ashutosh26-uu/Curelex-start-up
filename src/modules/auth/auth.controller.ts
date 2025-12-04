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
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
    return this.authService.logout(req.user.id);
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
}