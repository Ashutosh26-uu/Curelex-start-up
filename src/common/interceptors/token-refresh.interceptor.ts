import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() => {
        const token = this.extractTokenFromHeader(request);
        if (token) {
          try {
            const payload = this.jwtService.decode(token) as any;
            const currentTime = Math.floor(Date.now() / 1000);
            const tokenExp = payload.exp;
            
            // If token expires within 1 hour, add refresh header
            if (tokenExp - currentTime < 3600) {
              response.setHeader('X-Token-Refresh-Required', 'true');
            }
          } catch (error) {
            // Token decode failed, ignore
          }
        }
      })
    );
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}