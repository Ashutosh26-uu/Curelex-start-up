import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        // Skip transformation for already formatted responses
        if (data && typeof data === 'object' && 'success' in data && 'timestamp' in data) {
          return data;
        }

        // Transform raw data into standardized response
        return ApiResponseDto.success('Request successful', data);
      }),
    );
  }
}