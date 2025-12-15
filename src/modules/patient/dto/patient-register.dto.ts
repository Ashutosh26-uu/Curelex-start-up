import { IsString, IsNumber, IsEmail, IsArray, IsOptional, Min, Max, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PatientSelfRegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @Length(2, 50)
  name: string;

  @ApiProperty({ example: '+91-9999888777' })
  @IsString()
  @Matches(/^\+91-[0-9]{10}$/, { message: 'Phone must be in format +91-XXXXXXXXXX' })
  phone: string;

  @ApiProperty({ example: 25 })
  @IsNumber()
  @Min(1)
  @Max(120)
  age: number;

  @ApiProperty({ example: 'ABC123' })
  @IsString()
  @Length(6, 6)
  captcha: string;

  @ApiProperty({ example: 'Male' })
  @IsOptional()
  @IsString()
  gender?: string;
}

export class PatientAssistedRegisterDto extends PatientSelfRegisterDto {
  @ApiProperty({ example: 'DR001' })
  @IsString()
  juniorDoctorId: string;

  @ApiProperty({ example: 'patient@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+91-9999777888' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;
}

export class PatientMedicalDetailsDto {
  @ApiProperty({ example: ['Diabetes', 'Hypertension'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalHistory?: string[];

  @ApiProperty({ example: 'Fever, headache' })
  @IsOptional()
  @IsString()
  currentSymptoms?: string;

  @ApiProperty({ example: 'A+' })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiProperty({ example: ['Penicillin'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiProperty({ example: 'Cardiology' })
  @IsOptional()
  @IsString()
  preferredSpecialization?: string;
}

// Legacy DTO for backward compatibility
export class PatientRegisterDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(150)
  age: number;

  @ApiProperty()
  @IsString()
  gender: string;

  @ApiProperty()
  @IsString()
  mobile: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  medicalHistory: string[];

  @ApiProperty()
  @IsString()
  symptoms: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  emergencyContact?: string;
}