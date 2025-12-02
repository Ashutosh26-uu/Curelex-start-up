import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export class UpdateAppointmentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({ enum: AppointmentStatus, required: false })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cancelReason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  completedAt?: string;
}