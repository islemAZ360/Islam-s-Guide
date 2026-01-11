import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  hoverEffect?: boolean; // خاصية جديدة لتفعيل تأثير التحويم
}

export const Card = ({ 
  children, 
  className = '', 
  noPadding = false,
  hoverEffect = false 
}: CardProps) => {
  return (
    <div 
      className={`
        glass rounded-3xl relative overflow-hidden 
        transition-transform duration-300 ease-out
        ${hoverEffect ? 'hover:scale-[1.02] cursor-pointer hover:border-indigo-500/30' : 'hover:border-white/20'}
        ${!noPadding ? 'p-6 md:p-8' : ''} 
        ${className}
      `}
    >
      {/* طبقة إضاءة خفيفة جداً من الأعلى لليسار لإعطاء عمق */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
      
      {/* المحتوى */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};