import React, { useState } from 'react';
import { Edit3, Frown, Meh, Smile, Moon } from 'lucide-react';
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
    const { t } = useLanguage();
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
    const doseOptions = Array.from({ length: 7 }, (_, i) => {
        const val = target - (3 * baseStep) + (i * baseStep);
        return Math.max(0, parseFloat(val.toFixed(2)));
    }).filter((v, i, a) => a.indexOf(v) === i && v >= 0);

    if (!doseOptions.includes(target)) doseOptions.push(target);
    doseOptions.sort((a,b) => a - b);

    return (
        <div className="space-y-8">
            {/* Step 1: Dose Selector */}
            <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${selectedDose !== null ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>1</span>
                    {t('step_1')}
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {!isCustomDose && doseOptions.map(val => (
                        <button
                            key={val}
                            onClick={() => setSelectedDose(val)}
                            className={`min-w-[5rem] h-16 rounded-xl border transition-all font-mono font-bold text-lg flex items-center justify-center relative group overflow-hidden ${
                                selectedDose === val
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105 z-10'
                                : 'bg-slate-800/30 border-white/5 text-slate-500 hover:bg-slate-800 hover:border-indigo-500/30 hover:text-indigo-300'
                            }`}
                        >
                            <span className="relative z-10">{val}</span>
                            {val === todayPlan?.plannedDose && (
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_10px_indigo]"></span>
                            )}
                        </button>
                    ))}

                    <button
                         onClick={() => setIsCustomDose(!isCustomDose)}
                         className={`min-w-[5rem] h-16 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1 transition-all ${
                             isCustomDose
                             ? 'bg-slate-800 border-indigo-500 text-indigo-400'
                             : 'bg-transparent border-slate-700 text-slate-600 hover:border-slate-500'
                         }`}
                    >
                        <Edit3 size={18} />
                    </button>

                    {isCustomDose && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                            <input
                                type="number"
                                className="w-20 h-16 bg-slate-800 border border-indigo-500 rounded-xl text-center text-lg font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="0.0"
                                value={customDoseValue}
                                onChange={(e) => {
                                    setCustomDoseValue(e.target.value);
                                    const val = parseFloat(e.target.value);
                                    if(!isNaN(val)) setSelectedDose(val);
                                }}
                            />
                            <span className="text-slate-500 font-bold text-xs">{unitLabel}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Step 2: Mood & Details */}
            <div className={`transition-all duration-700 transform ${selectedDose !== null ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-8 pointer-events-none blur-sm'}`}>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${selectedMood ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>2</span>
                    {t('step_2')}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                        { id: 'bad', label: t('bad'), icon: Frown, color: 'rose' },
                        { id: 'normal', label: t('stable'), icon: Meh, color: 'amber' },
                        { id: 'good', label: t('excellent'), icon: Smile, color: 'emerald' }
                    ].map((m: any) => (
                        <button
                            key={m.id}
                            onClick={() => setSelectedMood(m.id)}
                            className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${
                                selectedMood === m.id
                                ? `bg-${m.color}-500/10 border-${m.color}-500/50 text-${m.color}-400 shadow-lg scale-105`
                                : 'bg-slate-800/30 border-white/5 text-slate-600 hover:bg-slate-800'
                            }`}
                        >
                            <m.icon className={`w-6 h-6 ${selectedMood === m.id ? 'fill-current' : ''}`} />
                            <span className="text-[9px] font-bold uppercase">{m.label}</span>
                        </button>
                    ))}
                </div>

                {selectedMood && (
                    <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 space-y-4 animate-in fade-in slide-in-from-top-4">
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-2">
                                <Moon size={12} /> {t('sleep_label')}: <span className="text-white text-sm font-mono">{sleepHours}h</span>
                            </label>
                            <input
                                type="range" min="0" max="12" step="0.5"
                                value={sleepHours}
                                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {symptomOptions.map(sym => (
                                <button
                                    key={sym.id}
                                    onClick={() => toggleSymptom(sym.label)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                        selectedSymptoms.includes(sym.label)
                                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                                        : 'bg-slate-800 text-slate-500 border-transparent hover:border-slate-600'
                                    }`}
                                >
                                    {sym.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Step 3: Confirm */}
            <div className={`transition-all duration-700 ${selectedDose !== null && selectedMood ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                 <Button
                    variant="success"
                    className="w-full py-4 text-lg rounded-2xl shadow-emerald-500/20"
                    onClick={() => submitDailyLog(sleepHours, selectedSymptoms)}
                 >
                    {t('confirm_log')}
                 </Button>
            </div>
        </div>
    );
};