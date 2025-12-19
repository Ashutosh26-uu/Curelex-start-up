import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRateLimitGuard implements CanActivate {
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private readonly MAX_REQUESTS_PER_USER = 100;

  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) return true; // Skip for unauthenticated requests

    const windowStart = new Date(Date.now() - this.RATE_LIMIT_WINDOW);
    
    const requestCount = await this.prisma.auditLog.count({
      where: {
        userId,
        createdAt: { gte: windowStart },
        action: 'API_REQUEST'
      }
    });

    if (requestCount >= this.MAX_REQUESTS_PER_USER) {
      throw new HttpException('Rate limit exceeded for user', HttpStatus.TOO_MANY_REQUESTS);
    }

    // Log the request
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'API_REQUEST',
        resource: request.route?.path || request.url,
        ipAddress: request.ip,
        userAgent: request.get('User-Agent')
      }
    });

    return true;
  }
}