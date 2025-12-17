import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PatientRegisterDto {
  @ApiProperty({ example: 'john.doe@email.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character'
  })
  password: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  confirmPassword: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  lastName: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Please provide a valid phone number' })
  phone: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: 'Male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: '123 Main St' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'New York' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'NY' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '10001' })
  @IsOptional()
  @IsString()
  zipCode?: string;
}