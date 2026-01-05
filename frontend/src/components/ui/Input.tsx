import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
}

export function Input({ 
  label, 
  error, 
  help, 
  className, 
  type = 'text', 
  required,
  ...props 
}: InputProps) {
  const inputId = useId();
  const errorId = useId();
  const helpId = useId();
  
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="text-sm font-medium text-gray-900 block"
        >
          {label}
          {required && (
            <span className="text-red-600 ml-1" aria-label="required">*</span>
          )}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={cn(
          'flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
          'transition-colors duration-200',
          error && 'border-red-500 focus:ring-red-600 focus:border-red-600',
          className
        )}
        aria-required={required ? 'true' : 'false'}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error ? errorId : help ? helpId : undefined
        }
        required={required}
        {...props}
      />
      {help && !error && (
        <p id={helpId} className="text-sm text-gray-600">
          {help}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-600 flex items-start gap-1" role="alert">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}