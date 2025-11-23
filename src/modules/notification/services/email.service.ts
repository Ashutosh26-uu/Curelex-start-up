import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendEmail(options: { to: string; subject: string; text: string; html?: string }) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_USER'),
        ...options,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }
}