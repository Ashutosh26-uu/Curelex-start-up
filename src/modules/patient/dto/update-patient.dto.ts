import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PatientStatus } from './create-patient.dto';

export class UpdatePatientDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  chronicConditions?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  insuranceNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  insuranceProvider?: string;

  @ApiProperty({ enum: PatientStatus, required: false })
  @IsOptional()
  @IsEnum(PatientStatus)
  status?: PatientStatus;
}