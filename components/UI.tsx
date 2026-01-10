import React, { useEffect, useState } from 'react';
import { Globe, X, Printer, FileText, ArrowRight, Snowflake, Eye, ShieldCheck, Wind, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile, DailyLog, PlanDay } from '../types';

// --- Language Switcher ---
export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex bg-slate-800/40 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-lg">
      {(['ar', 'en', 'ru'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-300 ${
            language === lang 
              ? 'bg-indigo-600/90 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
};

// --- Doctor Report Modal (Smart Update) ---
export const DoctorReportModal = ({ 
  isOpen, onClose, userProfile, logs, plan 
}: { 
  isOpen: boolean, 
  onClose: () => void,
  userProfile: UserProfile | null,
  logs: DailyLog[],
  plan: PlanDay[]
}) => {
  const { t } = useLanguage();
  
  // Determine Unit Label
  const unitLabel = userProfile?.medUnit || 'mg';
  
  // Plan Description
  const planTypeLabel = userProfile?.planType === 'manual' 
    ? `Managed by Dr. ${userProfile.patientData?.assignedDoctorName || 'Unknown'}` 
    : 'Automated Smart Algorithm';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-[2rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-start mb-8 print:hidden">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="text-indigo-600" /> {t('export_report')}
            </h2>
            <div className="flex gap-2">
                <Button onClick={() => window.print()} className="!py-2 !px-4 !bg-indigo-600 !text-white !rounded-xl !shadow-none">
                    <Printer size={18} /> {t('print')}
                </Button>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* Printable Area */}
        <div className="print-area space-y-6">
            <div className="border-b pb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-1">Islam's Guide Report</h1>
                    <p className="text-slate-500 text-sm">Recovery Progress & Adherence Log</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg">{userProfile?.name}</p>
                    <p className="text-slate-500">{new Date().toLocaleDateString()}</p>
                    <div className="flex flex-col items-end mt-1">
                        <span className="text-xs font-bold text-indigo-600 uppercase">
                            {userProfile?.medForm === 'liquid' ? 'LIQUID FORMULATION' : 'TABLET FORMULATION'}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                            Strategy: {planTypeLabel}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                     <span className="block text-xs text-slate-500 uppercase font-bold">Medication Type</span>
                     <span className="font-bold text-lg capitalize">{userProfile?.medType || 'Standard'}</span>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                     <span className="block text-xs text-slate-500 uppercase font-bold">Current Dose</span>
                     <span className="font-bold text-lg">
                        {plan.find(p => p.date === new Date().toISOString().split('T')[0])?.plannedDose || 0}{unitLabel}
                     </span>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                     <span className="block text-xs text-slate-500 uppercase font-bold">Compliance Score</span>
                     <span className="font-bold text-lg text-indigo-600">{Math.round((logs.length / (plan.length || 1)) * 100)}%</span>
                 </div>
            </div>

            <table className="w-full text-sm text-left border-collapse">
                <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                        <th className="p-3 font-bold text-slate-700">Date</th>
                        <th className="p-3 font-bold text-slate-700">Planned</th>
                        <th className="p-3 font-bold text-slate-700">Taken</th>
                        <th className="p-3 font-bold text-slate-700">Mood</th>
                        <th className="p-3 font-bold text-slate-700">Sleep</th>
                        <th className="p-3 font-bold text-slate-700">Symptoms</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.slice().reverse().map((log, i) => {
                        const planned = plan.find(p => p.date === log.date)?.plannedDose || '-';
                        return (
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-3 font-mono text-slate-600">{log.date}</td>
                                <td className="p-3 font-bold text-slate-500">{planned}{unitLabel}</td>
                                <td className="p-3 font-bold text-indigo-600">{log.doseTaken}{unitLabel}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        log.mood === 'good' ? 'bg-emerald-100 text-emerald-700' : 
                                        log.mood === 'bad' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {log.mood?.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-3 text-slate-600">{log.sleepHours ? `${log.sleepHours}h` : '-'}</td>
                                <td className="p-3 text-slate-500 text-xs">
                                    {log.symptoms?.join(', ') || '-'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            
            <div className="mt-8 border-t pt-4 text-center text-xs text-slate-400">
                <p>Generated by Islam's Guide Recovery System.</p>
                <p>This report is for informational purposes and does not replace professional medical advice.</p>
            </div>
        </div>
      </div>
      <style>{`
        @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; color: black !important; }
            .fixed { position: static !important; }
        }
      `}</style>
    </div>
  );
};

// --- SOS MODAL (Breathing) ---
export const BreathingModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(0); 
  const [breathePhase, setBreathePhase] = useState<'in' | 'hold' | 'out'>('in');
  
  useEffect(() => {
    if (!isOpen) { setStep(0); return; }
  }, [isOpen]);

  useEffect(() => {
    if (step === 3) {
        const cycle = () => {
        setBreathePhase('in');
        setTimeout(() => {
            setBreathePhase('hold');
            setTimeout(() => { setBreathePhase('out'); }, 2000); 
        }, 4000); 
        };
        cycle();
        const interval = setInterval(cycle, 10000);
        return () => clearInterval(interval);
    }
  }, [step]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg mx-4 bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl overflow-hidden min-h-[500px] flex flex-col justify-center">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors z-20"><X size={24} /></button>

        {step === 0 && (
            <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-8">
                <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"><ShieldCheck size={40} className="text-rose-500" /></div>
                <h2 className="text-4xl font-black text-white">{t('sos_phase_1_title')}</h2>
                <p className="text-lg text-slate-300 leading-relaxed font-medium">{t('sos_phase_1_text')}</p>
                <Button variant="primary" onClick={() => setStep(1)} className="w-full text-lg py-6 shadow-indigo-500/30">{t('sos_btn_ground')} <ArrowRight /></Button>
            </div>
        )}
        {step === 1 && (
            <div className="animate-in slide-in-from-right-8 duration-500 space-y-8">
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><Eye size={40} className="text-blue-500" /></div>
                <h2 className="text-3xl font-bold text-white">{t('sos_phase_2_title')}</h2>
                <p className="text-xl text-white font-bold bg-slate-800/50 p-6 rounded-2xl border border-white/5">{t('sos_phase_2_text')}</p>
                <div className="flex gap-2 justify-center"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="w-3 h-3 rounded-full bg-blue-500 opacity-50"></span><span className="w-3 h-3 rounded-full bg-blue-500 opacity-20"></span></div>
                <Button variant="secondary" onClick={() => setStep(2)} className="w-full text-lg py-6">{t('sos_btn_next')}</Button>
            </div>
        )}
        {step === 2 && (
            <div className="animate-in slide-in-from-right-8 duration-500 space-y-8">
                <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><Snowflake size={40} className="text-cyan-400" /></div>
                <h2 className="text-3xl font-bold text-white">{t('sos_phase_3_title')}</h2>
                <p className="text-lg text-slate-300 leading-relaxed">{t('sos_phase_3_text')}</p>
                <Button variant="primary" onClick={() => setStep(3)} className="w-full text-lg py-6 shadow-cyan-500/20 border-cyan-500/20">{t('sos_btn_breathe')}</Button>
            </div>
        )}
        {step === 3 && (
            <div className="animate-in fade-in duration-1000">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2"><Wind className="text-indigo-400" />{t('sos_phase_4_title')}</h2>
                <p className="text-slate-400 text-sm mb-12">{t('sos_phase_4_subtitle')}</p>
                <div className="relative h-64 flex items-center justify-center mb-8">
                <div className={`absolute w-32 h-32 bg-indigo-500/20 rounded-full blur-xl transition-all duration-[4000ms] ease-in-out ${breathePhase === 'in' ? 'scale-[2.5] opacity-60' : breathePhase === 'hold' ? 'scale-[2.5] opacity-60' : 'scale-100 opacity-20'}`}></div>
                <div className={`absolute w-32 h-32 bg-indigo-500/10 rounded-full border-2 border-indigo-500/30 transition-all duration-[4000ms] ease-in-out ${breathePhase === 'in' ? 'scale-[2.2]' : breathePhase === 'hold' ? 'scale-[2.2]' : 'scale-100'}`}></div>
                <div className="relative z-10 text-3xl font-black text-indigo-100 transition-all duration-500">{breathePhase === 'in' && t('breathe_in')}{breathePhase === 'hold' && t('breathe_hold')}{breathePhase === 'out' && t('breathe_out')}</div>
                </div>
                <Button variant="secondary" onClick={onClose} className="w-full">{t('close')}</Button>
            </div>
        )}
      </div>
    </div>
  );
};

// --- Standard UI Components ---

export const LayoutContainer = ({ children, className = '' }: any) => (
  <div className={`max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${className}`}>
    {children}
  </div>
);

export const PageHeader = ({ title, subtitle, action }: { title: string, subtitle?: string, action?: React.ReactNode }) => (
  <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-6 md:pb-8 relative">
    <div className="relative z-10 w-full lg:w-auto">
      <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg">{title}</h1>
      {subtitle && <p className="text-slate-400 font-medium text-sm md:text-lg max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
    {action && (
      <div className="flex flex-wrap gap-3 md:gap-4 relative z-10 w-full lg:w-auto justify-start lg:justify-end">
        {action}
      </div>
    )}
    <div className="absolute left-0 top-0 w-64 h-64 bg-indigo-500/10 blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen"></div>
  </header>
);

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "relative overflow-hidden px-6 py-4 rounded-2xl font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale group select-none cursor-pointer";
  const variants: any = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-indigo-400/20",
    secondary: "bg-slate-800/40 backdrop-blur-md text-slate-300 border border-white/5 hover:bg-slate-700/50 hover:text-white hover:border-white/10",
    danger: "bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.4)]",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.3)] border border-emerald-400/20",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
    panic: "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === 'primary' && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300 mix-blend-overlay"></div>}
    </button>
  );
};

export const Card = ({ children, className = '', noPadding = false }: any) => (
  <div className={`bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:border-white/10 transition-all duration-500 ${!noPadding ? 'p-6 md:p-10' : ''} ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
    {children}
  </div>
);

export const Badge = ({ children, color = 'indigo', className = '' }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    red: 'bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
  };
  const selectedColor = colors[color] || colors.indigo;
  return (
    <span className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold border ${selectedColor} backdrop-blur-md flex items-center gap-1.5 animate-in fade-in zoom-in duration-300 whitespace-nowrap w-fit ${className}`}>{children}</span>
  );
};

export const ProgressRing = ({ radius, stroke, progress, totalSteps }: { radius: number, stroke: number, progress: number, totalSteps: number }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const { t } = useLanguage();
  return (
    <div className="relative flex items-center justify-center group cursor-default">
      <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg] transform transition-transform duration-700 group-hover:scale-105">
        <circle stroke="#1e293b" strokeWidth={stroke} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} className="opacity-50" />
        <circle stroke="url(#gradient)" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} strokeLinecap="round" fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
        <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#818cf8" /></linearGradient></defs>
      </svg>
      <div className="absolute flex flex-col items-center text-center animate-in fade-in zoom-in duration-700 pointer-events-none">
        <span className="text-3xl md:text-4xl font-black text-white tracking-tighter drop-shadow-lg">{Math.round(progress)}%</span>
        <span className="text-[9px] md:text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">تعافي</span>
        <span className="text-[9px] md:text-[10px] text-slate-400 mt-2 bg-slate-800/80 px-2 py-1 rounded-full border border-slate-700">{totalSteps} {t('days_left').split(' ')[0]}</span>
      </div>
    </div>
  );
};