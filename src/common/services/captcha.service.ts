import { Injectable } from '@nestjs/common';

@Injectable()
export class CaptchaService {
  private captchaStore = new Map<string, { value: string; expires: Date }>();

  generateCaptcha(): { id: string; challenge: string } {
    const id = Math.random().toString(36).substring(2, 15);
    const challenge = this.generateRandomString(6);
    
    // Store captcha with 5-minute expiry
    this.captchaStore.set(id, {
      value: challenge,
      expires: new Date(Date.now() + 5 * 60 * 1000),
    });

    return { id, challenge };
  }

  validateCaptcha(id: string, userInput: string): boolean {
    const stored = this.captchaStore.get(id);
    
    if (!stored) {
      return false;
    }

    if (new Date() > stored.expires) {
      this.captchaStore.delete(id);
      return false;
    }

    const isValid = stored.value.toLowerCase() === userInput.toLowerCase();
    
    // Remove captcha after validation attempt
    this.captchaStore.delete(id);
    
    return isValid;
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Cleanup expired captchas periodically
  cleanupExpired(): void {
    const now = new Date();
    for (const [id, data] of this.captchaStore.entries()) {
      if (now > data.expires) {
        this.captchaStore.delete(id);
      }
    }
  }
}