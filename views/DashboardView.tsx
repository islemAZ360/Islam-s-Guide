import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle, AlertTriangle, Smile, Meh, Frown, Clock, HeartPulse, Moon, FileText, PauseCircle,
  FlaskConical, Pill, Edit3
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Button, Card, Badge, ProgressRing, PageHeader, LayoutContainer, BreathingModal, DoctorReportModal, LanguageSwitcher } from '../components/UI';
import { UserProfile, PlanDay, DailyLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardViewProps {
  userProfile: UserProfile | null;
  plan: PlanDay[];
  logs: DailyLog[];
  todayPlan: PlanDay | undefined;
  todayLog: DailyLog | undefined;
  progressPercentage: number;
  totalDays: number;
  daysCompleted: number;
  showDoctorWarning: boolean;
  selectedDose: number | null;
  setSelectedDose: (n: number | null) => void;
  selectedMood: 'bad' | 'normal' | 'good' | null;
  setSelectedMood: (m: 'bad' | 'normal' | 'good' | null) => void;
  submitDailyLog: (sleep: number, symptoms: string[]) => void;
  handleFreezePlan: () => void;
}

export const DashboardView = ({
  userProfile, plan, logs, todayPlan, todayLog, progressPercentage, 
  totalDays, daysCompleted, showDoctorWarning, 
  selectedDose, setSelectedDose, selectedMood, setSelectedMood, submitDailyLog,
  handleFreezePlan
}: DashboardViewProps) => {
  const { t } = useLanguage();
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // Custom Dose Input State
  const [isCustomDose, setIsCustomDose] = useState(false);
  const [customDoseValue, setCustomDoseValue] = useState<string>('');
  
  const [sleepHours, setSleepHours] = useState(7);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Derived Values
  const unitLabel = userProfile?.medUnit || 'mg';
  const isLiquid = userProfile?.medForm === 'liquid';

  const toggleSymptom = (sym: string) => {
      if (selectedSymptoms.includes(sym)) {
          setSelectedSymptoms(prev => prev.filter(s => s !== sym));
      } else {
          setSelectedSymptoms(prev => [...prev, sym]);
      }
  };

  const symptomOptions = [
      { id: 'insomnia', label: t('sym_insomnia') },
      { id: 'anxiety', label: t('sym_anxiety') },
      { id: 'sweating', label: t('sym_sweating') },
      { id: 'shake', label: t('sym_shake') },
      { id: 'nausea', label: t('sym_nausea') },
      { id: 'headache', label: t('sym_headache') },
  ];

  // Generate dose options smart based on current plan
  // If plan says 5mg, show options around 5mg
  const target = todayPlan?.plannedDose || 1;
  const baseStep = isLiquid ? 0.1 : 0.5;
  const doseOptions = Array.from({ length: 7 }, (_, i) => {
      const val = target - (3 * baseStep) + (i * baseStep);
      return Math.max(0, parseFloat(val.toFixed(2))); // Avoid negatives and floating point errors
  }).filter((v, i, a) => a.indexOf(v) === i && v > 0); // Unique and positive

  // Ensure target is included if filtered out
  if (!doseOptions.includes(target) && target > 0) doseOptions.push(target);
  doseOptions.sort((a,b) => a - b);

  return (
    <LayoutContainer>
      <BreathingModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
      <DoctorReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        userProfile={userProfile} 
        logs={logs} 
        plan={plan} 
      />
      
      <PageHeader 
        title={t('daily_report')}
        subtitle={`${t('welcome')} ${userProfile?.name}`}
        action={
            <div className="flex flex-wrap gap-4 items-center">
                <div className="hidden md:block">
                     <LanguageSwitcher />
                </div>
                <Button onClick={() => setIsReportOpen(true)} variant="secondary" className="!py-2 !px-4 !text-sm !rounded-full">
                    <FileText size={16} /> {t('export_report')}
                </Button>
                <Button variant="panic" onClick={() => setIsSosOpen(true)} className="!py-2 !px-4 !text-sm !rounded-full">
                    <HeartPulse size={16} /> {t('sos_button')}
                </Button>
                <div className="hidden md:flex gap-2">
                    <Badge color="indigo">{plan.length - logs.length} {t('days_left')}</Badge>
                    <Badge color="green">{t('status_stable')}</Badge>
                </div>
            </div>
        }
      />

      {/* Safety Warning & Freeze Option */}
      {showDoctorWarning && (
        <div className="bg-rose-500/5 border border-rose-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-md shadow-[0_0_40px_rgba(244,63,94,0.15)] animate-in zoom-in duration-500">
          <div className="flex items-start gap-4">
            <div className="bg-rose-500/20 p-4 rounded-3xl shrink-0 ring-1 ring-rose-500/30"><AlertTriangle className="text-rose-500 w-8 h-8" /></div>
            <div>
                <h3 className="font-bold text-rose-400 text-2xl mb-2">{t('safety_active')}</h3>
                <p className="text-rose-200/70 text-base leading-relaxed max-w-xl">
                {t('safety_desc')}
                </p>
            </div>
          </div>
          <Button 
            onClick={handleFreezePlan} 
            className="!bg-rose-500 hover:!bg-rose-600 !border-rose-400 !shadow-[0_0_20px_rgba(244,63,94,0.3)] whitespace-nowrap w-full md:w-auto"
          >
             <PauseCircle size={20} /> {t('freeze_plan_btn')}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Action Card */}
        <Card className="lg:col-span-8 bg-gradient-to-br from-[#0f172a] via-[#101626] to-indigo-950/20 min-h-[550px] flex flex-col justify-between !p-10 border-indigo-500/10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            {/* Top Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> {t('target_dose')}
                    </h2>
                    <div className="flex items-baseline gap-3 group cursor-default">
                        <span className="text-8xl md:text-9xl font-black text-white tracking-tighter drop-shadow-2xl group-hover:text-indigo-100 transition-colors duration-500">
                            {todayPlan ? todayPlan.plannedDose : 0}
                        </span>
                        <span className="text-3xl text-slate-600 font-bold group-hover:text-slate-500 transition-colors">{unitLabel}</span>
                    </div>
                </div>
                
                <div className="hidden md:block scale-110">
                     <ProgressRing radius={70} stroke={8} progress={progressPercentage} totalSteps={totalDays - daysCompleted} />
                </div>
            </div>

            {/* Interaction Section */}
            {todayLog ? (
              <div className="mt-8 bg-emerald-500/5 border border-emerald-500/10 p-10 rounded-[2.5rem] flex items-center justify-between backdrop-blur-md animate-in zoom-in slide-in-from-bottom-4 duration-700">
                <div>
                  <p className="text-emerald-400 font-bold text-3xl mb-3">{t('documented')}</p>
                  <div className="space-y-1">
                     <p className="text-slate-400 font-medium text-lg">{t('dose')}: <span className="text-white font-mono font-bold">{todayLog.doseTaken}{unitLabel}</span></p>
                     <p className="text-slate-400 font-medium text-lg">{t('mood')}: <span className="text-white">{todayLog.mood === 'good' ? t('excellent') : todayLog.mood === 'normal' ? t('stable') : t('bad')}</span></p>
                  </div>
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-full flex items-center justify-center ring-4 ring-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="text-emerald-500 w-12 h-12" />
                </div>
              </div>
            ) : (
              <div className="mt-12 space-y-10">
                 {/* Step 1: Dose Selector */}
                 <div className="relative">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-colors duration-300 ${selectedDose ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'bg-slate-800 text-slate-500'}`}>1</span>
                        {t('step_1')}
                    </p>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide py-2 px-1">
                        {/* Standard Options */}
                        {!isCustomDose && doseOptions.map(val => (
                        <button 
                            key={val}
                            onClick={() => setSelectedDose(val)}
                            className={`min-w-[5.5rem] h-20 rounded-2xl border transition-all duration-300 font-mono font-bold text-xl flex items-center justify-center relative group overflow-hidden ${
                                selectedDose === val 
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] scale-110 z-10' 
                                : 'bg-slate-800/30 border-white/5 text-slate-500 hover:bg-slate-800 hover:border-indigo-500/30 hover:text-indigo-300'
                            }`}
                        >
                            <span className="relative z-10">{val}</span>
                            {val === todayPlan?.plannedDose && (
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_10px_indigo]"></span>
                            )}
                        </button>
                        ))}
                        
                        {/* Custom Input Toggle */}
                        <button 
                             onClick={() => setIsCustomDose(!isCustomDose)}
                             className={`min-w-[5.5rem] h-20 rounded-2xl border border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                                 isCustomDose 
                                 ? 'bg-slate-800 border-indigo-500 text-indigo-400' 
                                 : 'bg-transparent border-slate-700 text-slate-600 hover:border-slate-500 hover:text-slate-400'
                             }`}
                        >
                            <Edit3 size={18} />
                            <span className="text-[10px] uppercase font-bold">Manual</span>
                        </button>

                        {/* Custom Input Field */}
                        {isCustomDose && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                                <input 
                                    type="number" 
                                    className="w-24 h-20 bg-slate-800 border border-indigo-500 rounded-2xl text-center text-xl font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="0.0"
                                    value={customDoseValue}
                                    onChange={(e) => {
                                        setCustomDoseValue(e.target.value);
                                        const val = parseFloat(e.target.value);
                                        if(!isNaN(val)) setSelectedDose(val);
                                    }}
                                />
                                <span className="text-slate-500 font-bold text-sm">{unitLabel}</span>
                            </div>
                        )}
                    </div>
                 </div>
                 
                 {/* Step 2: Mental & Physical State */}
                 <div className={`transition-all duration-700 transform ${selectedDose ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-8 pointer-events-none blur-sm'}`}>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-colors duration-300 ${selectedMood ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'bg-slate-800 text-slate-500'}`}>2</span>
                        {t('step_2')}
                    </p>
                    
                    {/* Mood Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                            { id: 'bad', label: t('bad'), icon: Frown, color: 'rose' },
                            { id: 'normal', label: t('stable'), icon: Meh, color: 'amber' },
                            { id: 'good', label: t('excellent'), icon: Smile, color: 'emerald' }
                        ].map((m: any) => (
                            <button 
                                key={m.id}
                                onClick={() => setSelectedMood(m.id)}
                                className={`p-4 rounded-3xl border transition-all duration-300 flex flex-col items-center gap-2 group ${
                                    selectedMood === m.id
                                    ? `bg-${m.color}-500/10 border-${m.color}-500/50 text-${m.color}-400 shadow-[0_0_30px_rgba(0,0,0,0.3)] scale-105`
                                    : 'bg-slate-800/30 border-white/5 text-slate-600 hover:bg-slate-800 hover:border-white/10'
                                }`}
                            >
                                <m.icon className={`w-8 h-8 ${selectedMood === m.id ? 'fill-current' : ''}`} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Sleep & Symptoms */}
                    {selectedMood && (
                        <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 space-y-6 animate-in fade-in slide-in-from-top-4">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                    <Moon size={14} /> {t('sleep_label')}: <span className="text-white text-lg font-mono">{sleepHours}h</span>
                                </label>
                                <input 
                                    type="range" min="0" max="12" step="0.5" 
                                    value={sleepHours} 
                                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                    <HeartPulse size={14} /> {t('symptoms_label')}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {symptomOptions.map(sym => (
                                        <button 
                                            key={sym.id}
                                            onClick={() => toggleSymptom(sym.label)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
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
                        </div>
                    )}
                 </div>

                 {/* Step 3: Confirm Button */}
                 <div className={`pt-6 border-t border-white/5 transition-all duration-700 ${selectedDose && selectedMood ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                     <Button 
                        variant="success" 
                        className="w-full py-6 text-xl rounded-3xl shadow-emerald-500/20"
                        onClick={() => submitDailyLog(sleepHours, selectedSymptoms)}
                     >
                        {t('confirm_log')} <CheckCircle className="w-6 h-6 mr-2" />
                     </Button>
                 </div>
              </div>
            )}
          </div>
        </Card>

        {/* Side Info Cards */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="flex flex-col items-center justify-center text-center py-12 bg-slate-900/40">
                 <div className="w-24 h-24 rounded-full bg-slate-950 flex items-center justify-center mb-6 relative border border-white/5">
                     <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping duration-[3000ms]"></div>
                     {isLiquid ? (
                        <FlaskConical className="w-10 h-10 text-indigo-400" />
                     ) : (
                        <Clock className="w-10 h-10 text-indigo-400" />
                     )}
                 </div>
                 <h3 className="text-white font-bold text-xl mb-2">{t('algo_active')}</h3>
                 <p className="text-slate-500 text-sm px-6 leading-relaxed">
                   {t('algo_desc')}
                 </p>
            </Card>

            <Card className="min-h-[300px] relative overflow-hidden bg-indigo-950/10" noPadding>
                <div className="p-8 pb-0 relative z-10">
                   <h2 className="text-lg font-bold text-white mb-2">{t('recovery_path')}</h2>
                   <p className="text-xs text-indigo-300/60 uppercase tracking-widest font-bold">Projection</p>
                </div>
                <div className="absolute inset-x-0 bottom-0 top-16 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={plan.slice(0, 14)}>
                        <defs>
                        <linearGradient id="colorDose" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <Area 
                            type="monotone" 
                            dataKey="plannedDose" 
                            stroke="#818cf8" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorDose)" 
                            animationDuration={2000}
                        />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
      </div>
    </LayoutContainer>
  );
};