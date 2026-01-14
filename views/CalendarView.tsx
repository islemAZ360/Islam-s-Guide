import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Check, X, Stethoscope, BrainCircuit, Calendar as CalendarIcon, Target, Crosshair, ChevronLeft, ChevronRight, Edit2, Save } from 'lucide-react';

// المكونات
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

import { PlanDay, DailyLog, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';

interface CalendarViewProps {
    plan: PlanDay[];
    logs: DailyLog[];
    todayDate: string;
    userProfile?: UserProfile | null; 
}

export const CalendarView = ({ plan, logs, todayDate, userProfile }: CalendarViewProps) => {
    const { t, language, dir } = useLanguage();
    const { setPlan } = useData(); // Import setPlan to save changes
    const todayRef = useRef<HTMLDivElement>(null);

    const unitLabel = userProfile?.medUnit || 'mg';
    const isDoctorPlan = userProfile?.planType === 'manual';

    // State for Month Navigation
    const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

    // State for Editing
    const [editingDate, setEditingDate] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    // Effect to scroll to today on initial load if it's in the view
    useEffect(() => {
        if (todayRef.current) {
            setTimeout(() => {
                todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [currentMonthDate]);

    // 1. Data Calculation for Current Month
    const { weekDays, calendarGrid, monthLabel } = useMemo(() => {
        const daysMap: Record<string, string[]> = {
            ar: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
            en: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            ru: ['Сб', 'Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт']
        };
        
        const wDays = daysMap[language] || daysMap['en'];
        
        // Month Formatting
        const mLabel = currentMonthDate.toLocaleDateString(language, { month: 'long', year: 'numeric' });

        // Filter Plan for Current Month
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth();
        
        // Get number of days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const monthDays: Array<{ date: string, planDay?: PlanDay }> = [];
        for(let d = 1; d <= daysInMonth; d++) {
            // Construct YYYY-MM-DD
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const planItem = plan.find(p => p.date === dateStr);
            monthDays.push({ date: dateStr, planDay: planItem });
        }

        // Calculate padding blanks for the first row (based on 1st of month)
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayIndex = (firstDayOfMonth.getDay() + 1) % 7; 
        const blanks = Array.from({ length: startDayIndex });

        return { 
            weekDays: wDays, 
            calendarGrid: { blanks, days: monthDays },
            monthLabel: mLabel
        };
    }, [plan, language, currentMonthDate]);

    // Navigation Actions
    const nextMonth = () => {
        setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const jumpToToday = () => {
        const now = new Date();
        setCurrentMonthDate(now);
    };

    // Edit Handlers
    const startEditing = (date: string, currentDose: number) => {
        setEditingDate(date);
        setEditValue(currentDose.toString());
    };

    const cancelEditing = () => {
        setEditingDate(null);
        setEditValue('');
    };

    const saveEdit = () => {
        if (!editingDate) return;
        const newDose = parseFloat(editValue);
        
        if (isNaN(newDose) || newDose < 0) {
            alert(language === 'ar' ? 'يرجى إدخال قيمة صحيحة' : 'Please enter a valid dose');
            return;
        }

        // Update the plan array
        const updatedPlan = plan.map(day => {
            if (day.date === editingDate) {
                return { ...day, plannedDose: newDose };
            }
            return day;
        });

        // Save to Context (which syncs to DB)
        setPlan(updatedPlan);
        
        // Reset edit state
        setEditingDate(null);
        setEditValue('');
    };

    // Helper to generate accessible label
    const getAriaLabel = (dayItem: { date: string, planDay?: PlanDay }, log?: DailyLog, isToday?: boolean) => {
        const dateStr = new Date(dayItem.date).toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' });
        
        if (!dayItem.planDay) return `${dateStr} - ${language === 'ar' ? 'لا توجد خطة' : 'No plan'}`;

        let status = language === 'ar' ? 'مجدول' : 'Scheduled';
        
        if (isToday) status = language === 'ar' ? 'اليوم الحالي' : 'Today';
        else if (log) {
            if (log.doseTaken <= dayItem.planDay.plannedDose) status = language === 'ar' ? 'تم بنجاح' : 'Completed';
            else status = language === 'ar' ? 'تجاوز الجرعة' : 'Dose Exceeded';
        } else if (dayItem.planDay.isPast) {
            status = language === 'ar' ? 'فائت' : 'Missed';
        }

        return `${dateStr}. ${language === 'ar' ? 'الهدف' : 'Target'}: ${dayItem.planDay.plannedDose}${unitLabel}. ${language === 'ar' ? 'الحالة' : 'Status'}: ${status}.`;
    };

    return (
      <LayoutContainer>
        <PageHeader 
            title={t('nav_calendar')}
            subtitle={language === 'ar' ? "خارطة الطريق نحو التعافي." : "Your recovery roadmap."}
            action={
                <div className="flex gap-2 items-center">
                    <Button onClick={jumpToToday} variant="secondary" className="!py-2 !px-4 !text-xs !rounded-xl hidden md:flex">
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
          
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
              
              {/* Month Navigator */}
              <div className="flex items-center gap-4 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5">
                  <button 
                    onClick={prevMonth} 
                    className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label={language === 'ar' ? 'الشهر السابق' : 'Previous Month'}
                  >
                      {dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                  </button>
                  
                  <div className="text-white font-bold text-lg min-w-[140px] text-center flex items-center justify-center gap-2">
                      <CalendarIcon size={18} className="text-indigo-400"/>
                      {monthLabel}
                  </div>

                  <button 
                    onClick={nextMonth} 
                    className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label={language === 'ar' ? 'الشهر التالي' : 'Next Month'}
                  >
                      {dir === 'rtl' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                  </button>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 text-[10px] md:text-xs font-bold text-slate-400" role="list" aria-label="Status Legend">
                  <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5" role="listitem">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" aria-hidden="true"></span> 
                      {language === 'ar' ? 'التزام تام' : 'Completed'}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5" role="listitem">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" aria-hidden="true"></span> 
                      {language === 'ar' ? 'تجاوز / تعثر' : 'Missed/Over'}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5" role="listitem">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" aria-hidden="true"></span> 
                      {language === 'ar' ? 'اليوم الحالي' : 'Today'}
                  </div>
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
            {calendarGrid.days.map((item, idx) => {
              const isToday = item.date === todayDate;
              const log = logs.find(l => l.date === item.date);
              const isPast = item.date < todayDate;
              const hasPlan = !!item.planDay;
              const isEditing = editingDate === item.date;
              
              // Dynamic Styling
              let containerClass = hasPlan 
                ? "bg-slate-900/40 border-white/5 text-slate-500 hover:border-white/10" 
                : "bg-slate-950/30 border-transparent opacity-40";
                
              let statusGlow = "";

              if (isToday) {
                  containerClass = "bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10 scale-[1.02] z-10 ring-1 ring-indigo-500/50";
                  statusGlow = "shadow-[0_0_15px_rgba(99,102,241,0.2)]";
              } else if (log && hasPlan) {
                  if (log.doseTaken <= (item.planDay!.plannedDose)) { 
                      containerClass = "bg-emerald-900/20 border-emerald-500/30 text-emerald-100 hover:bg-emerald-900/30";
                  } else { 
                      containerClass = "bg-rose-900/20 border-rose-500/30 text-rose-100 hover:bg-rose-900/30";
                  }
              } else if (isPast && hasPlan) {
                  containerClass = "bg-slate-950/40 border-white/5 opacity-60 grayscale border-dashed";
              }

              return (
                <div 
                    key={idx}
                    ref={isToday ? todayRef : null}
                    tabIndex={isToday || log ? 0 : -1}
                    role="gridcell"
                    aria-label={getAriaLabel(item, log, isToday)}
                    className={`
                        relative rounded-2xl p-2 md:p-3 min-h-[80px] md:min-h-[120px] flex flex-col justify-between 
                        transition-all duration-300 border backdrop-blur-sm group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500
                        ${containerClass} ${statusGlow}
                    `}
                >
                   {/* Date & Status Icon */}
                   <div className="flex justify-between items-start">
                        <span className={`text-[10px] md:text-sm font-bold opacity-80 font-mono ${!hasPlan && 'text-slate-600'}`}>
                            {item.date.split('-')[2]}
                        </span>
                        
                        {log && hasPlan && (
                            <div className={`p-1 rounded-full ${log.doseTaken <= item.planDay!.plannedDose ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>
                                {log.doseTaken <= item.planDay!.plannedDose ? <Check size={10} strokeWidth={4} /> : <X size={10} strokeWidth={4} />}
                            </div>
                        )}
                        
                        {isToday && !log && (
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_10px_#818cf8]"></div>
                        )}
                   </div>
                  
                  {/* Dose Info & Editing */}
                  {hasPlan ? (
                      <>
                        <div className="text-center my-1 md:my-2 relative group/edit">
                            {isEditing ? (
                                <div className="flex flex-col items-center gap-1 animate-in zoom-in">
                                    <input 
                                        type="number" 
                                        value={editValue} 
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-full bg-slate-950/80 border border-indigo-500 rounded px-1 py-0.5 text-center font-black text-sm text-white focus:outline-none"
                                        autoFocus
                                    />
                                    <div className="flex gap-1 justify-center">
                                        <button onClick={saveEdit} className="p-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500 hover:text-white transition-colors"><Check size={12}/></button>
                                        <button onClick={cancelEditing} className="p-1 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500 hover:text-white transition-colors"><X size={12}/></button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <span className={`text-lg md:text-3xl font-black tracking-tight ${isToday ? 'text-white' : ''}`}>
                                        {item.planDay!.plannedDose}
                                    </span>
                                    <span className="text-[8px] md:text-[10px] block uppercase font-bold opacity-60">
                                        {unitLabel}
                                    </span>
                                    
                                    {/* Edit Button for Normal Users Only */}
                                    {!isDoctorPlan && !isPast && (
                                        <button 
                                            onClick={() => startEditing(item.date, item.planDay!.plannedDose)}
                                            className="absolute -top-1 -right-1 p-1 bg-slate-800 rounded-full text-indigo-400 opacity-0 group-hover/edit:opacity-100 transition-opacity hover:bg-indigo-500 hover:text-white border border-white/5"
                                            aria-label="Edit dose"
                                        >
                                            <Edit2 size={10} />
                                        </button>
                                    )}
                                </>
                            )}
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
                      </>
                  ) : (
                      <div className="flex-1 flex items-center justify-center">
                          <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                      </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </LayoutContainer>
    );
};