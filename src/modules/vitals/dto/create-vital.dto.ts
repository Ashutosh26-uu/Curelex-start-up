import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VitalType } from '../../../common/enums/vital-type.enum';

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

  @ApiProperty()
  @IsString()
  recordedBy: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}