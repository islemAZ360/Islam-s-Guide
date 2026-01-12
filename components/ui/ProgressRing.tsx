import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number;
  totalSteps?: number;
  label?: string;
}

export const ProgressRing = ({ radius, stroke, progress, totalSteps, label }: ProgressRingProps) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Ensure progress is clamped 0-100 for safety
  const safeProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (safeProgress / 100) * circumference;
  
  const { t, language } = useLanguage();

  return (
    <div 
      className="relative flex items-center justify-center group cursor-default"
      role="progressbar"
      aria-valuenow={Math.round(safeProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || (language === 'ar' ? 'نسبة التعافي' : 'Recovery Progress')}
      aria-valuetext={`${Math.round(safeProgress)}%`}
    >
      {/* خلفية متوهجة خلف الحلقة - تحترم إعدادات تقليل الحركة */}
      <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-700 animate-pulse-glow motion-reduce:animate-none"></div>
      
      <svg 
        height={radius * 2} 
        width={radius * 2} 
        className="rotate-[-90deg] transform transition-transform duration-700 group-hover:scale-105 relative z-10 motion-reduce:transition-none"
        aria-hidden="true"
        focusable="false"
      >
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
            style={{ strokeDashoffset }} 
            className="transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1) motion-reduce:transition-none"
            strokeLinecap="round" 
            fill="transparent" 
            r={normalizedRadius} 
            cx={radius} 
            cy={radius} 
            filter="url(#glow)"
        />
      </svg>
      
      {/* النص في المنتصف - مخفي عن قارئات الشاشة لأن الحاوية توفر المعلومات */}
      <div className="absolute flex flex-col items-center text-center animate-in zoom-in pointer-events-none z-20" aria-hidden="true">
        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white tracking-tighter drop-shadow-2xl">
            {Math.round(safeProgress)}%
        </span>
        <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">
            {language === 'ar' ? 'تعافي' : 'Recovered'}
        </span>
        
        {totalSteps !== undefined && (
            <div className="mt-2 bg-slate-900/80 px-3 py-1 rounded-full border border-white/10 shadow-lg backdrop-blur-md">
                <span className="text-[9px] text-slate-300 font-mono">
                    {totalSteps} {t('days_left').split(' ')[0]}
                </span>
            </div>
        )}
      </div>
    </div>
  );
};