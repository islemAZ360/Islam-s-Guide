import React from 'react';
import { Check, X, Stethoscope, BrainCircuit } from 'lucide-react';

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

    // 1. حساب إزاحة بداية الشهر (لضبط التقويم)
    // نبدأ الرسم من أول يوم في الخطة
    const startDate = new Date(plan[0]?.date || new Date());
    // في JavaScript: الأحد=0، الاثنين=1... السبت=6
    // نريد أن يبدأ الأسبوع من السبت (Saturday = 0 في مصفوفتنا)
    // معادلة التحويل: (Day + 1) % 7 تجعل السبت هو البداية
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
                        <Badge color="indigo" className="!text-xs md:!text-sm !py-2 !px-3 md:!px-4">
                            <Stethoscope size={14} className="mr-2" /> {language === 'ar' ? 'خطة الطبيب' : 'Doctor Plan'}
                        </Badge>
                    ) : (
                        <Badge color="emerald" className="!text-xs md:!text-sm !py-2 !px-3 md:!px-4">
                            <BrainCircuit size={14} className="mr-2" /> {t('path_algo')}
                        </Badge>
                    )}
                </div>
            }
        />
        
        <Card className="overflow-hidden bg-slate-900/50 border border-white/5 shadow-2xl !p-4 md:!p-6">
          {/* Legend (مفتاح الخريطة) */}
          <div className="flex flex-wrap gap-3 md:gap-4 mb-6 text-[10px] md:text-xs text-slate-400 border-b border-white/5 pb-4">
              <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-[0_0_8px_indigo]"></div> 
                  {language === 'ar' ? 'اليوم' : 'Today'}
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> 
                  {language === 'ar' ? 'تم' : 'Done'}
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> 
                  {language === 'ar' ? 'فائت' : 'Missed'}
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-white/10"></div> 
                  {language === 'ar' ? 'قادم' : 'Future'}
              </div>
          </div>

          {/* ترويسة أيام الأسبوع */}
          <div className="grid grid-cols-7 gap-1 md:gap-4 mb-2" dir={dir}>
            {weekDays.map(d => (
              <div key={d} className="bg-slate-950/50 p-2 text-center text-[9px] md:text-xs font-bold text-slate-500 rounded-lg">
                  {d}
              </div>
            ))}
          </div>

          {/* شبكة الأيام */}
          <div className="grid grid-cols-7 gap-1 md:gap-4" dir={dir}>
            {/* الأيام الفارغة لضبط بداية الشهر */}
            {blanks.map((_, i) => <div key={`blank-${i}`} className="min-h-[60px] md:min-h-[80px]" />)}

            {plan.map((day, idx) => {
              const isToday = day.date === todayDate;
              const log = logs.find(l => l.date === day.date);
              const isPast = day.date < todayDate;
              
              // منطق الألوان
              let bgClass = "bg-slate-900/40 border-white/5";
              let textClass = "text-slate-500";
              let borderClass = "border-white/5";

              if (isToday) {
                  bgClass = "bg-indigo-600/10";
                  borderClass = "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]";
                  textClass = "text-white";
              } else if (log) {
                  if (log.doseTaken <= day.plannedDose) { // التزام جيد
                      bgClass = "bg-emerald-900/10";
                      borderClass = "border-emerald-500/30";
                  } else { // تجاوز
                      bgClass = "bg-rose-900/10";
                      borderClass = "border-rose-500/30";
                  }
              } else if (isPast) {
                  bgClass = "bg-slate-950/30";
                  textClass = "text-slate-600";
                  borderClass = "border-dashed border-slate-700";
              }

              return (
                <div 
                    key={idx} 
                    className={`${bgClass} border ${borderClass} rounded-xl p-1.5 md:p-3 min-h-[70px] md:min-h-[110px] flex flex-col justify-between transition-all duration-300 relative group`}
                >
                   {/* Header: رقم اليوم + الأيقونة */}
                   <div className="flex justify-between items-start">
                        <span className={`text-[9px] md:text-xs font-bold ${textClass}`}>
                            {day.date.slice(8)}
                        </span>
                        
                        {log && (
                            <span className={log.doseTaken <= day.plannedDose ? "text-emerald-400" : "text-rose-400"}>
                                {log.doseTaken <= day.plannedDose ? <Check size={12} className="md:w-4 md:h-4" /> : <X size={12} className="md:w-4 md:h-4" />}
                            </span>
                        )}
                        {isToday && !log && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-500 rounded-full animate-pulse"></div>}
                   </div>
                  
                  {/* Content: الجرعة */}
                  <div className="text-center mt-1">
                    <span className={`text-sm md:text-2xl font-black ${isToday ? 'text-white' : isPast && !log ? 'text-slate-600' : 'text-slate-300'}`}>
                      {day.plannedDose}
                    </span>
                    <span className="text-[7px] md:text-[10px] block uppercase text-slate-600 font-bold scale-90 md:scale-100">
                        {unitLabel}
                    </span>
                  </div>

                  {/* Footer: شريط الحالة المزاجية */}
                  {log && (
                      <div className={`h-1 w-full rounded-full mt-1.5 md:mt-2 ${
                          log.mood === 'good' ? 'bg-emerald-500' : 
                          log.mood === 'bad' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </LayoutContainer>
    );
};