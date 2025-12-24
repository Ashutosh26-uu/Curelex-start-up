'use client';

import { ReactNode, useId } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AccessibleFormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  help?: string;
  required?: boolean;
  className?: string;
}

export function AccessibleFormField({ 
  label, 
  children, 
  error, 
  help, 
  required = false,
  className = '' 
}: AccessibleFormFieldProps) {
  const fieldId = useId();
  const errorId = useId();
  const helpId = useId();

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={fieldId}
        className="text-sm font-medium text-gray-900 block"
      >
        {label}
        {required && (
          <span className="text-red-600 ml-1" aria-label="required">*</span>
        )}
      </label>
      
      <div className="relative">
        {children}
      </div>
      
      {help && !error && (
        <p id={helpId} className="text-xs text-gray-600 flex items-start gap-1">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
          {help}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-xs text-red-600 flex items-start gap-1" role="alert">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

interface AccessibleAlertProps {
  type: 'error' | 'success' | 'info' | 'warning';
  title?: string;
  children: ReactNode;
  className?: string;
}

export function AccessibleAlert({ 
  type, 
  title, 
  children, 
  className = '' 
}: AccessibleAlertProps) {
  const alertId = useId();
  
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };
  
  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info,
    warning: AlertCircle
  };
  
  const Icon = icons[type];
  
  return (
    <div
      id={alertId}
      role="alert"
      aria-live="polite"
      className={`border px-4 py-3 rounded-md ${styles[type]} ${className}`}
    >
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1">
          {title && (
            <h3 className="font-medium text-sm mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface AccessibleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export function AccessibleButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ariaLabel,
  ariaDescribedBy
}: AccessibleButtonProps) {
  const baseStyles = 'font-medium rounded-md focus:outline-none focus:ring-4 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-300',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[52px]'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {loading ? (
        <>
          <span className="sr-only">Loading</span>
          <span aria-hidden="true">Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Skip link component for keyboard navigation
export function SkipLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      {children}
    </a>
  );
}

// Screen reader only text
export function ScreenReaderOnly({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}