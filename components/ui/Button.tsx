import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'panic';
  children: React.ReactNode;
  isLoading?: boolean; // خاصية جديدة للتحميل
}

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false, 
  isLoading = false,
  ...props 
}: ButtonProps) => {
  
  // التصميم الأساسي المشترك
  const baseStyle = "relative overflow-hidden px-6 py-4 rounded-2xl font-bold transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2 tracking-wide select-none disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 group";
  
  // الأنماط المختلفة
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/20 hover:shadow-indigo-500/40 hover:border-indigo-400/40",
    
    secondary: "bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20",
    
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/20 transition-colors",
    
    success: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/20 hover:shadow-emerald-500/40",
    
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border border-transparent",
    
    panic: "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/40 animate-pulse-glow border border-rose-400/30"
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || isLoading} 
      className={`${baseStyle} ${selectedVariant} ${className}`}
      {...props}
    >
      {/* مؤشر التحميل */}
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      ) : (
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      )}

      {/* تأثير اللمعان (Shine Effect) - يعمل فقط على الأزرار الملونة */}
      {(variant === 'primary' || variant === 'success') && !disabled && !isLoading && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 ease-in-out pointer-events-none"></div>
      )}
    </button>
  );
};