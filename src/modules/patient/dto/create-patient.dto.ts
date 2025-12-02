import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PatientStatus {
  UNASSIGNED = 'UNASSIGNED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreatePatientDto {
  @ApiProperty()
  @IsString()
  userId: string;

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

  @ApiProperty({ enum: PatientStatus, default: PatientStatus.UNASSIGNED })
  @IsOptional()
  @IsEnum(PatientStatus)
  status?: PatientStatus;
}