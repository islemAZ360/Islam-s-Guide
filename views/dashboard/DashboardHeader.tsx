import React from 'react';
import { ShieldCheck, CheckCircle, Activity } from 'lucide-react';
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

    return (
        // تم نقل role و aria-label و col-span إلى عنصر section قياسي لتجنب أخطاء TypeScript
        <section 
            className="lg:col-span-8"
            aria-label={language === 'ar' ? 'ملخص اليوم' : 'Daily Summary'}
        >
            <Card 
                className="min-h-[550px] h-full flex flex-col relative overflow-hidden group border-white/10 shadow-2xl shadow-indigo-900/10" 
                noPadding
            >
                
                {/* 1. خلفية متدرجة داكنة وهادئة */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b] opacity-90" aria-hidden="true"></div>
                
                {/* 2. تأثير إضاءة محيطية (Ambient Light) */}
                <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse-glow pointer-events-none" aria-hidden="true"></div>

                <div className="relative z-10 p-8 md:p-12 flex flex-col h-full justify-between">
                    {/* القسم العلوي: الجرعة والعداد */}
                    <header className="flex justify-between items-start">
                        <div className="space-y-4">
                            <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-[0.2em] flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" aria-hidden="true" /> {t('target_dose')}
                            </h2>
                            
                            <div 
                                className="flex items-baseline gap-2 cursor-default select-none"
                                aria-label={`${language === 'ar' ? 'الجرعة المستهدفة' : 'Target Dose'}: ${doseValue} ${unitLabel}`}
                            >
                                {/* رقم الجرعة بتدرج لوني */}
                                <span 
                                    className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter drop-shadow-xl transition-all duration-500 hover:to-indigo-200"
                                    aria-hidden="true" 
                                >
                                    {doseValue}
                                </span>
                                <span className="text-2xl text-slate-500 font-bold" aria-hidden="true">{unitLabel}</span>
                            </div>
                        </div>

                        {/* عداد التقدم الدائري */}
                        <div className="hidden md:block scale-110 relative" aria-hidden="true">
                            {/* توهج خلف العداد */}
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                            <ProgressRing 
                                radius={70} 
                                stroke={8} 
                                progress={progressPercentage} 
                                totalSteps={totalDays - daysCompleted}
                                label={language === 'ar' ? 'التقدم العام' : 'Overall Progress'}
                            />
                        </div>
                    </header>

                    {/* القسم السفلي: إما رسالة النجاح أو نموذج التسجيل */}
                    <div aria-live="polite" className="mt-8">
                        {todayLog ? (
                            // حالة النجاح (تم التوثيق) - بطاقة زجاجية خضراء
                            <div 
                                className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl flex items-center justify-between backdrop-blur-md animate-in slide-in-from-bottom-4 shadow-lg shadow-emerald-900/10"
                                role="status"
                            >
                                <div>
                                    <p className="text-emerald-400 font-bold text-2xl mb-2 flex items-center gap-2">
                                        {t('documented')} <span className="text-2xl" aria-hidden="true">🎉</span>
                                    </p>
                                    <div className="space-y-1 text-sm text-slate-300">
                                        <p className="flex items-center gap-2">
                                            <Activity size={14} className="text-emerald-500" aria-hidden="true"/>
                                            <span className="text-slate-400">{t('dose')}:</span> 
                                            <span className="text-white font-mono font-bold">{todayLog.doseTaken}{unitLabel}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="w-3.5 h-3.5 rounded-full border border-emerald-500/50 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                            </span>
                                            <span className="text-slate-400">{t('mood')}:</span> 
                                            <span className="text-white">{todayLog.mood === 'good' ? t('excellent') : todayLog.mood === 'normal' ? t('stable') : t('bad')}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-full flex items-center justify-center ring-1 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-pulse-glow">
                                    <CheckCircle className="text-emerald-500 w-8 h-8" aria-hidden="true" />
                                </div>
                            </div>
                        ) : (
                            // نموذج التسجيل (يتم تمريره كـ children)
                            <div className="animate-in slide-in-from-bottom-2">
                                {children}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </section>
    );
};