import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UnifiedAuthDto } from '../dto/social-login.dto';

@Injectable()
export class UnifiedAuthService {
  constructor(private authService: AuthService) {}

  async unifiedAuth(unifiedAuthDto: UnifiedAuthDto) {
    const { identifier, password, action, fullName, role } = unifiedAuthDto;

    if (action === 'login') {
      // Handle login
      const isEmail = identifier.includes('@');
      
      if (isEmail) {
        return this.authService.patientLogin({ 
          email: identifier, 
          password
        } as any, '', '');
      } else {
        return this.authService.patientLogin({ 
          phone: identifier.startsWith('+91') ? identifier : `+91${identifier}`, 
          password
        } as any, '', '');
      }
    } else if (action === 'signup') {
      // Handle registration
      if (!fullName) {
        throw new BadRequestException('Full name is required for registration');
      }

      const [firstName, ...lastNameParts] = fullName.split(' ');
      const lastName = lastNameParts.join(' ') || '';

      const isEmail = identifier.includes('@');
      const phone = isEmail ? '' : identifier.replace('+91', '');
      const email = isEmail ? identifier : '';

      const registerDto = {
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword: password,
        role: role || 'PATIENT',
        dateOfBirth: '',
        gender: '',
        address: '',
        emergencyContact: '',
        aadharNumber: ''
      };

      return this.authService.patientRegister(registerDto, '', '');
    }

    throw new BadRequestException('Invalid action. Must be login or signup');
  }
}