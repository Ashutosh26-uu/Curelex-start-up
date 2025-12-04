'use client';

import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            {...props}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`
              w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };