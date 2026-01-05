import { BadRequestException } from '@nestjs/common';

export class ValidationUtils {
  static validatePassword(password: string, confirmPassword?: string): void {
    if (!password || password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const strongPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!strongPattern.test(password)) {
      throw new BadRequestException('Password must contain uppercase, lowercase, number, and special character');
    }

    if (confirmPassword && password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
  }

  static normalizePhoneNumber(phone: string): string {
    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }

    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Handle Indian phone numbers
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      return cleanPhone.substring(2); // Remove +91 prefix
    }
    
    if (cleanPhone.length === 10) {
      return cleanPhone; // Already normalized
    }
    
    throw new BadRequestException('Invalid phone number format. Use 10-digit Indian mobile number');
  }

  static validatePhoneNumber(phone: string): string {
    const normalized = this.normalizePhoneNumber(phone);
    
    // Indian mobile number validation (starts with 6-9)
    if (!/^[6-9]\d{9}$/.test(normalized)) {
      throw new BadRequestException('Invalid Indian mobile number');
    }
    
    return normalized;
  }

  static formatPhoneForDisplay(phone: string): string {
    const normalized = this.normalizePhoneNumber(phone);
    return `+91${normalized}`;
  }
}