import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'panic';
  children: React.ReactNode;
}

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, ...props }: ButtonProps) => {
  const baseStyle = "relative overflow-hidden px-6 py-4 rounded-2xl font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale group select-none cursor-pointer";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-indigo-400/20",
    secondary: "bg-slate-800/40 backdrop-blur-md text-slate-300 border border-white/5 hover:bg-slate-700/50 hover:text-white hover:border-white/10",
    danger: "bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.4)]",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.3)] border border-emerald-400/20",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
    panic: "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse"
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseStyle} ${selectedVariant} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300 mix-blend-overlay"></div>
      )}
    </button>
  );
};