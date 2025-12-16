import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as crypto from 'crypto';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    const csrfToken = request.headers['x-csrf-token'] || request.body._csrf;
    const sessionCsrf = request.session?.csrfToken;

    if (!csrfToken || !sessionCsrf || csrfToken !== sessionCsrf) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}