import React from 'react';
import { Card, PageHeader, LayoutContainer, Badge } from '../components/UI';
import { PlanDay, DailyLog, UserProfile } from '../types';
import { Check, X, Stethoscope, BrainCircuit, Calendar as CalendarIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CalendarViewProps {
    plan: PlanDay[];
    logs: DailyLog[];
    todayDate: string;
    userProfile?: UserProfile | null; 
}

export const CalendarView = ({ plan, logs, todayDate, userProfile }: CalendarViewProps) => {
    const { t, language } = useLanguage();

    // تحديد تاريخ البداية لحساب الفراغات في التقويم
    const startDate = new Date(plan[0]?.date || new Date());
    const startDayIndex = (startDate.getDay() + 1) % 7; // ضبط الترتيب ليبدأ من السبت
    const blanks = Array.from({ length: startDayIndex });

    // تحديد الوحدة بناءً على الملف الشخصي
    const unitLabel = userProfile?.medUnit || 'mg';
    
    // هل الخطة طبية أم خوارزمية؟
    const isDoctorPlan = userProfile?.planType === 'manual';

    // ترجمة أيام الأسبوع
    const daysMap: Record<string, string[]> = {
        ar: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
        en: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        ru: ['Сб', 'Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт']
    };
    
    const weekDays = daysMap[language] || daysMap['en'];

    return (
      <LayoutContainer>
        <PageHeader 
            title={t('nav_calendar')}
            subtitle={language === 'ar' ? "خارطة الطريق نحو التعافي." : "Your recovery roadmap."}
            action={
                <div className="flex gap-2">
                    {isDoctorPlan ? (
                        <Badge color="indigo" className="!text-sm !py-2 !px-4">
                            <Stethoscope size={16} className="mr-2" /> {language === 'ar' ? 'خطة الطبيب' : 'Doctor Plan'}
                        </Badge>
                    ) : (
                        <Badge color="emerald" className="!text-sm !py-2 !px-4">
                            <BrainCircuit size={16} className="mr-2" /> {t('path_algo')}
                        </Badge>
                    )}
                </div>
            }
        />
        
        <Card className="overflow-hidden bg-slate-900/50 border border-white/5 shadow-2xl !p-6">
          {/* Legend / مفتاح الخريطة */}
          <div className="flex flex-wrap gap-4 mb-6 text-xs text-slate-400 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-600"></div> 
                  {language === 'ar' ? 'اليوم الحالي' : language === 'ru' ? 'Сегодня' : 'Today'}
              </div>
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div> 
                  {language === 'ar' ? 'تم الالتزام' : language === 'ru' ? 'Выполнено' : 'Done'}
              </div>
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div> 
                  {language === 'ar' ? 'لم يتم الالتزام' : language === 'ru' ? 'Пропущено' : 'Missed'}
              </div>
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-800 border border-white/10"></div> 
                  {language === 'ar' ? 'القادم' : language === 'ru' ? 'Будущее' : 'Upcoming'}
              </div>
          </div>

          {/* ترويسة أيام الأسبوع */}
          <div className="grid grid-cols-7 gap-2 md:gap-4 mb-3">
            {weekDays.map(d => (
              <div key={d} className="bg-slate-950/50 p-2 md:p-3 text-center text-[10px] md:text-xs font-bold text-slate-500 rounded-xl">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {/* الأيام الفارغة في بداية الشهر/الجدول */}
            {blanks.map((_, i) => <div key={`blank-${i}`} className="min-h-[80px]" />)}

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
                  // إذا تم تسجيل اليوم
                  if (log.doseTaken <= day.plannedDose) { // التزام جيد
                      bgClass = "bg-emerald-900/10";
                      borderClass = "border-emerald-500/30";
                  } else { // تجاوز الجرعة
                      bgClass = "bg-rose-900/10";
                      borderClass = "border-rose-500/30";
                  }
              } else if (isPast) {
                  // يوم ماضي بدون تسجيل
                  bgClass = "bg-slate-950/30";
                  textClass = "text-slate-600";
                  borderClass = "border-dashed border-slate-700";
              }

              return (
                <div key={idx} className={`${bgClass} border ${borderClass} rounded-2xl p-2 md:p-3 min-h-[80px] md:min-h-[110px] flex flex-col justify-between transition-all duration-300 relative group`}>
                   {/* Header: Day & Status Icon */}
                   <div className="flex justify-between items-start">
                        <span className={`text-[10px] md:text-xs font-bold ${textClass}`}>
                            {day.date.slice(8)}
                        </span>
                        
                        {log && (
                            <span className={log.doseTaken <= day.plannedDose ? "text-emerald-400" : "text-rose-400"}>
                                {log.doseTaken <= day.plannedDose ? <Check size={14} /> : <X size={14} />}
                            </span>
                        )}
                        {isToday && !log && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>}
                   </div>
                  
                  {/* Content: Dose */}
                  <div className="text-center mt-1">
                    <span className={`text-lg md:text-2xl font-black ${isToday ? 'text-white' : isPast && !log ? 'text-slate-600' : 'text-slate-300'}`}>
                      {day.plannedDose}
                    </span>
                    <span className="text-[8px] md:text-[10px] block uppercase text-slate-600 font-bold">
                        {unitLabel}
                    </span>
                  </div>

                  {/* Mood Indicator (Bottom Bar) */}
                  {log && (
                      <div className={`h-1 w-full rounded-full mt-2 ${
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