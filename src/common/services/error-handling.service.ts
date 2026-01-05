import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ErrorHandlingService {
  private readonly logger = new Logger(ErrorHandlingService.name);
  private readonly isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction = configService.get('NODE_ENV') === 'production';
  }

  sanitizeError(error: any, context?: string): { message: string; code?: string } {
    // Log full error details internally
    this.logError(error, context);

    // Return sanitized error for client
    if (this.isProduction) {
      return this.getProductionError(error);
    }

    return {
      message: error.message || 'An error occurred',
      code: error.code,
    };
  }

  private getProductionError(error: any): { message: string; code?: string } {
    // Map specific errors to safe messages
    const errorMap = {
      'P2002': 'Resource already exists',
      'P2025': 'Resource not found',
      'P2003': 'Invalid reference',
      'ECONNREFUSED': 'Service temporarily unavailable',
      'ETIMEDOUT': 'Request timeout',
      'ValidationError': 'Invalid input provided',
      'UnauthorizedError': 'Authentication required',
      'ForbiddenError': 'Access denied',
    };

    const errorType = error.code || error.name || 'UnknownError';
    
    return {
      message: errorMap[errorType] || 'An unexpected error occurred',
      code: this.isProduction ? undefined : error.code,
    };
  }

  logError(error: any, context?: string, userId?: string): void {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
      context,
      userId,
      timestamp: new Date().toISOString(),
    };

    if (this.isCriticalError(error)) {
      this.logger.error(`CRITICAL: ${error.message}`, errorInfo);
    } else if (this.isSecurityError(error)) {
      this.logger.warn(`SECURITY: ${error.message}`, errorInfo);
    } else {
      this.logger.error(error.message, errorInfo);
    }
  }

  private isCriticalError(error: any): boolean {
    const criticalErrors = ['ECONNREFUSED', 'P1001', 'P1002', 'P1008'];
    return criticalErrors.includes(error.code) || error.message?.includes('database');
  }

  private isSecurityError(error: any): boolean {
    const securityErrors = ['UnauthorizedError', 'ForbiddenError', 'TokenExpiredError'];
    return securityErrors.includes(error.name) || 
           error.message?.toLowerCase().includes('unauthorized') ||
           error.message?.toLowerCase().includes('forbidden');
  }

  createSafeErrorResponse(error: any, context?: string, userId?: string) {
    const sanitized = this.sanitizeError(error, context);
    
    return {
      success: false,
      error: {
        message: sanitized.message,
        ...(sanitized.code && !this.isProduction && { code: sanitized.code }),
        timestamp: new Date().toISOString(),
      },
    };
  }
}