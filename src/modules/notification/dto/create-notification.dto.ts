import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  WELCOME = 'WELCOME',
  APPOINTMENT = 'APPOINTMENT',
  PRESCRIPTION = 'PRESCRIPTION',
  VITAL_ALERT = 'VITAL_ALERT',
  MEDICATION_REMINDER = 'MEDICATION_REMINDER',
  SYSTEM = 'SYSTEM',
}

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  metadata?: string;
}