import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  fullWidth?: boolean;
}

const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] relative overflow-hidden';

const variants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-300 shadow-sm hover:shadow-md',
  outline: 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-300 shadow-sm hover:shadow-md',
  ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-300 shadow-sm hover:shadow-md',
  success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-300 shadow-sm hover:shadow-md',
};

const sizes = {
  sm: 'h-9 px-3 text-sm min-w-[44px]',
  md: 'h-11 px-4 text-base min-w-[44px]',
  lg: 'h-12 px-6 text-lg min-w-[44px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ 
  variant = 'default', 
  size = 'md', 
  loading = false, 
  className, 
  children, 
  disabled,
  ariaLabel,
  ariaDescribedBy,
  fullWidth = false,
  onClick,
  ...props 
}, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseStyles, 
        variants[variant], 
        sizes[size], 
        fullWidth && 'w-full',
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <>
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </>
      )}
      <span className={cn('transition-opacity', loading && 'opacity-75')}>
        {children}
      </span>
    </button>
  );
});

Button.displayName = 'Button';