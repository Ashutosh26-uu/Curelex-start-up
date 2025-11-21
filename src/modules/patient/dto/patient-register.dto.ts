import { IsString, IsNumber, IsEmail, IsArray, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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