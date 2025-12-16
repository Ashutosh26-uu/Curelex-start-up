import { IsString, IsOptional, IsUUID, IsEnum, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum DataAccessLevel {
  BASIC = 'BASIC',
  MEDICAL = 'MEDICAL',
  FULL = 'FULL'
}

export class PatientDataAccessDto {
  @ApiProperty()
  @IsUUID()
  patientId: string;

  @ApiProperty()
  @IsUUID()
  requesterId: string;

  @ApiProperty({ enum: DataAccessLevel })
  @IsEnum(DataAccessLevel)
  accessLevel: DataAccessLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  purpose?: string;
}

export class MedicalHistoryAccessDto {
  @ApiProperty()
  @IsUUID()
  patientId: string;

  @ApiProperty()
  @IsUUID()
  doctorId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dateRange?: string;
}