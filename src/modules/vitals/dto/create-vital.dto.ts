import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum VitalType {
  BLOOD_PRESSURE = 'BLOOD_PRESSURE',
  HEART_RATE = 'HEART_RATE',
  OXYGEN_SATURATION = 'OXYGEN_SATURATION',
  BLOOD_SUGAR = 'BLOOD_SUGAR',
  TEMPERATURE = 'TEMPERATURE',
  WEIGHT = 'WEIGHT',
  HEIGHT = 'HEIGHT',
}

export class CreateVitalDto {
  @ApiProperty()
  @IsString()
  patientId: string;

  @ApiProperty({ enum: VitalType })
  @IsEnum(VitalType)
  type: VitalType;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiProperty()
  @IsString()
  unit: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}