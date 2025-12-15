import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data?: T;

  @ApiProperty()
  timestamp: string;

  @ApiProperty({ required: false })
  errors?: string[];

  constructor(success: boolean, message: string, data?: T, errors?: string[]) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.errors = errors;
  }

  static success<T>(message: string, data?: T): ApiResponseDto<T> {
    return new ApiResponseDto(true, message, data);
  }

  static error(message: string, errors?: string[]): ApiResponseDto {
    return new ApiResponseDto(false, message, undefined, errors);
  }
}