import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class CxoRegisterDto {
  @ApiProperty({ example: 'John Executive' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ceo@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    example: UserRole.CEO, 
    enum: [UserRole.CEO, UserRole.COO, UserRole.CTO, UserRole.CFO, UserRole.CLO, UserRole.BOD, UserRole.FOUNDER] 
  })
  @IsEnum([UserRole.CEO, UserRole.COO, UserRole.CTO, UserRole.CFO, UserRole.CLO, UserRole.BOD, UserRole.FOUNDER])
  designation: UserRole;

  @ApiProperty({ example: 'ABC123' })
  @IsString()
  captcha: string;
}