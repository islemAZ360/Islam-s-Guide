import React, { useState } from 'react';
import { Edit3, Frown, Meh, Smile, Moon, Check, BedDouble } from 'lucide-react';
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

    // Calculate Dose Options
    const target = todayPlan?.plannedDose || 0;
    const baseStep = isLiquid ? 0.1 : 0.5;
    
    const doseOptions = Array.from({ length: 5 }, (_, i) => {
        const val = target - (2 * baseStep) + (i * baseStep);
        return Math.max(0, parseFloat(val.toFixed(2)));
    }).filter((v, i, a) => a.indexOf(v) === i && v >= 0);

    if (!doseOptions.includes(target)) doseOptions.push(target);
    doseOptions.sort((a,b) => a - b);

    return (
        <div className="space-y-10 animate-in fade-in">
            {/* Step 1: Dose Selector */}
            <div>
                <p className="text-indigo-200/60 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 font-black ${selectedDose !== null ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'bg-white/10 text-slate-400'}`}>1</span>
                    {t('step_1')}
                </p>
                
                <div className="flex flex-wrap gap-3">
                    {!isCustomDose && doseOptions.map(val => (
                        <button
                            key={val}
                            onClick={() => setSelectedDose(val)}
                            className={`
                                relative min-w-[4.5rem] h-16 rounded-2xl font-mono font-bold text-lg transition-all duration-300 border
                                flex items-center justify-center overflow-hidden group
                                ${selectedDose === val
                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-110 z-10'
                                : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800 hover:border-white/20 hover:text-white'}
                            `}
                        >
                            <span className="relative z-10">{val}</span>
                            {val === todayPlan?.plannedDose && (
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                            )}
                            {selectedDose === val && <div className="absolute inset-0 bg-white/20 blur-md"></div>}
                        </button>
                    ))}

                    <button
                         onClick={() => setIsCustomDose(!isCustomDose)}
                         className={`
                             min-w-[4.5rem] h-16 rounded-2xl border border-dashed transition-all flex items-center justify-center
                             ${isCustomDose
                             ? 'bg-slate-800 border-indigo-500 text-indigo-400'
                             : 'bg-transparent border-slate-700 text-slate-600 hover:border-slate-500 hover:text-slate-400'}
                         `}
                    >
                        <Edit3 size={20} />
                    </button>

                    {isCustomDose && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
                            <input
                                type="number"
                                className="w-24 h-16 bg-slate-900/80 border border-indigo-500 rounded-2xl text-center text-xl font-bold text-white outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner"
                                placeholder="0.0"
                                value={customDoseValue}
                                onChange={(e) => {
                                    setCustomDoseValue(e.target.value);
                                    const val = parseFloat(e.target.value);
                                    if(!isNaN(val)) setSelectedDose(val);
                                }}
                                autoFocus
                            />
                            <span className="text-slate-500 font-bold text-sm bg-slate-900/50 px-3 py-1 rounded-lg border border-white/5">{unitLabel}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Step 2: Mood & Details */}
            <div className={`transition-all duration-700 ${selectedDose !== null ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4 grayscale pointer-events-none'}`}>
                <p className="text-indigo-200/60 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 font-black ${selectedMood ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'bg-white/10 text-slate-400'}`}>2</span>
                    {t('step_2')}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { id: 'bad', label: t('bad'), icon: Frown, color: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/30' },
                        { id: 'normal', label: t('stable'), icon: Meh, color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/30' },
                        { id: 'good', label: t('excellent'), icon: Smile, color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/30' }
                    ].map((m: any) => (
                        <button
                            key={m.id}
                            onClick={() => setSelectedMood(m.id)}
                            className={`
                                py-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 group relative overflow-hidden
                                ${selectedMood === m.id
                                ? `bg-gradient-to-br ${m.color} border-transparent text-white shadow-xl ${m.shadow} scale-105`
                                : 'bg-slate-900/40 border-white/5 text-slate-500 hover:bg-slate-800 hover:border-white/10'}
                            `}
                        >
                            <m.icon className={`w-8 h-8 transition-transform duration-300 ${selectedMood === m.id ? 'scale-110 rotate-6' : 'group-hover:scale-110'}`} strokeWidth={2.5} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                        </button>
                    ))}
                </div>

                {selectedMood && (
                    <div className="bg-slate-950/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-6 animate-in slide-in-from-bottom-4 shadow-inner">
                        {/* Sleep Slider (تم تعديل العنوان ليكون منطقياً) */}
                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                                    <BedDouble size={16} className="text-indigo-400" />
                                    {language === 'ar' ? 'كم ساعة نمت ليلة البارحة؟' : 'Sleep hours last night?'}
                                </label>
                                <span className="text-2xl font-mono font-black text-white">{sleepHours}<span className="text-sm text-slate-600 font-bold ml-1">h</span></span>
                            </div>
                            <input
                                type="range" min="0" max="12" step="0.5"
                                value={sleepHours}
                                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                            />
                            <div className="flex justify-between text-[10px] text-slate-600 mt-2 font-bold px-1">
                                <span>0h</span>
                                <span>6h</span>
                                <span>12h</span>
                            </div>
                        </div>

                        {/* Symptoms Tags */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">{t('symptoms_label')}</label>
                            <div className="flex flex-wrap gap-2">
                                {symptomOptions.map(sym => {
                                    const isSelected = selectedSymptoms.includes(sym.label);
                                    return (
                                        <button
                                            key={sym.id}
                                            onClick={() => toggleSymptom(sym.label)}
                                            className={`
                                                px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center gap-2
                                                ${isSelected
                                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-900/20'
                                                : 'bg-slate-900/60 text-slate-500 border-transparent hover:bg-slate-800 hover:text-slate-300'}
                                            `}
                                        >
                                            {isSelected && <Check size={12} />}
                                            {sym.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Step 3: Confirm */}
            <div className={`transition-all duration-700 ${selectedDose !== null && selectedMood ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                 <Button
                    variant="success"
                    className="w-full py-5 text-lg rounded-2xl shadow-xl shadow-emerald-500/20 animate-pulse-glow"
                    onClick={() => submitDailyLog(sleepHours, selectedSymptoms)}
                 >
                    {t('confirm_log')}
                 </Button>
            </div>
        </div>
    );
};