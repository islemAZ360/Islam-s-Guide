import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card = ({ children, className = '', noPadding = false }: CardProps) => (
  <div className={`bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:border-white/10 transition-all duration-500 ${!noPadding ? 'p-6 md:p-10' : ''} ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
    {children}
  </div>
);