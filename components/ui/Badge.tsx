import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'indigo' | 'green' | 'emerald' | 'red' | 'rose' | 'amber' | 'blue';
  className?: string;
}

export const Badge = ({ children, color = 'indigo', className = '' }: BadgeProps) => {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    red: 'bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
  };

  const selectedColor = colors[color] || colors.indigo;

  return (
    <span className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold border ${selectedColor} backdrop-blur-md flex items-center gap-1.5 animate-in fade-in zoom-in duration-300 whitespace-nowrap w-fit ${className}`}>
      {children}
    </span>
  );
};