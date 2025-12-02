import { IsString, IsDateString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsString()
  patientId: string;

  @ApiProperty()
  @IsString()
  doctorId: string;

  @ApiProperty()
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(15)
  duration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}