import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { ValidationUtils } from '../utils/validation.utils';

@Injectable()
export class AuthValidationService {
  constructor(private readonly captchaService: CaptchaService) {}

  async validateCaptcha(captchaId?: string, captchaValue?: string, isRequired = false): Promise<void> {
    if (isRequired && (!captchaId || !captchaValue)) {
      throw new BadRequestException('Captcha is required');
    }

    if (captchaId && captchaValue) {
      const isValid = this.captchaService.validateCaptcha(captchaId, captchaValue);
      if (!isValid) {
        throw new BadRequestException('Invalid captcha. Please try again.');
      }
    }
  }

  validateLoginCredentials(email?: string, phone?: string, password?: string): { normalizedPhone?: string } {
    if (!password) {
      throw new BadRequestException('Password is required');
    }

    if (!email && !phone) {
      throw new BadRequestException('Email or phone number is required');
    }

    let normalizedPhone: string | undefined;
    if (phone) {
      normalizedPhone = ValidationUtils.validatePhoneNumber(phone);
    }

    return { normalizedPhone };
  }

  validateRegistrationData(data: {
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
  }): { normalizedPhone: string } {
    if (!data.email || !data.password || !data.phone) {
      throw new BadRequestException('Email, password, and phone are required');
    }

    ValidationUtils.validatePassword(data.password, data.confirmPassword);
    const normalizedPhone = ValidationUtils.validatePhoneNumber(data.phone);

    return { normalizedPhone };
  }

  shouldRequireCaptcha(failedAttempts: number, ipAddress?: string): boolean {
    const businessLogic = new (require('../business-logic.service')).BusinessLogicService(
      require('@nestjs/config').ConfigService
    );
    const limits = businessLogic.getLoginAttemptLimits();
    return failedAttempts >= limits.captchaThreshold;
  }
}