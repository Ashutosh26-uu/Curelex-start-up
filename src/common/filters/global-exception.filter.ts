import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ErrorHandlingService } from '../services/error-handling.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private errorHandlingService: ErrorHandlingService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const userId = request.user?.['userId'];

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = this.getPrismaErrorStatus(exception.code);
    }

    // Use centralized error handling
    const sanitizedError = this.errorHandlingService.sanitizeError(
      exception,
      `${request.method} ${request.url}`,
      userId
    );

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: sanitizedError.message,
      ...(sanitizedError.code && process.env.NODE_ENV !== 'production' && { code: sanitizedError.code }),
    };

    response.status(status).json(errorResponse);
  }

  private getPrismaErrorStatus(code: string): number {
    const statusMap = {
      'P2002': HttpStatus.CONFLICT,
      'P2025': HttpStatus.NOT_FOUND,
      'P2003': HttpStatus.BAD_REQUEST,
    };
    return statusMap[code] || HttpStatus.BAD_REQUEST;
  }
}