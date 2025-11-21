import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVitalsDto {
  @ApiProperty()
  @IsString()
  patientId: string;

  @ApiProperty()
  @IsString()
  BP: string;

  @ApiProperty()
  @IsNumber()
  heartRate: number;

  @ApiProperty()
  @IsNumber()
  oxygenLevel: number;

  @ApiProperty()
  @IsNumber()
  sugarLevel: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @IsString()
  updatedBy: string;
}