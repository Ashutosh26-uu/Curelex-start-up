import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsInt, Min, IsOptional, MinLength, Matches } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class DoctorRegisterDto {
  @ApiProperty({ example: 'Dr. Smith' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phone: string;

  @ApiProperty({ example: 'doctor@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 35 })
  @IsInt()
  @Min(22)
  age: number;

  @ApiProperty({ example: 'MALE', enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  gender: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  experience: number;

  @ApiProperty({ example: 'City Hospital' })
  @IsString()
  hospital: string;

  @ApiProperty({ example: '123456789012' })
  @IsString()
  @Matches(/^\d{12}$/, { message: 'Aadhar number must be 12 digits' })
  aadharNumber: string;

  @ApiProperty({ example: 'MBBS, MD' })
  @IsString()
  education: string;

  @ApiProperty({ example: 'Cardiology' })
  @IsString()
  specialization: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: UserRole.JUNIOR_DOCTOR, enum: [UserRole.JUNIOR_DOCTOR, UserRole.SENIOR_DOCTOR] })
  @IsEnum([UserRole.JUNIOR_DOCTOR, UserRole.SENIOR_DOCTOR])
  role: UserRole;

  @ApiProperty({ example: 'ABC123' })
  @IsString()
  captcha: string;

  @ApiProperty({ example: 'MED123456', required: false })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  yearsOfSpecialization?: number;
}