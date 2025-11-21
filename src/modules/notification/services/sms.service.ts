import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private client: Twilio;

  constructor(private configService: ConfigService) {
    this.client = new Twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendSms(options: { to: string; message: string }) {
    try {
      await this.client.messages.create({
        body: options.message,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: options.to,
      });
    } catch (error) {
      console.error('SMS sending failed:', error);
    }
  }
}