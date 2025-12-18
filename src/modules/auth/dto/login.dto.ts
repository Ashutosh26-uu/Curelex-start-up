import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })
  password: string;

  @ApiProperty({ required: false, example: 'ABC123', description: 'Captcha value for security verification' })
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(10)
  captchaValue?: string;

  @ApiProperty({ required: false, description: 'Captcha ID from captcha generation' })
  @IsOptional()
  @IsString()
  captchaId?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  rememberMe?: boolean;
}

export class PatientLoginDto extends LoginDto {
  @ApiProperty({ example: 'PATIENT' })
  readonly expectedRole = 'PATIENT';
}

export class DoctorLoginDto extends LoginDto {
  @ApiProperty({ example: 'DOCTOR' })
  readonly expectedRole = 'DOCTOR';
}