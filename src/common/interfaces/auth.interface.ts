import { UserRole } from '../enums/user-role.enum';

export interface JwtPayload {
  email: string;
  sub: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    profile?: {
      firstName: string;
      lastName: string;
      phone?: string;
    };
  };
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}