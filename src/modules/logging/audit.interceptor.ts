import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, url, ip, headers } = request;

    if (user && this.shouldAudit(method, url)) {
      const action = `${method} ${url}`;
      const resource = this.extractResource(url);

      return next.handle().pipe(
        tap(() => {
          this.loggingService.createAuditLog({
            userId: user.id,
            action,
            resource,
            ipAddress: ip,
            userAgent: headers['user-agent'],
          });
        }),
      );
    }

    return next.handle();
  }

  private shouldAudit(method: string, url: string): boolean {
    // Audit all POST, PUT, PATCH, DELETE operations
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  }

  private extractResource(url: string): string {
    const segments = url.split('/');
    return segments[2] || 'unknown'; // Extract resource from /api/v1/resource
  }
}