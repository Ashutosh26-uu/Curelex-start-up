import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';

interface CaptchaData {
  value: string;
  expires: number;
  attempts: number;
}

@Injectable()
export class CaptchaService implements OnModuleInit {
  private readonly logger = new Logger(CaptchaService.name);
  private readonly captchaStore = new Map<string, CaptchaData>();
  private readonly MAX_ATTEMPTS = 3;
  private readonly EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_STORE_SIZE = 10000;

  onModuleInit() {
    this.logger.log('CaptchaService initialized');
  }

  generateCaptcha(): { id: string; challenge: string } {
    try {
      // Clean up if store is getting too large
      if (this.captchaStore.size > this.MAX_STORE_SIZE) {
        this.cleanupExpired();
      }

      const id = crypto.randomUUID();
      const challenge = this.generateSecureRandomString(6);
      
      this.captchaStore.set(id, {
        value: challenge,
        expires: Date.now() + this.EXPIRY_TIME,
        attempts: 0,
      });

      return { id, challenge };
    } catch (error) {
      this.logger.error('Failed to generate captcha', error.message);
      throw new Error('Captcha generation failed');
    }
  }

  validateCaptcha(id: string, userInput: string): boolean {
    try {
      if (!id || !userInput) {
        return false;
      }

      const stored = this.captchaStore.get(id);
      if (!stored) {
        return false;
      }

      // Check expiry
      if (Date.now() > stored.expires) {
        this.captchaStore.delete(id);
        return false;
      }

      // Check attempt limit
      stored.attempts++;
      if (stored.attempts > this.MAX_ATTEMPTS) {
        this.captchaStore.delete(id);
        return false;
      }

      const isValid = stored.value.toLowerCase() === userInput.toLowerCase().trim();
      
      // Remove captcha after successful validation or max attempts
      if (isValid || stored.attempts >= this.MAX_ATTEMPTS) {
        this.captchaStore.delete(id);
      }
      
      return isValid;
    } catch (error) {
      this.logger.error('Captcha validation failed', error.message);
      return false;
    }
  }

  private generateSecureRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'; // Removed confusing chars
    const bytes = crypto.randomBytes(length);
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    
    return result;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  cleanupExpired(): void {
    try {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [id, data] of this.captchaStore.entries()) {
        if (now > data.expires) {
          this.captchaStore.delete(id);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        this.logger.debug(`Cleaned up ${cleaned} expired captchas`);
      }
    } catch (error) {
      this.logger.error('Captcha cleanup failed', error.message);
    }
  }

  getStats(): { total: number; expired: number } {
    const now = Date.now();
    let expired = 0;
    
    for (const data of this.captchaStore.values()) {
      if (now > data.expires) {
        expired++;
      }
    }
    
    return {
      total: this.captchaStore.size,
      expired,
    };
  }
}