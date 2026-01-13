import React from 'react';

type BadgeColor = 'indigo' | 'green' | 'emerald' | 'red' | 'rose' | 'amber' | 'blue' | 'slate';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  className?: string;
  'aria-label'?: string;
}

export const Badge = ({ 
  children, 
  color = 'indigo', 
  size = 'md',
  className = '',
  'aria-label': ariaLabel
}: BadgeProps) => {
  
  // Color Variants with high contrast for dark mode
  const colorStyles: Record<BadgeColor, string> = {
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.15)]',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    red: 'bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]',
    slate: 'bg-slate-700/30 text-slate-300 border-slate-600/30',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] md:text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  const selectedColor = colorStyles[color] || colorStyles.indigo;
  const selectedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span 
      className={`
        inline-flex items-center justify-center gap-1.5 
        rounded-full font-bold uppercase tracking-wider 
        border backdrop-blur-md 
        transition-all duration-300 hover:brightness-110
        ${selectedColor} ${selectedSize} ${className}
      `}
      aria-label={ariaLabel}
    >
      {children}
    </span>
  );
};