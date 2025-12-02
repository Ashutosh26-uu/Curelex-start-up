import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;
    const userAgent = headers['user-agent'];
    
    const action = `${method} ${url}`;
    const resource = this.extractResource(url);

    return next.handle().pipe(
      tap({
        next: (response) => {
          this.loggingService.createAuditLog({
            userId: user?.id,
            action: `${action} - SUCCESS`,
            resource,
            details: JSON.stringify({ 
              method, 
              url, 
              statusCode: 200,
              responseSize: JSON.stringify(response).length 
            }),
            ipAddress: ip,
            userAgent,
          });
        },
        error: (error) => {
          this.loggingService.createAuditLog({
            userId: user?.id,
            action: `${action} - ERROR`,
            resource,
            details: JSON.stringify({ 
              method, 
              url, 
              error: error.message,
              statusCode: error.status || 500 
            }),
            ipAddress: ip,
            userAgent,
          });
        },
      }),
    );
  }

  private extractResource(url: string): string {
    const segments = url.split('/').filter(Boolean);
    return segments[2] || segments[1] || 'unknown';
  }
}