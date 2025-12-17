import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { throwError } from 'rxjs';

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TokenRefreshInterceptor.name);
  private readonly REFRESH_THRESHOLD_SECONDS = 900; // 15 minutes

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() => {
        try {
          this.checkTokenRefreshRequirement(request, response);
        } catch (error) {
          this.logger.warn('Token refresh check failed', error.message);
        }
      }),
      catchError((error) => {
        this.logger.error('Request processing failed', error.message);
        return throwError(() => error);
      })
    );
  }

  private checkTokenRefreshRequirement(request: any, response: any): void {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return;
    }

    try {
      const payload = this.jwtService.decode(token) as any;
      if (!payload?.exp) {
        return;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      
      if (timeUntilExpiry > 0 && timeUntilExpiry < this.REFRESH_THRESHOLD_SECONDS) {
        response.setHeader('X-Token-Refresh-Required', 'true');
        response.setHeader('X-Token-Expires-In', timeUntilExpiry.toString());
      }
    } catch (error) {
      this.logger.debug('Token decode failed during refresh check', error.message);
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers?.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : undefined;
  }
}