import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number;
  totalSteps: number;
}

export const ProgressRing = ({ radius, stroke, progress, totalSteps }: ProgressRingProps) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const { t } = useLanguage();

  return (
    <div className="relative flex items-center justify-center group cursor-default">
      {/* خلفية متوهجة خلف الحلقة */}
      <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-700 animate-pulse-glow"></div>
      
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg] transform transition-transform duration-700 group-hover:scale-105 relative z-10">
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            {/* فلتر التوهج */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        
        {/* الحلقة الخلفية (المسار) */}
        <circle 
            stroke="#1e293b" 
            strokeWidth={stroke} 
            fill="transparent" 
            r={normalizedRadius} 
            cx={radius} 
            cy={radius} 
            className="opacity-50" 
        />
        
        {/* الحلقة الأمامية (التقدم) مع التوهج والتدرج */}
        <circle 
            stroke="url(#gradient)" 
            strokeWidth={stroke} 
            strokeDasharray={circumference + ' ' + circumference} 
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} 
            strokeLinecap="round" 
            fill="transparent" 
            r={normalizedRadius} 
            cx={radius} 
            cy={radius} 
            filter="url(#glow)"
        />
      </svg>
      
      {/* النص في المنتصف */}
      <div className="absolute flex flex-col items-center text-center animate-in zoom-in pointer-events-none z-20">
        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white tracking-tighter drop-shadow-2xl">
            {Math.round(progress)}%
        </span>
        <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">تعافي</span>
        
        <div className="mt-2 bg-slate-900/80 px-3 py-1 rounded-full border border-white/10 shadow-lg backdrop-blur-md">
            <span className="text-[9px] text-slate-300 font-mono">
                {totalSteps} {t('days_left').split(' ')[0]}
            </span>
        </div>
      </div>
    </div>
  );
};