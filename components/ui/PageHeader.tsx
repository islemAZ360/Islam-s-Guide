import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
  <header 
    className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-8 md:pb-10 relative"
    aria-label={title}
  >
    {/* Text Content */}
    <div className="relative z-10 w-full lg:w-auto max-w-3xl">
      <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight drop-shadow-sm leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-slate-400 font-medium text-sm md:text-lg leading-relaxed max-w-2xl text-balance">
          {subtitle}
        </p>
      )}
    </div>

    {/* Actions Area */}
    {action && (
      <div className="flex flex-wrap gap-3 md:gap-4 relative z-10 w-full lg:w-auto justify-start lg:justify-end">
        {action}
      </div>
    )}

    {/* Decorative Glow */}
    <div 
      className="absolute left-0 top-0 w-64 h-64 bg-indigo-500/10 blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen" 
      aria-hidden="true"
    ></div>
  </header>
);