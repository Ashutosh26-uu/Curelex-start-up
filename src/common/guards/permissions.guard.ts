import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPermissions) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    const userPermissions = this.getUserPermissions(user.role);
    
    return requiredPermissions.some((permission) => userPermissions.includes(permission));
  }

  private getUserPermissions(role: UserRole): string[] {
    const permissions: Partial<Record<UserRole, string[]>> = {
      [UserRole.PATIENT]: [
        'read:own-profile',
        'update:own-profile',
        'read:own-appointments',
        'create:appointments',
        'read:own-medical-history',
        'read:own-vitals',
      ],
      [UserRole.DOCTOR]: [
        'read:own-profile',
        'update:own-profile',
        'read:assigned-patients',
        'read:patient-medical-history',
        'create:prescriptions',
        'update:prescriptions',
        'read:appointments',
        'update:appointments',
        'read:vitals',
      ],
      [UserRole.JUNIOR_DOCTOR]: [
        'read:own-profile',
        'update:own-profile',
        'read:assigned-patients',
        'read:patient-medical-history',
        'create:vitals',
        'update:vitals',
        'read:appointments',
      ],
      [UserRole.NURSE]: [
        'read:own-profile',
        'update:own-profile',
        'read:patients',
        'update:patient-profiles',
        'create:vitals',
        'update:vitals',
        'read:appointments',
        'create:appointments',
      ],
      [UserRole.CEO]: [
        'read:analytics',
        'read:reports',
        'read:system-stats',
        'read:all-users',
        'read:financial-data',
      ],
      [UserRole.CTO]: [
        'read:analytics',
        'read:reports',
        'read:system-stats',
        'read:technical-metrics',
        'manage:system-settings',
      ],
      [UserRole.CFO]: [
        'read:analytics',
        'read:reports',
        'read:financial-data',
        'manage:billing',
      ],
      [UserRole.CMO]: [
        'read:analytics',
        'read:reports',
        'read:medical-operations',
        'manage:medical-protocols',
      ],
      [UserRole.ADMIN]: [
        'create:users',
        'read:users',
        'update:users',
        'delete:users',
        'assign:doctors',
        'manage:roles',
        'read:audit-logs',
        'manage:system-settings',
        'read:analytics',
        'read:reports',
      ],
    };

    return permissions[role] || [];
  }
}