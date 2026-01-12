import React, { memo, forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'panic';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(({ 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false, 
  isLoading = false,
  type = 'button', // Default to 'button' to prevent accidental form submission
  leftIcon,
  rightIcon,
  ...props 
}, ref) => {
  
  // Base styles focusing on Accessibility (Focus rings) and Touch Targets
  const baseStyle = `
    relative overflow-hidden px-6 py-4 rounded-2xl font-bold tracking-wide select-none 
    transition-all duration-300 ease-out
    flex items-center justify-center gap-3
    focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
    disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
    active:scale-[0.98] group
  `;
  
  // Variants with high contrast and distinct states
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/20 hover:shadow-indigo-500/40 hover:border-indigo-400/40 focus-visible:ring-indigo-500",
    
    secondary: "bg-slate-800/50 backdrop-blur-sm border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-white/20 focus-visible:ring-slate-500",
    
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/20 focus-visible:ring-rose-500",
    
    success: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/20 hover:shadow-emerald-500/40 focus-visible:ring-emerald-500",
    
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border border-transparent focus-visible:ring-indigo-400",
    
    panic: "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/40 animate-pulse-glow border border-rose-400/30 focus-visible:ring-rose-500"
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button 
      ref={ref}
      type={type}
      disabled={disabled || isLoading} 
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      className={`${baseStyle} ${selectedVariant} ${className}`}
      {...props}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}

      {/* Content */}
      <span className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </span>

      {/* Shine Effect for Primary/Success variants */}
      {(variant === 'primary' || variant === 'success' || variant === 'panic') && !disabled && !isLoading && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 ease-in-out pointer-events-none"></div>
      )}
    </button>
  );
}));

Button.displayName = 'Button';