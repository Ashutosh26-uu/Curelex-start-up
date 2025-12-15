import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PhoneIdService {
  private readonly prefix = 'CX';
  
  /**
   * Generate unique patient ID from phone number
   * Format: CX + last 4 digits + hash(phone) + timestamp
   */
  generatePatientId(phone: string): string {
    // Remove +91- prefix and get last 4 digits
    const cleanPhone = phone.replace(/^\+91-/, '');
    const lastFour = cleanPhone.slice(-4);
    
    // Generate hash from phone number
    const hash = crypto.createHash('md5').update(phone).digest('hex').slice(0, 4).toUpperCase();
    
    // Get timestamp suffix (last 3 digits of current timestamp)
    const timestamp = Date.now().toString().slice(-3);
    
    return `${this.prefix}${lastFour}${hash}${timestamp}`;
  }

  /**
   * Validate phone number format
   */
  validatePhoneFormat(phone: string): boolean {
    const phoneRegex = /^\+91-[0-9]{10}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Extract phone from patient ID (reverse lookup)
   */
  extractPhoneFromId(patientId: string): string | null {
    if (!patientId.startsWith(this.prefix) || patientId.length < 13) {
      return null;
    }
    
    // Extract last 4 digits from patient ID
    const lastFour = patientId.slice(2, 6);
    return `+91-XXXXXX${lastFour}`;
  }

  /**
   * Generate doctor ID
   */
  generateDoctorId(email: string, specialization: string): string {
    const specCode = specialization.slice(0, 3).toUpperCase();
    const hash = crypto.createHash('md5').update(email).digest('hex').slice(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-3);
    
    return `DR${specCode}${hash}${timestamp}`;
  }

  /**
   * Generate officer ID
   */
  generateOfficerId(email: string, designation: string): string {
    const desigCode = designation.slice(0, 3).toUpperCase();
    const hash = crypto.createHash('md5').update(email).digest('hex').slice(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-3);
    
    return `OF${desigCode}${hash}${timestamp}`;
  }
}