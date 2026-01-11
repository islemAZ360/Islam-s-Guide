import React from 'react';
import { Check, X, Stethoscope, BrainCircuit, Calendar as CalendarIcon } from 'lucide-react';

// المكونات
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

import { PlanDay, DailyLog, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface CalendarViewProps {
    plan: PlanDay[];
    logs: DailyLog[];
    todayDate: string;
    userProfile?: UserProfile | null; 
}

export const CalendarView = ({ plan, logs, todayDate, userProfile }: CalendarViewProps) => {
    const { t, language } = useLanguage();

    // 1. ضبط بداية الشهر
    const startDate = new Date(plan[0]?.date || new Date());
    const startDayIndex = (startDate.getDay() + 1) % 7; 
    const blanks = Array.from({ length: startDayIndex });

    const unitLabel = userProfile?.medUnit || 'mg';
    const isDoctorPlan = userProfile?.planType === 'manual';

    const daysMap: Record<string, string[]> = {
        ar: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
        en: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        ru: ['Сб', 'Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт']
    };
    
    const weekDays = daysMap[language] || daysMap['en'];
    const dir = language === 'ar' ? 'rtl' : 'ltr';

    return (
      <LayoutContainer>
        <PageHeader 
            title={t('nav_calendar')}
            subtitle={language === 'ar' ? "خارطة الطريق نحو التعافي." : "Your recovery roadmap."}
            action={
                <div className="flex gap-2">
                    {isDoctorPlan ? (
                        <Badge color="indigo" className="!text-xs md:!text-sm !py-2 !px-4 shadow-lg shadow-indigo-500/20">
                            <Stethoscope size={16} className="mr-2" /> {language === 'ar' ? 'خطة الطبيب' : 'Doctor Plan'}
                        </Badge>
                    ) : (
                        <Badge color="emerald" className="!text-xs md:!text-sm !py-2 !px-4 shadow-lg shadow-emerald-500/20">
                            <BrainCircuit size={16} className="mr-2" /> {t('path_algo')}
                        </Badge>
                    )}
                </div>
            }
        />
        
        <Card className="overflow-hidden border-white/10 shadow-2xl !p-6 relative bg-slate-900/80">
          
          {/* Legend (مفتاح الخريطة) - تصميم جديد */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
              <div className="flex gap-4 text-[10px] md:text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> {language === 'ar' ? 'تم' : 'Done'}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span> {language === 'ar' ? 'تجاوز' : 'Over'}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span> {language === 'ar' ? 'اليوم' : 'Today'}
                  </div>
              </div>
              
              <div className="text-slate-500 text-xs flex items-center gap-2">
                  <CalendarIcon size={14}/> {new Date().toLocaleDateString(language, { month: 'long', year: 'numeric' })}
              </div>
          </div>

          {/* ترويسة أيام الأسبوع */}
          <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4" dir={dir}>
            {weekDays.map(d => (
              <div key={d} className="text-center text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-wider py-2">
                  {d}
              </div>
            ))}
          </div>

          {/* شبكة الأيام */}
          <div className="grid grid-cols-7 gap-2 md:gap-4" dir={dir}>
            {/* الأيام الفارغة */}
            {blanks.map((_, i) => <div key={`blank-${i}`} className="min-h-[80px] md:min-h-[120px]" />)}

            {plan.map((day, idx) => {
              const isToday = day.date === todayDate;
              const log = logs.find(l => l.date === day.date);
              const isPast = day.date < todayDate;
              
              // تحديد الستايل بناءً على الحالة
              let containerClass = "bg-slate-900/40 border-white/5 text-slate-500";
              let statusGlow = "";

              if (isToday) {
                  containerClass = "bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10 scale-105 z-10";
                  statusGlow = "shadow-[0_0_15px_rgba(99,102,241,0.3)]";
              } else if (log) {
                  if (log.doseTaken <= day.plannedDose) { 
                      containerClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-100 hover:bg-emerald-500/20";
                  } else { 
                      containerClass = "bg-rose-500/10 border-rose-500/20 text-rose-100 hover:bg-rose-500/20";
                  }
              } else if (isPast) {
                  containerClass = "bg-slate-950/20 border-white/5 opacity-60 grayscale border-dashed";
              }

              return (
                <div 
                    key={idx} 
                    className={`
                        relative rounded-2xl p-2 md:p-3 min-h-[80px] md:min-h-[120px] flex flex-col justify-between 
                        transition-all duration-300 border backdrop-blur-sm group hover:scale-[1.02]
                        ${containerClass} ${statusGlow}
                    `}
                >
                   {/* رأس الخلية: التاريخ */}
                   <div className="flex justify-between items-start">
                        <span className={`text-[10px] md:text-sm font-bold opacity-70`}>
                            {day.date.slice(8)}
                        </span>
                        
                        {log && (
                            <div className={`p-1 rounded-full ${log.doseTaken <= day.plannedDose ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>
                                {log.doseTaken <= day.plannedDose ? <Check size={10} strokeWidth={4} /> : <X size={10} strokeWidth={4} />}
                            </div>
                        )}
                        
                        {isToday && !log && (
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_10px_#818cf8]"></div>
                        )}
                   </div>
                  
                  {/* محتوى الخلية: الجرعة */}
                  <div className="text-center my-1 md:my-2">
                    <span className={`text-lg md:text-3xl font-black tracking-tight ${isToday ? 'text-white' : ''}`}>
                      {day.plannedDose}
                    </span>
                    <span className="text-[8px] md:text-[10px] block uppercase font-bold opacity-60">
                        {unitLabel}
                    </span>
                  </div>

                  {/* ذيل الخلية: شريط الحالة */}
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                      {log ? (
                          <div className={`h-full w-full ${
                              log.mood === 'good' ? 'bg-emerald-400' : 
                              log.mood === 'bad' ? 'bg-rose-400' : 'bg-amber-400'
                          }`}></div>
                      ) : isPast ? (
                          <div className="h-full w-full bg-rose-900/50"></div>
                      ) : (
                          <div className="h-full w-1/3 bg-slate-600 rounded-full opacity-20"></div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </LayoutContainer>
    );
};