import React from 'react';
import { Card, PageHeader, LayoutContainer } from '../components/UI';
import { PlanDay, DailyLog, UserProfile } from '../types';

interface CalendarViewProps {
    plan: PlanDay[];
    logs: DailyLog[];
    todayDate: string;
    // إضافة هذا السطر هو ما سيصلح الخطأ في App.tsx
    userProfile?: UserProfile | null; 
}

export const CalendarView = ({ plan, logs, todayDate, userProfile }: CalendarViewProps) => {
    const startDate = new Date(plan[0]?.date || new Date());
    const startDayIndex = (startDate.getDay() + 1) % 7;
    const blanks = Array.from({ length: startDayIndex });

    // تحديد الوحدة بناءً على الملف الشخصي (mg افتراضياً)
    const unitLabel = userProfile?.medUnit || 'mg';

    return (
      <LayoutContainer>
        <PageHeader 
            title="الجدول الزمني الشامل"
            subtitle="نظرة عامة على رحلتك العلاجية بالكامل، من اليوم الأول حتى التعافي."
        />
        
        <Card className="overflow-hidden bg-transparent shadow-none !p-0 border-0" noPadding>
          {/* ترويسة أيام الأسبوع */}
          <div className="grid grid-cols-7 gap-2 md:gap-4 mb-3">
            {['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'].map(d => (
              <div key={d} className="bg-slate-900/40 p-2 md:p-4 text-center text-[10px] md:text-xs font-black text-slate-500 uppercase rounded-2xl border border-white/5">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {blanks.map((_, i) => <div key={`blank-${i}`} />)}

            {plan.map((day, idx) => {
              const isToday = day.date === todayDate;
              const log = logs.find(l => l.date === day.date);
              
              let bgClass = "bg-slate-900/40 border-white/5";
              if (isToday) bgClass = "bg-indigo-600 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] transform scale-105 z-10";
              else if (day.isPast) bgClass = "bg-slate-950/80 border-slate-900 opacity-40 grayscale";

              return (
                <div key={idx} className={`${bgClass} border rounded-2xl md:rounded-3xl p-1 md:p-5 min-h-[90px] md:min-h-[130px] flex flex-col justify-between transition-all duration-300 hover:border-indigo-500/30 relative overflow-hidden group hover:bg-slate-900`}>
                   {isToday && <div className="absolute top-0 right-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full m-2 md:m-3 animate-ping"></div>}
                   {log && <div className={`absolute bottom-0 left-0 right-0 h-1 md:h-1.5 ${log.mood === 'good' ? 'bg-emerald-500' : log.mood === 'bad' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>}
                  
                  <div className="flex justify-between items-start z-10 px-1 md:px-0">
                    <span className={`text-[8px] md:text-xs font-bold ${isToday ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                      {day.date.slice(8)}
                    </span>
                    {log && (
                      <span className="text-sm md:text-2xl animate-in zoom-in">{log.mood === 'good' ? '🤩' : log.mood === 'bad' ? '😖' : '😐'}</span>
                    )}
                  </div>
                  
                  <div className="text-center z-10 mt-1 md:mt-2">
                    <span className={`text-lg md:text-3xl font-black ${isToday ? 'text-white' : 'text-slate-300'}`}>
                      {day.plannedDose}
                    </span>
                    <span className={`text-[7px] md:text-[10px] block uppercase tracking-wider font-bold ${isToday ? 'text-indigo-200' : 'text-slate-600'} mt-0.5`}>
                        {unitLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </LayoutContainer>
    );
};