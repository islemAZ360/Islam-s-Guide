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
        // استخدام البطاقة مع خلفية مخصصة وتأثيرات بصرية
        <Card className="lg:col-span-8 min-h-[550px] flex flex-col relative overflow-hidden group border-white/10 shadow-2xl shadow-indigo-900/10" noPadding>
            
            {/* 1. خلفية متدرجة داكنة وهادئة */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b] opacity-90"></div>
            
            {/* 2. تأثير إضاءة محيطية (Ambient Light) خلف النص */}
            <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse-glow pointer-events-none"></div>

            <div className="relative z-10 p-8 md:p-12 flex flex-col h-full justify-between">
                {/* القسم العلوي: الجرعة والعداد */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> {t('target_dose')}
                        </h2>
                        <div className="flex items-baseline gap-2 cursor-default select-none">
                            {/* رقم الجرعة بتدرج لوني (Gradient Text) */}
                            <span className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter drop-shadow-xl transition-all duration-500 hover:to-indigo-200">
                                {todayPlan ? todayPlan.plannedDose : 0}
                            </span>
                            <span className="text-2xl text-slate-500 font-bold mb-4">{unitLabel}</span>
                        </div>
                    </div>

                    {/* عداد التقدم الدائري */}
                    <div className="hidden md:block scale-110 relative">
                        {/* توهج خلف العداد */}
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                        <ProgressRing 
                            radius={70} 
                            stroke={8} 
                            progress={progressPercentage} 
                            totalSteps={totalDays - daysCompleted} 
                        />
                    </div>
                </div>

                {/* القسم السفلي: إما رسالة النجاح أو نموذج التسجيل */}
                {todayLog ? (
                    // حالة النجاح (تم التوثيق) - بطاقة زجاجية خضراء
                    <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl flex items-center justify-between backdrop-blur-md animate-in slide-in-from-bottom-4 shadow-lg shadow-emerald-900/10">
                        <div>
                            <p className="text-emerald-400 font-bold text-2xl mb-2 flex items-center gap-2">
                                {t('documented')} <span className="text-2xl">🎉</span>
                            </p>
                            <div className="space-y-1 text-sm">
                                <p className="text-slate-400 font-medium">{t('dose')}: <span className="text-white font-mono font-bold">{todayLog.doseTaken}{unitLabel}</span></p>
                                <p className="text-slate-400 font-medium">{t('mood')}: <span className="text-white">{todayLog.mood === 'good' ? t('excellent') : todayLog.mood === 'normal' ? t('stable') : t('bad')}</span></p>
                            </div>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-full flex items-center justify-center ring-1 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-pulse-glow">
                            <CheckCircle className="text-emerald-500 w-8 h-8" />
                        </div>
                    </div>
                ) : (
                    // نموذج التسجيل (يتم تمريره كـ children)
                    <div className="mt-8 animate-in slide-in-from-bottom-2">
                        {children}
                    </div>
                )}
            </div>
        </Card>
    );
};