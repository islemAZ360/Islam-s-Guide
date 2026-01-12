import React, { useMemo, useRef } from 'react';
import { Check, X, Stethoscope, BrainCircuit, Calendar as CalendarIcon, Target, Crosshair } from 'lucide-react';

// المكونات
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

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
    const todayRef = useRef<HTMLDivElement>(null);

    const unitLabel = userProfile?.medUnit || 'mg';
    const isDoctorPlan = userProfile?.planType === 'manual';
    const dir = language === 'ar' ? 'rtl' : 'ltr';

    // 1. Memoize Data Calculation for Performance
    const { weekDays, calendarGrid } = useMemo(() => {
        const daysMap: Record<string, string[]> = {
            ar: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
            en: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            ru: ['Сб', 'Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт']
        };
        
        const wDays = daysMap[language] || daysMap['en'];
        
        // Calculate padding blanks for the first row
        const startDate = new Date(plan[0]?.date || new Date());
        // Adjust getDay() to match Saturday start (0=Sat in this logic)
        // Standard getDay(): 0=Sun, 1=Mon... 6=Sat
        // We want Sat=0, Sun=1... Fri=6
        // (day + 1) % 7 gives: Sat(6)->0, Sun(0)->1 ... Fri(5)->6
        const startDayIndex = (startDate.getDay() + 1) % 7; 
        const blanks = Array.from({ length: startDayIndex });

        return { weekDays: wDays, calendarGrid: { blanks, days: plan } };
    }, [plan, language]);

    // 2. Scroll to Today Action
    const scrollToToday = () => {
        if (todayRef.current) {
            todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            todayRef.current.focus(); // Accessibility focus
        }
    };

    // Helper to generate accessible label
    const getAriaLabel = (day: PlanDay, log?: DailyLog, isToday?: boolean) => {
        const dateStr = new Date(day.date).toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' });
        let status = language === 'ar' ? 'مجدول' : 'Scheduled';
        
        if (isToday) status = language === 'ar' ? 'اليوم الحالي' : 'Today';
        else if (log) {
            if (log.doseTaken <= day.plannedDose) status = language === 'ar' ? 'تم بنجاح' : 'Completed';
            else status = language === 'ar' ? 'تجاوز الجرعة' : 'Dose Exceeded';
        } else if (day.isPast) {
            status = language === 'ar' ? 'فائت' : 'Missed';
        }

        return `${dateStr}. ${language === 'ar' ? 'الهدف' : 'Target'}: ${day.plannedDose}${unitLabel}. ${language === 'ar' ? 'الحالة' : 'Status'}: ${status}.`;
    };

    return (
      <LayoutContainer>
        <PageHeader 
            title={t('nav_calendar')}
            subtitle={language === 'ar' ? "خارطة الطريق نحو التعافي." : "Your recovery roadmap."}
            action={
                <div className="flex gap-2 items-center">
                    <Button onClick={scrollToToday} variant="secondary" className="!py-2 !px-4 !text-xs !rounded-xl hidden md:flex">
                        <Crosshair size={16} className="mr-2" /> {language === 'ar' ? 'اذهب لليوم' : 'Jump to Today'}
                    </Button>
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
          
          {/* Header & Legend */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
              <div className="flex flex-wrap gap-4 text-[10px] md:text-xs font-bold text-slate-400" role="list" aria-label="Status Legend">
                  <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-white/5" role="listitem">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" aria-hidden="true"></span> 
                      {language === 'ar' ? 'التزام تام' : 'Completed'}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-white/5" role="listitem">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" aria-hidden="true"></span> 
                      {language === 'ar' ? 'تجاوز / تعثر' : 'Missed/Over'}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-white/5" role="listitem">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" aria-hidden="true"></span> 
                      {language === 'ar' ? 'اليوم الحالي' : 'Today'}
                  </div>
              </div>
              
              <div className="text-slate-500 text-xs flex items-center gap-2 font-mono bg-slate-950/30 px-3 py-1 rounded-md">
                  <CalendarIcon size={14}/> {new Date().toLocaleDateString(language, { month: 'long', year: 'numeric' })}
              </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4" dir={dir} role="row">
            {weekDays.map(d => (
              <div key={d} className="text-center text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-wider py-2" role="columnheader">
                  {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 md:gap-4" dir={dir} role="grid" aria-label="Recovery Plan Calendar">
            
            {/* Empty Slots */}
            {calendarGrid.blanks.map((_, i) => (
                <div key={`blank-${i}`} className="min-h-[80px] md:min-h-[120px] bg-slate-900/20 rounded-2xl border border-white/5 opacity-30" aria-hidden="true" />
            ))}

            {/* Plan Days */}
            {calendarGrid.days.map((day, idx) => {
              const isToday = day.date === todayDate;
              const log = logs.find(l => l.date === day.date);
              const isPast = day.date < todayDate;
              
              // Dynamic Styling
              let containerClass = "bg-slate-900/40 border-white/5 text-slate-500 hover:border-white/10";
              let statusGlow = "";
              let activeIndicator = null;

              if (isToday) {
                  containerClass = "bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10 scale-[1.02] z-10 ring-1 ring-indigo-500/50";
                  statusGlow = "shadow-[0_0_15px_rgba(99,102,241,0.2)]";
              } else if (log) {
                  if (log.doseTaken <= day.plannedDose) { 
                      containerClass = "bg-emerald-900/20 border-emerald-500/30 text-emerald-100 hover:bg-emerald-900/30";
                  } else { 
                      containerClass = "bg-rose-900/20 border-rose-500/30 text-rose-100 hover:bg-rose-900/30";
                  }
              } else if (isPast) {
                  containerClass = "bg-slate-950/40 border-white/5 opacity-50 grayscale border-dashed";
              }

              return (
                <div 
                    key={idx}
                    ref={isToday ? todayRef : null}
                    tabIndex={isToday || log ? 0 : -1}
                    role="gridcell"
                    aria-label={getAriaLabel(day, log, isToday)}
                    className={`
                        relative rounded-2xl p-2 md:p-3 min-h-[80px] md:min-h-[120px] flex flex-col justify-between 
                        transition-all duration-300 border backdrop-blur-sm group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500
                        ${containerClass} ${statusGlow}
                    `}
                >
                   {/* Date & Status Icon */}
                   <div className="flex justify-between items-start">
                        <span className={`text-[10px] md:text-sm font-bold opacity-80 font-mono`}>
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
                  
                  {/* Dose Info */}
                  <div className="text-center my-1 md:my-2">
                    <span className={`text-lg md:text-3xl font-black tracking-tight ${isToday ? 'text-white' : ''}`}>
                      {day.plannedDose}
                    </span>
                    <span className="text-[8px] md:text-[10px] block uppercase font-bold opacity-60">
                        {unitLabel}
                    </span>
                  </div>

                  {/* Mood Bar (Footer) */}
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mt-1 border border-white/5">
                      {log ? (
                          <div className={`h-full w-full ${
                              log.mood === 'good' ? 'bg-emerald-400' : 
                              log.mood === 'bad' ? 'bg-rose-400' : 'bg-amber-400'
                          }`} />
                      ) : isPast ? (
                          <div className="h-full w-full bg-rose-900/30 striped-bg" />
                      ) : (
                          <div className="h-full w-1/3 bg-slate-700 rounded-full opacity-30" />
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