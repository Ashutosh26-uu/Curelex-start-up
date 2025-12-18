import { IsEmail, IsString, IsOptional, IsEnum, MinLength, Matches, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnterpriseAuthDto {
  @ApiProperty({ description: 'Email or phone number' })
  @IsString()
  identifier: string;

  @ApiProperty({ description: 'Password', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character'
  })
  password: string;

  @ApiProperty({ description: 'Full name for registration', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ description: 'User role', enum: ['PATIENT', 'DOCTOR', 'NURSE'], required: false })
  @IsEnum(['PATIENT', 'DOCTOR', 'NURSE'])
  @IsOptional()
  role?: string;

  @ApiProperty({ description: 'Authentication action' })
  @IsEnum(['login', 'signup'])
  action: 'login' | 'signup';

  @ApiProperty({ description: 'Remember me option', required: false })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;

  @ApiProperty({ description: 'Device fingerprint', required: false })
  @IsString()
  @IsOptional()
  deviceFingerprint?: string;
}

export class TwoFactorAuthDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '6-digit verification code' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits' })
  code: string;

  @ApiProperty({ description: 'Backup code', required: false })
  @IsString()
  @IsOptional()
  backupCode?: string;
}

export class DeviceRegistrationDto {
  @ApiProperty({ description: 'Device name' })
  @IsString()
  deviceName: string;

  @ApiProperty({ description: 'Device type' })
  @IsEnum(['mobile', 'desktop', 'tablet'])
  deviceType: 'mobile' | 'desktop' | 'tablet';

  @ApiProperty({ description: 'Device fingerprint' })
  @IsString()
  deviceFingerprint: string;

  @ApiProperty({ description: 'Trust this device', required: false })
  @IsBoolean()
  @IsOptional()
  trustDevice?: boolean;
}