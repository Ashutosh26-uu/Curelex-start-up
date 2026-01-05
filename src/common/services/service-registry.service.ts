import { Injectable, Type } from '@nestjs/common';

@Injectable()
export class ServiceRegistry {
  private services = new Map<string, any>();
  private serviceTypes = new Map<string, Type<any>>();

  registerService<T>(token: string, service: T, serviceType?: Type<T>): void {
    this.services.set(token, service);
    if (serviceType) {
      this.serviceTypes.set(token, serviceType);
    }
  }

  getService<T>(token: string): T {
    const service = this.services.get(token);
    if (!service) {
      throw new Error(`Service ${token} not found in registry`);
    }
    return service;
  }

  hasService(token: string): boolean {
    return this.services.has(token);
  }

  getServiceType<T>(token: string): Type<T> | undefined {
    return this.serviceTypes.get(token);
  }

  // Service tokens to prevent circular dependencies
  static readonly AUTH_SERVICE = 'AUTH_SERVICE';
  static readonly NOTIFICATION_SERVICE = 'NOTIFICATION_SERVICE';
  static readonly PATIENT_SERVICE = 'PATIENT_SERVICE';
  static readonly DOCTOR_SERVICE = 'DOCTOR_SERVICE';
  static readonly APPOINTMENT_SERVICE = 'APPOINTMENT_SERVICE';
  static readonly PRESCRIPTION_SERVICE = 'PRESCRIPTION_SERVICE';
}