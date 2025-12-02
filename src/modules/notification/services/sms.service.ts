import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  constructor(private configService: ConfigService) {}

  async sendSms(options: { to: string; message: string }) {
    try {
      // Mock SMS service - replace with actual Twilio implementation
      console.log(`SMS to ${options.to}: ${options.message}`);
      return { success: true };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }
}