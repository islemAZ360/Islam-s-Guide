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
      <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg] transform transition-transform duration-700 group-hover:scale-105">
        <circle stroke="#1e293b" strokeWidth={stroke} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} className="opacity-50" />
        <circle stroke="url(#gradient)" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} strokeLinecap="round" fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
        <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#818cf8" /></linearGradient></defs>
      </svg>
      <div className="absolute flex flex-col items-center text-center animate-in fade-in zoom-in duration-700 pointer-events-none">
        <span className="text-3xl md:text-4xl font-black text-white tracking-tighter drop-shadow-lg">{Math.round(progress)}%</span>
        <span className="text-[9px] md:text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">تعافي</span>
        <span className="text-[9px] md:text-[10px] text-slate-400 mt-2 bg-slate-800/80 px-2 py-1 rounded-full border border-slate-700">{totalSteps} {t('days_left').split(' ')[0]}</span>
      </div>
    </div>
  );
};