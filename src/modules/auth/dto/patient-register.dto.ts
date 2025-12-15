import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsInt, Min, Max, Matches, MinLength } from 'class-validator';

export class PatientRegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phone: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 25 })
  @IsInt()
  @Min(1)
  @Max(120)
  age: number;

  @ApiProperty({ example: 'MALE', enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  gender: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'ABC123' })
  @IsString()
  captcha: string;
}