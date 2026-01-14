import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, Activity, Edit3, Sparkles, ChevronDown } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { useLanguage } from '../../contexts/LanguageContext';
import { PlanDay, DailyLog, UserProfile } from '../../types';

interface DashboardHeaderProps {
    todayPlan: PlanDay | undefined;
    todayLog: DailyLog | undefined;
    progressPercentage: number;
    totalDays: number;
    daysCompleted: number;
    userProfile: UserProfile | null;
    children?: React.ReactNode; 
}

export const DashboardHeader = ({
    todayPlan,
    todayLog,
    progressPercentage,
    totalDays,
    daysCompleted,
    userProfile,
    children
}: DashboardHeaderProps) => {
    const { t, language } = useLanguage();
    const unitLabel = userProfile?.medUnit || 'mg';
    const doseValue = todayPlan ? todayPlan.plannedDose : 0;
    
    // Local state to toggle between "Success Banner" and "Edit Form"
    const [isEditing, setIsEditing] = useState(false);

    return (
        <section 
            className="lg:col-span-8"
            aria-label={language === 'ar' ? 'ملخص اليوم' : 'Daily Summary'}
        >
            <div className="relative w-full overflow-hidden rounded-[3rem] border border-white/10 shadow-2xl bg-[#0B0F17] group transition-all duration-500">
                
                {/* 1. Dynamic Background System (Improved) */}
                <div className="absolute inset-0">
                    {/* Deep Mesh Gradient */}
                    <div className="absolute top-0 left-0 w-full h-[120%] bg-gradient-to-b from-indigo-950/50 via-[#050b14] to-[#020617]"></div>
                    
                    {/* Glowing Orbs */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse-glow"></div>
                    <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-violet-900/10 to-transparent opacity-60"></div>
                    
                    {/* Noise Texture for realism */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
                </div>

                <div className="relative z-10 p-8 md:p-10 flex flex-col h-full">
                    
                    {/* Top Row: Dose & Progress */}
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10 mb-8">
                        
                        {/* LEFT: Dose Counter (Massive Hero) */}
                        <div className="flex flex-col items-center md:items-start relative">
                            <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                                <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-widest">
                                    {t('target_dose')}
                                </span>
                            </div>
                            
                            <div className="relative flex items-end leading-none">
                                <span className="text-[8rem] md:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-100 to-indigo-300/50 tracking-tighter drop-shadow-2xl filter contrast-125">
                                    {doseValue}
                                </span>
                                <span className="text-2xl md:text-3xl font-bold text-indigo-400/60 mb-8 md:mb-10 ml-2">{unitLabel}</span>
                                
                                {/* Glow behind text */}
                                <div className="absolute inset-0 bg-indigo-500/10 blur-3xl -z-10 rounded-full"></div>
                            </div>
                        </div>

                        {/* RIGHT: Progress Ring (Floating Widget) */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"></div>
                            <div className="bg-[#0f172a]/80 backdrop-blur-2xl p-5 rounded-[2.5rem] border border-white/10 shadow-2xl relative ring-1 ring-white/5">
                                <ProgressRing 
                                    radius={70} 
                                    stroke={12} 
                                    progress={progressPercentage} 
                                    totalSteps={totalDays - daysCompleted}
                                    label={language === 'ar' ? 'التقدم العام' : 'Overall Progress'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Content Area (Form or Success) */}
                    <div aria-live="polite" className="mt-auto w-full transition-all duration-500">
                        {todayLog && !isEditing ? (
                            // SUCCESS BANNER (Redesigned)
                            <div className="relative group/banner cursor-default">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-3xl blur-xl opacity-0 group-hover/banner:opacity-100 transition-opacity duration-700"></div>
                                <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-[#0f172a]/60 backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
                                    
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
                                            <CheckCircle size={32} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-2xl font-black text-white tracking-tight">{t('documented')}</h3>
                                                <Sparkles size={18} className="text-yellow-400 animate-pulse" />
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-sm font-medium">
                                                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                                    {todayLog.doseTaken} {unitLabel}
                                                </span>
                                                <span className={`px-3 py-1 rounded-lg border bg-white/5 ${
                                                    todayLog.mood === 'good' ? 'text-emerald-300 border-emerald-500/20' : 
                                                    todayLog.mood === 'normal' ? 'text-amber-300 border-amber-500/20' : 'text-rose-300 border-rose-500/20'
                                                }`}>
                                                    {todayLog.mood === 'good' ? t('excellent') : todayLog.mood === 'normal' ? t('stable') : t('bad')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="w-full md:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-white/10"
                                    >
                                        <Edit3 size={16} /> {language === 'ar' ? 'تعديل' : 'Edit'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // INPUT FORM CONTAINER
                            <div className="relative animate-in slide-in-from-bottom-4 duration-500">
                                {isEditing && (
                                    <div className="flex justify-between items-center mb-4 px-2">
                                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest animate-pulse">
                                            {language === 'ar' ? 'وضع التعديل' : 'Editing Mode'}
                                        </span>
                                        <button 
                                            onClick={() => setIsEditing(false)}
                                            className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800/50 px-3 py-1.5 rounded-lg transition-colors border border-white/5"
                                        >
                                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                        </button>
                                    </div>
                                )}
                                <div className="bg-[#0f172a]/60 border border-white/5 rounded-[2rem] p-6 md:p-8 backdrop-blur-md shadow-2xl ring-1 ring-white/5">
                                    {children}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};