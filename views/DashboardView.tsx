import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle, AlertTriangle, Smile, Meh, Frown, Clock, HeartPulse, Moon, FileText, PauseCircle,
  FlaskConical, Pill, Edit3, Stethoscope, Info
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Button, Card, ProgressRing, PageHeader, LayoutContainer, BreathingModal, DoctorReportModal, LanguageSwitcher, Badge } from '../components/UI';
import { UserProfile, PlanDay, DailyLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardViewProps {
  userProfile: UserProfile | null; // نقبل null هنا لتجنب مشاكل النوع، لكننا نتحقق منه
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
  
  // هل المستخدم يتبع طبيباً؟
  const isPatient = userProfile?.role === 'patient';
  const isManualPlan = userProfile?.planType === 'manual';
  const doctorName = userProfile?.patientData?.assignedDoctorName;

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
  const target = todayPlan?.plannedDose || 0;
  
  const baseStep = isLiquid ? 0.1 : 0.5; 
  
  // Create a range of options around the target dose
  const doseOptions = Array.from({ length: 7 }, (_, i) => {
      const val = target - (3 * baseStep) + (i * baseStep);
      return Math.max(0, parseFloat(val.toFixed(2))); 
  }).filter((v, i, a) => a.indexOf(v) === i && v >= 0); 

  if (!doseOptions.includes(target)) doseOptions.push(target);
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
        subtitle={`${t('welcome')} ${userProfile?.name || ''}`}
        action={
            <div className="flex flex-wrap gap-4 items-center">
                <div className="hidden md:block"><LanguageSwitcher /></div>
                <Button onClick={() => setIsReportOpen(true)} variant="secondary" className="!py-2 !px-4 !text-sm !rounded-full">
                    <FileText size={16} /> {t('export_report')}
                </Button>
                <Button variant="panic" onClick={() => setIsSosOpen(true)} className="!py-2 !px-4 !text-sm !rounded-full">
                    <HeartPulse size={16} /> {t('sos_button')}
                </Button>
            </div>
        }
      />

      {/* Patient Specific Banner - يظهر فقط للمرضى التابعين لطبيب */}
      {isPatient && (
          <div className="bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between mb-6 backdrop-blur-md animate-in slide-in-from-top-2">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 ring-1 ring-indigo-500/40">
                      <Stethoscope size={24} />
                  </div>
                  <div>
                      <p className="text-xs text-indigo-300 font-bold uppercase mb-1">تحت إشراف طبي</p>
                      <p className="text-white font-bold text-lg flex items-center gap-2">
                          د. {doctorName}
                          <Badge color="blue" className="!text-[10px] !py-0">معتمد</Badge>
                      </p>
                  </div>
              </div>
              <div className="text-left hidden md:block">
                  <span className="text-[10px] text-slate-400 block">نوع الخطة</span>
                  <span className="text-xs font-bold text-white">جدول طبي مخصص</span>
              </div>
          </div>
      )}

      {/* Safety Warning & Freeze Option */}
      {showDoctorWarning && !isManualPlan && (
        <div className="bg-rose-500/5 border border-rose-500/20 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md animate-in zoom-in duration-500 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500/20 p-4 rounded-full ring-1 ring-rose-500/30"><AlertTriangle className="text-rose-500 w-6 h-6" /></div>
            <div>
                <h3 className="font-bold text-rose-400 text-lg mb-1">{t('safety_active')}</h3>
                <p className="text-rose-200/70 text-sm max-w-lg">{t('safety_desc')}</p>
            </div>
          </div>
          <Button onClick={handleFreezePlan} className="!bg-rose-500 hover:!bg-rose-600 !border-rose-400 w-full md:w-auto">
             <PauseCircle size={18} /> {t('freeze_plan_btn')}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Action Card */}
        <Card className="lg:col-span-8 bg-gradient-to-br from-[#0f172a] via-[#101626] to-indigo-950/20 min-h-[550px] flex flex-col justify-between !p-8 md:!p-10 border-indigo-500/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            {/* Top Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> {t('target_dose')}
                    </h2>
                    <div className="flex items-baseline gap-2 group cursor-default">
                        <span className="text-7xl md:text-9xl font-black text-white tracking-tighter drop-shadow-2xl group-hover:text-indigo-100 transition-colors duration-500">
                            {todayPlan ? todayPlan.plannedDose : 0}
                        </span>
                        <span className="text-2xl text-slate-600 font-bold group-hover:text-slate-500 transition-colors">{unitLabel}</span>
                    </div>
                </div>
                
                <div className="hidden md:block scale-110">
                     <ProgressRing radius={70} stroke={8} progress={progressPercentage} totalSteps={totalDays - daysCompleted} />
                </div>
            </div>

            {/* Interaction Section */}
            {todayLog ? (
              <div className="mt-8 bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2rem] flex items-center justify-between backdrop-blur-md animate-in zoom-in slide-in-from-bottom-4 duration-700">
                <div>
                  <p className="text-emerald-400 font-bold text-2xl mb-2">{t('documented')}</p>
                  <div className="space-y-1 text-sm">
                     <p className="text-slate-400 font-medium">{t('dose')}: <span className="text-white font-mono font-bold">{todayLog.doseTaken}{unitLabel}</span></p>
                     <p className="text-slate-400 font-medium">{t('mood')}: <span className="text-white">{todayLog.mood === 'good' ? t('excellent') : todayLog.mood === 'normal' ? t('stable') : t('bad')}</span></p>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-full flex items-center justify-center ring-4 ring-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="text-emerald-500 w-8 h-8" />
                </div>
              </div>
            ) : (
              <div className="mt-8 space-y-8">
                 {/* Step 1: Dose Selector */}
                 <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${selectedDose ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>1</span>
                        {t('step_1')}
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {/* Standard Options */}
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
                        
                        {/* Custom Input Toggle */}
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

                        {/* Custom Input Field */}
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
                 
                 {/* Step 2: Mental & Physical State */}
                 <div className={`transition-all duration-700 transform ${selectedDose ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-8 pointer-events-none blur-sm'}`}>
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

                 {/* Step 3: Confirm Button */}
                 <div className={`transition-all duration-700 ${selectedDose && selectedMood ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                     <Button 
                        variant="success" 
                        className="w-full py-4 text-lg rounded-2xl shadow-emerald-500/20"
                        onClick={() => submitDailyLog(sleepHours, selectedSymptoms)}
                     >
                        {t('confirm_log')}
                     </Button>
                 </div>
              </div>
            )}
          </div>
        </Card>

        {/* Side Info Cards */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="flex flex-col items-center justify-center text-center py-10 bg-slate-900/40">
                 <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center mb-4 relative border border-white/5">
                     <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping duration-[3000ms]"></div>
                     {isLiquid ? (
                        <FlaskConical className="w-8 h-8 text-indigo-400" />
                     ) : (
                        <Clock className="w-8 h-8 text-indigo-400" />
                     )}
                 </div>
                 
                 {isPatient ? (
                     <>
                        <h3 className="text-white font-bold text-lg mb-1">الخطة العلاجية الحالية</h3>
                        <p className="text-slate-500 text-xs px-4 leading-relaxed mb-3">
                            هذه الخطة تم وضعها بواسطة <strong>د. {doctorName}</strong>. أي تغيير في الجرعات يجب أن يتم بعد استشارته.
                        </p>
                        <Badge color="indigo" className="mx-auto">Fixed Plan</Badge>
                     </>
                 ) : (
                     <>
                        <h3 className="text-white font-bold text-lg mb-1">{t('algo_active')}</h3>
                        <p className="text-slate-500 text-xs px-4 leading-relaxed">
                          {t('algo_desc')}
                        </p>
                     </>
                 )}
            </Card>

            <Card className="min-h-[250px] relative overflow-hidden bg-indigo-950/10" noPadding>
                <div className="p-6 pb-0 relative z-10">
                   <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                       {t('recovery_path')} <Info size={12} className="text-slate-500"/>
                   </h2>
                   <p className="text-[10px] text-indigo-300/60 uppercase tracking-widest font-bold">Projection</p>
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
                            strokeWidth={3} 
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