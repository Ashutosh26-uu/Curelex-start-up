import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignDoctorDto {
  @ApiProperty()
  @IsString()
  patientId: string;

  @ApiProperty()
  @IsString()
  doctorId: string;
}