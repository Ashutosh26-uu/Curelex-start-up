import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SocialProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
}

export class SocialLoginDto {
  @ApiProperty({ description: 'Social provider token' })
  @IsString()
  token: string;

  @ApiProperty({ enum: SocialProvider, description: 'Social login provider' })
  @IsEnum(SocialProvider)
  provider: SocialProvider;

  @ApiProperty({ description: 'User email from social provider', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'User name from social provider', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Profile picture URL', required: false })
  @IsString()
  @IsOptional()
  picture?: string;
}

export class PhoneVerificationDto {
  @ApiProperty({ description: 'Phone number with country code' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Verification code', required: false })
  @IsString()
  @IsOptional()
  code?: string;
}

export class UnifiedAuthDto {
  @ApiProperty({ description: 'Email or phone number' })
  @IsString()
  identifier: string;

  @ApiProperty({ description: 'Password for login, optional for signup' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ description: 'Full name for signup' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ description: 'User role', enum: ['PATIENT', 'DOCTOR', 'NURSE'] })
  @IsEnum(['PATIENT', 'DOCTOR', 'NURSE'])
  @IsOptional()
  role?: string;

  @ApiProperty({ description: 'Action type: login or signup' })
  @IsEnum(['login', 'signup'])
  action: 'login' | 'signup';
}