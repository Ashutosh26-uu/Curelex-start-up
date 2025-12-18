import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EnterpriseAuthDto, TwoFactorAuthDto } from '../../../common/dto/enterprise-auth.dto';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class EnterpriseAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async enterpriseAuth(authDto: EnterpriseAuthDto, ipAddress?: string, userAgent?: string) {
    const { identifier, password, fullName, role, action, rememberMe, deviceFingerprint } = authDto;

    if (action === 'signup') {
      return this.handleEnterpriseSignup(identifier, password, fullName, role, deviceFingerprint, ipAddress, userAgent);
    } else {
      return this.handleEnterpriseLogin(identifier, password, rememberMe, deviceFingerprint, ipAddress, userAgent);
    }
  }

  private async handleEnterpriseSignup(
    identifier: string, 
    password: string, 
    fullName: string, 
    role: string,
    deviceFingerprint?: string,
    ipAddress?: string, 
    userAgent?: string
  ) {
    const isEmail = identifier.includes('@');
    
    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: isEmail 
        ? { email: identifier }
        : { profile: { phone: identifier } }
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    if (!fullName) {
      throw new BadRequestException('Full name is required for signup');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    // Generate 2FA secret
    const twoFactorSecret = speakeasy.generateSecret({
      name: `CureLex (${identifier})`,
      issuer: 'CureLex Healthcare'
    });

    const userData: any = {
      password: hashedPassword,
      role: role || 'PATIENT',
      isActive: true,
      twoFactorSecret: twoFactorSecret.base32,
      profile: {
        create: {
          firstName,
          lastName,
        },
      },
    };

    if (isEmail) {
      userData.email = identifier;
      userData.profile.create.phone = '';
    } else {
      userData.email = `${identifier.replace(/[^0-9]/g, '')}@temp.com`;
      userData.profile.create.phone = identifier;
    }

    // Create role-specific data
    if (role === 'PATIENT' || !role) {
      userData.patient = {
        create: {
          patientId: `PAT-${Date.now()}`,
          status: 'ACTIVE',
        },
      };
    } else if (role === 'DOCTOR') {
      userData.doctor = {
        create: {
          doctorId: `DOC-${Date.now()}`,
          specialization: 'General Medicine',
          isAvailable: true,
        },
      };
    }

    const user = await this.prisma.user.create({
      data: userData,
      include: { profile: true, patient: true, doctor: true },
    });

    // Register device if fingerprint provided
    if (deviceFingerprint) {
      await this.registerDevice(user.id, deviceFingerprint, userAgent, ipAddress);
    }

    // Generate QR code for 2FA setup
    const qrCodeUrl = await QRCode.toDataURL(twoFactorSecret.otpauth_url);

    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
      twoFactorSetup: {
        secret: twoFactorSecret.base32,
        qrCode: qrCodeUrl,
        backupCodes: this.generateBackupCodes()
      }
    };
  }

  private async handleEnterpriseLogin(
    identifier: string, 
    password: string, 
    rememberMe?: boolean,
    deviceFingerprint?: string,
    ipAddress?: string, 
    userAgent?: string
  ) {
    const isEmail = identifier.includes('@');
    
    const user = await this.prisma.user.findFirst({
      where: isEmail 
        ? { email: identifier }
        : { profile: { phone: identifier } },
      include: { profile: true, patient: true, doctor: true },
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if device is trusted
    const isTrustedDevice = deviceFingerprint ? 
      await this.isDeviceTrusted(user.id, deviceFingerprint) : false;

    // Require 2FA if enabled and device not trusted
    if (user.twoFactorEnabled && !isTrustedDevice) {
      return {
        requiresTwoFactor: true,
        userId: user.id,
        message: 'Two-factor authentication required'
      };
    }

    // Register new device
    if (deviceFingerprint && !isTrustedDevice) {
      await this.registerDevice(user.id, deviceFingerprint, userAgent, ipAddress);
    }

    const tokens = this.generateTokens(user, rememberMe);

    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }

  async verifyTwoFactor(twoFactorDto: TwoFactorAuthDto) {
    const { userId, code, backupCode } = twoFactorDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, patient: true, doctor: true }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    let isValid = false;

    if (code) {
      // Verify TOTP code
      isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 2
      });
    } else if (backupCode) {
      // Verify backup code
      const backupCodes = user.backupCodes || [];
      isValid = backupCodes.includes(backupCode);
      
      if (isValid) {
        // Remove used backup code
        const updatedCodes = backupCodes.filter(c => c !== backupCode);
        await this.prisma.user.update({
          where: { id: userId },
          data: { backupCodes: updatedCodes }
        });
      }
    }

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }

  private async registerDevice(userId: string, fingerprint: string, userAgent?: string, ipAddress?: string) {
    return this.prisma.trustedDevice.create({
      data: {
        userId,
        deviceFingerprint: fingerprint,
        deviceName: this.extractDeviceName(userAgent),
        userAgent,
        ipAddress,
        lastUsed: new Date()
      }
    });
  }

  private async isDeviceTrusted(userId: string, fingerprint: string): Promise<boolean> {
    const device = await this.prisma.trustedDevice.findFirst({
      where: {
        userId,
        deviceFingerprint: fingerprint,
        isActive: true
      }
    });

    if (device) {
      // Update last used
      await this.prisma.trustedDevice.update({
        where: { id: device.id },
        data: { lastUsed: new Date() }
      });
      return true;
    }

    return false;
  }

  private generateTokens(user: any, rememberMe = false) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessTokenExpiry = rememberMe ? '7d' : '24h';
    const refreshTokenExpiry = rememberMe ? '90d' : '30d';

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: accessTokenExpiry }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: refreshTokenExpiry }),
    };
  }

  private sanitizeUser(user: any) {
    const { password, twoFactorSecret, backupCodes, ...sanitized } = user;
    return sanitized;
  }

  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substr(2, 8).toUpperCase());
    }
    return codes;
  }

  private extractDeviceName(userAgent?: string): string {
    if (!userAgent) return 'Unknown Device';
    
    if (userAgent.includes('Mobile')) return 'Mobile Device';
    if (userAgent.includes('Tablet')) return 'Tablet';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux PC';
    
    return 'Unknown Device';
  }
}