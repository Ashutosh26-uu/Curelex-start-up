import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../../common/database/database.service';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class TwoFactorService {
  constructor(
    private prisma: DatabaseService,
    private configService: ConfigService,
  ) {}

  async generateTwoFactorSecret(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `HealthApp (${user.email})`,
      issuer: 'HealthApp',
      length: 32,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 }
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32,
    };
  }

  async enableTwoFactor(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.twoFactorSecret) {
      throw new BadRequestException('Two-factor secret not generated');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => crypto.pbkdf2Sync(code, 'backup', 10000, 64, 'sha512').toString('hex'))
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: true,
        twoFactorBackupCodes: hashedBackupCodes,
      }
    });

    return { backupCodes };
  }

  async verifyTwoFactor(userId: string, token: string, isBackupCode = false) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.isTwoFactorEnabled) {
      return true; // 2FA not enabled
    }

    if (isBackupCode) {
      return this.verifyBackupCode(userId, token);
    }

    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  private async verifyBackupCode(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    const hashedCode = crypto.pbkdf2Sync(code, 'backup', 10000, 64, 'sha512').toString('hex');
    const codeIndex = user.twoFactorBackupCodes?.indexOf(hashedCode);

    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    const updatedCodes = [...user.twoFactorBackupCodes];
    updatedCodes.splice(codeIndex, 1);

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorBackupCodes: updatedCodes }
    });

    return true;
  }

  private generateBackupCodes(): string[] {
    return Array.from({ length: 8 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );
  }

  async disableTwoFactor(userId: string, token: string) {
    const isValid = await this.verifyTwoFactor(userId, token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      }
    });

    return { success: true };
  }
}