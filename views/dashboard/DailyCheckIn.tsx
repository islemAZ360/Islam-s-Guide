import React, { useState } from 'react';
import { Edit3, Frown, Meh, Smile, Moon, Check, BedDouble, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserProfile, PlanDay } from '../../types';

interface DailyCheckInProps {
    userProfile: UserProfile | null;
    todayPlan: PlanDay | undefined;
    selectedDose: number | null;
    setSelectedDose: (n: number | null) => void;
    selectedMood: 'bad' | 'normal' | 'good' | null;
    setSelectedMood: (m: 'bad' | 'normal' | 'good' | null) => void;
    submitDailyLog: (sleep: number, symptoms: string[]) => void;
}

export const DailyCheckIn = ({
    userProfile,
    todayPlan,
    selectedDose,
    setSelectedDose,
    selectedMood,
    setSelectedMood,
    submitDailyLog
}: DailyCheckInProps) => {
    const { t, language } = useLanguage();
    const [isCustomDose, setIsCustomDose] = useState(false);
    const [customDoseValue, setCustomDoseValue] = useState<string>('');
    const [sleepHours, setSleepHours] = useState(7);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

    const unitLabel = userProfile?.medUnit || 'mg';
    const isLiquid = userProfile?.medForm === 'liquid';

    const symptomOptions = [
        { id: 'insomnia', label: t('sym_insomnia') },
        { id: 'anxiety', label: t('sym_anxiety') },
        { id: 'sweating', label: t('sym_sweating') },
        { id: 'shake', label: t('sym_shake') },
        { id: 'nausea', label: t('sym_nausea') },
        { id: 'headache', label: t('sym_headache') },
    ];

    const toggleSymptom = (sym: string) => {
        if (selectedSymptoms.includes(sym)) {
            setSelectedSymptoms(prev => prev.filter(s => s !== sym));
        } else {
            setSelectedSymptoms(prev => [...prev, sym]);
        }
    };

    // Calculate Dose Options based on target and step
    const target = todayPlan?.plannedDose || 0;
    const baseStep = isLiquid ? 0.1 : 0.5;
    
    const doseOptions = Array.from({ length: 5 }, (_, i) => {
        const val = target - (2 * baseStep) + (i * baseStep);
        return Math.max(0, parseFloat(val.toFixed(2)));
    }).filter((v, i, a) => a.indexOf(v) === i && v >= 0);

    if (!doseOptions.includes(target)) doseOptions.push(target);
    doseOptions.sort((a,b) => a - b);

    return (
        <div className="space-y-8 animate-in fade-in" role="form" aria-label={t('daily_report')}>
            {/* Step 1: Dose Selector */}
            <section aria-labelledby="dose-label">
                <div className="flex items-center justify-between mb-4">
                    <p id="dose-label" className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 font-black text-xs border ${selectedDose !== null ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-transparent border-slate-600 text-slate-500'}`}>1</span>
                        {t('step_1')}
                    </p>
                    {selectedDose !== null && <span className="text-xs text-indigo-400 font-bold animate-pulse">Selected: {selectedDose} {unitLabel}</span>}
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3" role="radiogroup">
                    {!isCustomDose && doseOptions.map(val => {
                        const isSelected = selectedDose === val;
                        const isTarget = val === todayPlan?.plannedDose;
                        return (
                            <button
                                key={val}
                                type="button"
                                onClick={() => setSelectedDose(val)}
                                className={`
                                    relative h-20 rounded-2xl font-mono font-bold text-lg transition-all duration-300 border flex flex-col items-center justify-center gap-1 group
                                    ${isSelected
                                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-400 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20'
                                    : 'bg-slate-800/30 border-white/5 text-slate-400 hover:bg-slate-700/50 hover:border-white/10 hover:text-white'}
                                `}
                            >
                                <span className="relative z-10 text-xl">{val}</span>
                                <span className="text-[9px] opacity-60 font-sans">{unitLabel}</span>
                                {isTarget && (
                                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]"></div>
                                )}
                            </button>
                        );
                    })}

                    <button
                         type="button"
                         onClick={() => setIsCustomDose(!isCustomDose)}
                         className={`
                             h-20 rounded-2xl border border-dashed transition-all flex flex-col items-center justify-center gap-1
                             ${isCustomDose
                             ? 'bg-slate-800 border-indigo-500 text-indigo-400'
                             : 'bg-transparent border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'}
                         `}
                    >
                        <Edit3 size={20} />
                        <span className="text-[9px] font-bold uppercase">Custom</span>
                    </button>

                    {isCustomDose && (
                        <div className="col-span-2 sm:col-span-1 h-20 relative animate-in slide-in-from-right-2">
                            <input
                                type="number"
                                className="w-full h-full bg-slate-900 border border-indigo-500/50 rounded-2xl text-center text-xl font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-slate-700"
                                placeholder="0.0"
                                value={customDoseValue}
                                onChange={(e) => {
                                    setCustomDoseValue(e.target.value);
                                    const val = parseFloat(e.target.value);
                                    if(!isNaN(val)) setSelectedDose(val);
                                }}
                                autoFocus
                            />
                            <span className="absolute bottom-2 right-1/2 translate-x-1/2 text-[9px] text-slate-500 font-bold">{unitLabel}</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Step 2: Mood & Details */}
            <section 
                className={`transition-all duration-700 ${selectedDose !== null ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4 grayscale pointer-events-none filter blur-[1px]'}`}
            >
                <div className="flex items-center justify-between mb-4">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 font-black text-xs border ${selectedMood ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-transparent border-slate-600 text-slate-500'}`}>2</span>
                        {t('step_2')}
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { id: 'bad', label: t('bad'), icon: Frown, color: 'from-rose-500 to-rose-600', border: 'border-rose-500/50', shadow: 'shadow-rose-900/20' },
                        { id: 'normal', label: t('stable'), icon: Meh, color: 'from-amber-500 to-amber-600', border: 'border-amber-500/50', shadow: 'shadow-amber-900/20' },
                        { id: 'good', label: t('excellent'), icon: Smile, color: 'from-emerald-500 to-emerald-600', border: 'border-emerald-500/50', shadow: 'shadow-emerald-900/20' }
                    ].map((m: any) => {
                        const isSelected = selectedMood === m.id;
                        return (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setSelectedMood(m.id)}
                                className={`
                                    h-24 rounded-[1.2rem] border transition-all duration-300 flex flex-col items-center justify-center gap-2 group relative overflow-hidden
                                    ${isSelected
                                    ? `bg-gradient-to-br ${m.color} border-transparent text-white shadow-xl ${m.shadow} scale-[1.02] ring-1 ring-white/20`
                                    : 'bg-slate-800/30 border-white/5 text-slate-500 hover:bg-slate-700/50 hover:border-white/10 hover:text-slate-300'}
                                `}
                            >
                                <m.icon className={`w-8 h-8 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={2} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
                            </button>
                        );
                    })}
                </div>

                {selectedMood && (
                    <div className="bg-slate-950/30 p-6 rounded-3xl border border-white/5 space-y-8 animate-in slide-in-from-bottom-4">
                        
                        {/* Sleep Slider (Modern) */}
                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <label className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                                    <Moon size={14} />
                                    {language === 'ar' ? 'جودة النوم' : 'Sleep Duration'}
                                </label>
                                <div className="text-2xl font-black text-white">{sleepHours}<span className="text-sm font-medium text-slate-500 ml-1">hrs</span></div>
                            </div>
                            <div className="relative h-12 flex items-center">
                                <div className="absolute w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-900 to-indigo-500" style={{ width: `${(sleepHours / 12) * 100}%` }}></div>
                                </div>
                                <input
                                    type="range" 
                                    min="0" 
                                    max="12" 
                                    step="0.5"
                                    value={sleepHours}
                                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div 
                                    className="w-6 h-6 bg-white rounded-full shadow-lg absolute pointer-events-none transition-all flex items-center justify-center"
                                    style={{ left: `calc(${(sleepHours / 12) * 100}% - 12px)` }}
                                >
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Symptoms Tags */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-3 block tracking-wider">{t('symptoms_label')}</label>
                            <div className="flex flex-wrap gap-2">
                                {symptomOptions.map(sym => {
                                    const isSelected = selectedSymptoms.includes(sym.label);
                                    return (
                                        <button
                                            key={sym.id}
                                            type="button"
                                            onClick={() => toggleSymptom(sym.label)}
                                            className={`
                                                px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 flex items-center gap-2
                                                ${isSelected
                                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                                : 'bg-slate-900/40 text-slate-500 border-transparent hover:bg-slate-800'}
                                            `}
                                        >
                                            {isSelected ? <Check size={12} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border border-slate-600"></div>}
                                            {sym.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Step 3: Confirm */}
            <div className={`transition-all duration-500 ${selectedDose !== null && selectedMood ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                 <Button
                    variant="success"
                    className="w-full py-5 text-lg font-black tracking-wide rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    onClick={() => submitDailyLog(sleepHours, selectedSymptoms)}
                 >
                    {t('confirm_log')}
                 </Button>
            </div>
        </div>
    );
};