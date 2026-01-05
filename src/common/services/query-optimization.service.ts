import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CacheService } from './cache.service';

@Injectable()
export class QueryOptimizationService {
  private readonly logger = new Logger(QueryOptimizationService.name);

  constructor(
    private prisma: DatabaseService,
    private cacheService: CacheService,
  ) {}

  // Optimized user lookup with caching
  async findUserWithProfile(email: string, useCache = true): Promise<any> {
    const cacheKey = `user:${email}`;
    
    if (useCache) {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) return cached;
    }

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        isLocked: true,
        isDeleted: true,
        failedLoginAttempts: true,
        sessionId: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
          }
        },
        patient: {
          select: {
            id: true,
            patientId: true,
            status: true,
          }
        },
        doctor: {
          select: {
            id: true,
            doctorId: true,
            specialization: true,
            isAvailable: true,
          }
        },
        officer: {
          select: {
            id: true,
            officerId: true,
            department: true,
          }
        }
      }
    });

    if (user && useCache) {
      await this.cacheService.set(cacheKey, user, 300); // 5 minutes
    }

    return user;
  }

  // Optimized phone lookup
  async findUserByPhone(phone: string, role?: string): Promise<any> {
    const cacheKey = `user:phone:${phone}:${role || 'any'}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const whereClause: any = {
      profile: { phone },
      isDeleted: false,
    };

    if (role) {
      whereClause.role = role;
    }

    const user = await this.prisma.user.findFirst({
      where: whereClause,
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        isLocked: true,
        failedLoginAttempts: true,
        sessionId: true,
        profile: true,
        patient: role === 'PATIENT' ? true : undefined,
        doctor: role === 'DOCTOR' ? true : undefined,
      }
    });

    if (user) {
      await this.cacheService.set(cacheKey, user, 300);
    }

    return user;
  }

  // Batch user session operations
  async updateUserLoginBatch(userId: string, sessionData: any): Promise<void> {
    await this.prisma.safeTransaction(async (tx) => {
      // Single update for user
      await tx.user.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: 0,
          lastFailedLoginAt: null,
          lastLoginAt: new Date(),
          loginCount: { increment: 1 },
          sessionId: sessionData.sessionId,
          ipAddress: sessionData.ipAddress,
          userAgent: sessionData.userAgent,
        }
      });

      // Batch create session and login history
      await Promise.all([
        tx.userSession.create({
          data: {
            userId,
            sessionId: sessionData.sessionId,
            ipAddress: sessionData.ipAddress,
            userAgent: sessionData.userAgent,
            expiresAt: sessionData.expiresAt,
          }
        }),
        tx.loginHistory.create({
          data: {
            userId,
            email: sessionData.email,
            success: true,
            ipAddress: sessionData.ipAddress,
            userAgent: sessionData.userAgent,
          }
        })
      ]);
    });

    // Invalidate user cache
    await this.cacheService.del(`user:${sessionData.email}`);
  }

  // Optimized appointment queries
  async getPatientAppointments(patientId: string, limit = 10): Promise<any[]> {
    const cacheKey = `appointments:patient:${patientId}:${limit}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const appointments = await this.prisma.appointment.findMany({
      where: { 
        patientId,
        isDeleted: false,
      },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        type: true,
        doctor: {
          select: {
            id: true,
            doctorId: true,
            user: {
              select: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { scheduledAt: 'desc' },
      take: limit,
    });

    await this.cacheService.set(cacheKey, appointments, 180); // 3 minutes
    return appointments;
  }

  // Optimized doctor schedule
  async getDoctorSchedule(doctorId: string, date: Date): Promise<any[]> {
    const dateStr = date.toISOString().split('T')[0];
    const cacheKey = `schedule:doctor:${doctorId}:${dateStr}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'CANCELLED'
        }
      },
      select: {
        id: true,
        scheduledAt: true,
        duration: true,
        status: true,
        patient: {
          select: {
            patientId: true,
            user: {
              select: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { scheduledAt: 'asc' },
    });

    await this.cacheService.set(cacheKey, appointments, 300); // 5 minutes
    return appointments;
  }

  // Bulk operations for better performance
  async bulkCreateNotifications(notifications: any[]): Promise<void> {
    if (notifications.length === 0) return;

    await this.prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true,
    });
  }

  // Cache invalidation helpers
  async invalidateUserCache(email: string): Promise<void> {
    await this.cacheService.del(`user:${email}`);
  }

  async invalidatePatientCache(patientId: string): Promise<void> {
    const keys = await this.cacheService.keys(`appointments:patient:${patientId}:*`);
    if (keys.length > 0) {
      await this.cacheService.del(...keys);
    }
  }

  async invalidateDoctorCache(doctorId: string): Promise<void> {
    const keys = await this.cacheService.keys(`schedule:doctor:${doctorId}:*`);
    if (keys.length > 0) {
      await this.cacheService.del(...keys);
    }
  }
}