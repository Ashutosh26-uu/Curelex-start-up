import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignDoctorDto {
  @ApiProperty()
  @IsString()
  doctorId: string;

  @ApiProperty()
  @IsString()
  patientId: string;
}