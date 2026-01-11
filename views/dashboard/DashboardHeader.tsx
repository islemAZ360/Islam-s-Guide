import React from 'react';
import { ShieldCheck, CheckCircle } from 'lucide-react';
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
    children?: React.ReactNode; // For the DailyCheckIn component injection
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
    const { t } = useLanguage();
    const unitLabel = userProfile?.medUnit || 'mg';

    return (
        <Card className="lg:col-span-8 bg-gradient-to-br from-[#0f172a] via-[#101626] to-indigo-950/20 min-h-[550px] flex flex-col justify-between !p-8 md:!p-10 border-indigo-500/10 shadow-2xl relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
                {/* Top Section: Target Dose & Progress */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> {t('target_dose')}
                        </h2>
                        <div className="flex items-baseline gap-2 group cursor-default">
                            <span className="text-7xl md:text-9xl font-black text-white tracking-tighter drop-shadow-2xl group-hover:text-indigo-100 transition-colors duration-500">
                                {todayPlan ? todayPlan.plannedDose : 0}
                            </span>
                            <span className="text-2xl text-slate-600 font-bold group-hover:text-slate-500 transition-colors">{unitLabel}</span>
                        </div>
                    </div>

                    <div className="hidden md:block scale-110">
                        <ProgressRing 
                            radius={70} 
                            stroke={8} 
                            progress={progressPercentage} 
                            totalSteps={totalDays - daysCompleted} 
                        />
                    </div>
                </div>

                {/* Interaction Section OR Logged State */}
                {todayLog ? (
                    <div className="mt-8 bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2rem] flex items-center justify-between backdrop-blur-md animate-in zoom-in slide-in-from-bottom-4 duration-700">
                        <div>
                            <p className="text-emerald-400 font-bold text-2xl mb-2">{t('documented')}</p>
                            <div className="space-y-1 text-sm">
                                <p className="text-slate-400 font-medium">{t('dose')}: <span className="text-white font-mono font-bold">{todayLog.doseTaken}{unitLabel}</span></p>
                                <p className="text-slate-400 font-medium">{t('mood')}: <span className="text-white">{todayLog.mood === 'good' ? t('excellent') : todayLog.mood === 'normal' ? t('stable') : t('bad')}</span></p>
                            </div>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-full flex items-center justify-center ring-4 ring-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                            <CheckCircle className="text-emerald-500 w-8 h-8" />
                        </div>
                    </div>
                ) : (
                    <div className="mt-8">
                        {children}
                    </div>
                )}
            </div>
        </Card>
    );
};