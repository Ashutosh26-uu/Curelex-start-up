'use client';

import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength = false, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const getPasswordStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      return strength;
    };

    const getStrengthLabel = (strength: number) => {
      switch (strength) {
        case 0:
        case 1:
          return 'Weak';
        case 2:
        case 3:
          return 'Medium';
        case 4:
        case 5:
          return 'Strong';
        default:
          return 'Weak';
      }
    };

    const getStrengthColor = (strength: number) => {
      switch (strength) {
        case 0:
        case 1:
          return 'text-red-600';
        case 2:
        case 3:
          return 'text-yellow-600';
        case 4:
        case 5:
          return 'text-green-600';
        default:
          return 'text-red-600';
      }
    };

    const strength = props.value ? getPasswordStrength(props.value as string) : 0;

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            {...props}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`pr-12 ${className}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
            )}
          </button>
        </div>
        
        {showStrength && props.value && (
          <div className="space-y-1">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded ${
                    level <= strength
                      ? strength <= 2
                        ? 'bg-red-500'
                        : strength <= 3
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs ${getStrengthColor(strength)}`}>
              Password strength: {getStrengthLabel(strength)}
            </p>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';