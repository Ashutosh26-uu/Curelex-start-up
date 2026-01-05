import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Setup2FADto {
  @ApiProperty({ description: 'User password for verification' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class Enable2FADto {
  @ApiProperty({ description: '6-digit verification code from authenticator app' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Verification code must be 6 digits' })
  token: string;
}

export class Verify2FADto {
  @ApiProperty({ description: '6-digit verification code or backup code' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'Whether this is a backup code', required: false })
  @IsOptional()
  isBackupCode?: boolean;
}

export class Disable2FADto {
  @ApiProperty({ description: '6-digit verification code from authenticator app' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Verification code must be 6 digits' })
  token: string;

  @ApiProperty({ description: 'User password for additional verification' })
  @IsString()
  @IsNotEmpty()
  password: string;
}