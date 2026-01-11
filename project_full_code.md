# Project Code Dump
Generated: 11/1/2026, 05:52:08

## 🌳 Project Structure
```text
├── components
  ├── charts
    └── ProgressRing.tsx
  ├── modals
    ├── BreathingModal.tsx
    ├── DoctorReportModal.tsx
    └── ScientificPlanModal.tsx
  ├── ui
    ├── Badge.tsx
    ├── Button.tsx
    ├── Card.tsx
    ├── LanguageSwitcher.tsx
    ├── LayoutContainer.tsx
    ├── PageHeader.tsx
    └── ProgressRing.tsx
  ├── MobileNav.tsx
  └── Sidebar.tsx
├── contexts
  ├── AuthContext.tsx
  ├── DataContext.tsx
  └── LanguageContext.tsx
├── services
  ├── locales
    ├── ar.ts
    ├── en.ts
    └── ru.ts
  ├── adminServices.ts
  ├── firebase.ts
  ├── taperingEngine.ts
  └── translations.ts
├── views
  ├── admin
    ├── AdminCMS.tsx
    ├── AdminDoctors.tsx
    ├── AdminOverview.tsx
    └── AdminUsers.tsx
  ├── dashboard
    ├── DailyCheckIn.tsx
    ├── DashboardCharts.tsx
    └── DashboardHeader.tsx
  ├── AdminView.tsx
  ├── ArticlesView.tsx
  ├── CalendarView.tsx
  ├── CommunityView.tsx
  ├── DashboardView.tsx
  ├── DoctorDashboardView.tsx
  ├── DoctorPatientsView.tsx
  ├── LoginView.tsx
  ├── OnboardingView.tsx
  ├── SettingsView.tsx
  ├── StatsView.tsx
  └── SupportView.tsx
├── App.tsx
├── firestore.rules
├── index.css
├── index.html
├── index.tsx
├── metadata.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── types.ts
└── vite.config.ts
```

## 📄 File Contents

### File: `components\charts\ProgressRing.tsx`
```tsx

```
---

### File: `components\modals\BreathingModal.tsx`
```tsx
import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Eye, Snowflake, Wind, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BreathingModal = ({ isOpen, onClose }: BreathingModalProps) => {
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
```
---

### File: `components\modals\DoctorReportModal.tsx`
```tsx
import React from 'react';
import { FileText, Printer, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserProfile, DailyLog, PlanDay } from '../../types';
import { Button } from '../ui/Button';

interface DoctorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  logs: DailyLog[];
  plan: PlanDay[];
}

export const DoctorReportModal = ({ 
  isOpen, onClose, userProfile, logs, plan 
}: DoctorReportModalProps) => {
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
```
---

### File: `components\modals\ScientificPlanModal.tsx`
```tsx
import React from 'react';
import { X, BrainCircuit, Activity, Pill, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';

interface ScientificPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ScientificPlanModal = ({ isOpen, onClose, onConfirm }: ScientificPlanModalProps) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/30 rounded-[2.5rem] p-6 md:p-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* تأثير خلفية جمالي */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        {/* زر الإغلاق */}
        <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors z-20"
        >
            <X size={24} />
        </button>

        <div className="relative z-10 overflow-y-auto custom-scrollbar">
            {/* الأيقونة والعنوان */}
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6 border border-white/10 animate-in zoom-in duration-500">
                    <BrainCircuit size={40} className="text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">{t('sci_title')}</h2>
                <p className="text-slate-400 text-lg max-w-md">{t('sci_subtitle')}</p>
            </div>

            {/* المبادئ العلمية */}
            <div className="space-y-6 mb-8">
                {/* المبدأ 1 */}
                <div className="flex gap-5 bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                        <Activity size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg mb-1">{t('sci_principle_1_title')}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{t('sci_principle_1_desc')}</p>
                    </div>
                </div>
                
                {/* المبدأ 2 */}
                <div className="flex gap-5 bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                        <ShieldCheck size={24} className="text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg mb-1">{t('sci_principle_2_title')}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{t('sci_principle_2_desc')}</p>
                    </div>
                </div>

                {/* المبدأ 3 */}
                <div className="flex gap-5 bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                        <Pill size={24} className="text-amber-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg mb-1">{t('sci_principle_3_title')}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{t('sci_principle_3_desc')}</p>
                    </div>
                </div>
            </div>

            {/* المصادر */}
            <div className="bg-slate-800/30 p-5 rounded-2xl border border-dashed border-slate-700 mb-8">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <BookOpen size={14} /> {t('sci_sources_title')}
                </h4>
                <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside font-medium font-mono opacity-80">
                    <li>{t('sci_source_1')}</li>
                    <li>{t('sci_source_2')}</li>
                    <li>{t('sci_source_3')}</li>
                </ul>
            </div>

            {/* زر الموافقة */}
            <div className="flex flex-col md:flex-row gap-4 items-center pt-4 border-t border-white/5">
                <p className="text-xs text-slate-500 text-center md:text-start flex-1 px-2 leading-relaxed">
                    {t('sci_trust_msg')}
                </p>
                <Button onClick={onConfirm} variant="success" className="w-full md:w-auto px-8 py-4 text-lg shadow-lg shadow-emerald-500/20 rounded-xl">
                    {t('sci_btn_understood')} <ArrowRight size={20} className={document.dir === 'rtl' ? 'mr-2 rotate-180' : 'ml-2'} />
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};
```
---

### File: `components\ui\Badge.tsx`
```tsx
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'indigo' | 'green' | 'emerald' | 'red' | 'rose' | 'amber' | 'blue';
  className?: string;
}

export const Badge = ({ children, color = 'indigo', className = '' }: BadgeProps) => {
  const colors: Record<string, string> = {
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
    <span className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold border ${selectedColor} backdrop-blur-md flex items-center gap-1.5 animate-in fade-in zoom-in duration-300 whitespace-nowrap w-fit ${className}`}>
      {children}
    </span>
  );
};
```
---

### File: `components\ui\Button.tsx`
```tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'panic';
  children: React.ReactNode;
}

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, ...props }: ButtonProps) => {
  const baseStyle = "relative overflow-hidden px-6 py-4 rounded-2xl font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale group select-none cursor-pointer";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-indigo-400/20",
    secondary: "bg-slate-800/40 backdrop-blur-md text-slate-300 border border-white/5 hover:bg-slate-700/50 hover:text-white hover:border-white/10",
    danger: "bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.4)]",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.3)] border border-emerald-400/20",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
    panic: "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse"
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseStyle} ${selectedVariant} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300 mix-blend-overlay"></div>
      )}
    </button>
  );
};
```
---

### File: `components\ui\Card.tsx`
```tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card = ({ children, className = '', noPadding = false }: CardProps) => (
  <div className={`bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:border-white/10 transition-all duration-500 ${!noPadding ? 'p-6 md:p-10' : ''} ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
    {children}
  </div>
);
```
---

### File: `components\ui\LanguageSwitcher.tsx`
```tsx
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

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
```
---

### File: `components\ui\LayoutContainer.tsx`
```tsx
import React from 'react';

interface LayoutContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const LayoutContainer = ({ children, className = '' }: LayoutContainerProps) => (
  <div className={`max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${className}`}>
    {children}
  </div>
);
```
---

### File: `components\ui\PageHeader.tsx`
```tsx
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
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
```
---

### File: `components\ui\ProgressRing.tsx`
```tsx
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number;
  totalSteps: number;
}

export const ProgressRing = ({ radius, stroke, progress, totalSteps }: ProgressRingProps) => {
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
```
---

### File: `components\MobileNav.tsx`
```tsx
import React from 'react';
import { 
  LayoutDashboard, Calendar as CalendarIcon, Activity, Settings, Users, 
  LifeBuoy, ShieldAlert, MessageSquare 
} from 'lucide-react';
import { AppView, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface MobileNavProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  userProfile?: UserProfile | null;
}

export const MobileNav = ({ currentView, setCurrentView, userProfile }: MobileNavProps) => {
  const { t, language } = useLanguage();

  const getMenuItems = () => {
    const role = userProfile?.role;
    const items = [];

    // 1. ADMIN MENU
    if (role === 'admin') {
       items.push(
        { id: AppView.ADMIN, icon: ShieldAlert, label: t('nav_admin') },
        // --- تصحيح: تغيير المسمى والأيقونة للأدمن في الموبايل أيضاً ---
        { id: AppView.COMMUNITY, icon: MessageSquare, label: language === 'ar' ? 'المجتمع' : 'Chat' },
        // -------------------------------------------------------------
        { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
       );
    } 
    // 2. DOCTOR MENU
    else if (role === 'doctor') {
        items.push(
            { id: AppView.DOCTOR_DASHBOARD, icon: LayoutDashboard, label: 'Dash' },
            { id: AppView.DOCTOR_PATIENTS, icon: Users, label: 'Patients' },
            { id: AppView.COMMUNITY, icon: MessageSquare, label: 'Chat' },
        );
    } 
    // 3. PATIENT / NORMAL USER MENU
    else {
        // Patient Waiting for Plan
        if (role === 'patient' && !userProfile?.patientData?.isPlanAssigned) {
             items.push(
                { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
                { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
             );
        } else {
             // Standard User
             items.push(
                { id: AppView.DASHBOARD, icon: LayoutDashboard, label: t('nav_dashboard') },
                { id: AppView.CALENDAR, icon: CalendarIcon, label: t('nav_calendar') },
                { id: AppView.STATS, icon: Activity, label: t('nav_stats') },
                { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
             );
        }
    }
    
    // Common settings icon at the end
    items.push({ id: AppView.SETTINGS, icon: Settings, label: t('nav_settings') });
    
    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 h-20 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-50 animate-in slide-in-from-bottom-20 duration-700">
      
      <div className="flex items-center justify-between px-4 h-full overflow-x-auto scrollbar-hide pb-1 gap-2">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex-shrink-0 min-w-[60px] flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group ${
                  isActive ? 'text-indigo-400 -translate-y-3' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`p-3 rounded-full transition-all duration-300 ${
                  isActive 
                  ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-[0_8px_20px_rgba(99,102,241,0.4)] ring-4 ring-[#020617]' 
                  : 'bg-transparent group-hover:bg-white/5'
              }`}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              <span className={`absolute -bottom-5 text-[9px] font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${
                  isActive ? 'opacity-100 translate-y-0 text-white' : 'opacity-0 -translate-y-2 text-slate-500'
              }`}>
                  {item.label}
              </span>
              
              {isActive && (
                  <span className="absolute -bottom-7 w-1 h-1 bg-indigo-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
```
---

### File: `components\Sidebar.tsx`
```tsx
import React from 'react';
import { 
  LayoutDashboard, Calendar as CalendarIcon, Activity, Settings, LogOut, 
  Users, ShieldAlert, User as UserIcon, LifeBuoy, BookOpen, Stethoscope, 
  MessageSquare
} from 'lucide-react';
import { AppView, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
// المسار الصحيح حيث أن Sidebar داخل components و LanguageSwitcher داخل components/ui
import { LanguageSwitcher } from './ui/LanguageSwitcher';

interface SidebarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  handleLogout: () => void;
  userProfile?: UserProfile | null;
}

export const Sidebar = ({ currentView, setCurrentView, handleLogout, userProfile }: SidebarProps) => {
  const { t, language } = useLanguage();

  // تحديد القوائم بناءً على الدور
  const getMenuItems = () => {
    const role = userProfile?.role;
    const items = [];

    // 1. ADMIN MENU
    if (role === 'admin') {
      items.push(
        { id: AppView.ADMIN, icon: ShieldAlert, label: t('nav_admin') }, 
        
        // --- تصحيح هنا: تغيير المسمى من "المستخدمين" إلى "المجتمع" وتغيير الأيقونة ---
        // لأن إدارة المستخدمين موجودة داخل صفحة الأدمن، وهذا الزر مخصص للدردشة العامة
        { id: AppView.COMMUNITY, icon: MessageSquare, label: t('nav_community') },
        // -----------------------------------------------------------------------

        { id: AppView.ARTICLES, icon: BookOpen, label: t('tab_cms') },
        { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
      );
    }
    
    // 2. DOCTOR MENU
    else if (role === 'doctor') {
      items.push(
        { id: AppView.DOCTOR_DASHBOARD, icon: LayoutDashboard, label: t('nav_dashboard') },
        { id: AppView.DOCTOR_PATIENTS, icon: Users, label: t('manage_patients_title') }, 
        { id: AppView.ARTICLES, icon: BookOpen, label: t('nav_articles') },
        { id: AppView.COMMUNITY, icon: MessageSquare, label: t('comm_rooms') }, 
        { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
      );
      items.push({ id: AppView.SETTINGS, icon: Settings, label: t('nav_settings') });
    }

    // 3. PATIENT / NORMAL USER MENU
    else {
      // إذا كان المريض في انتظار الخطة، نعرض له فقط المجتمع والدعم
      if (role === 'patient' && !userProfile?.patientData?.isPlanAssigned) {
         items.push(
            { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
            { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
         );
      } else {
         // المستخدم العادي أو المريض الذي لديه خطة
         items.push(
            { id: AppView.DASHBOARD, icon: LayoutDashboard, label: t('nav_dashboard') },
            { id: AppView.CALENDAR, icon: CalendarIcon, label: t('nav_calendar') },
            { id: AppView.STATS, icon: Activity, label: t('nav_stats') },
            { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
            { id: AppView.ARTICLES, icon: BookOpen, label: t('nav_articles') },
            { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
         );
      }
      items.push({ id: AppView.SETTINGS, icon: Settings, label: t('nav_settings') });
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="hidden md:flex flex-col w-80 bg-slate-950/80 backdrop-blur-2xl border-l border-white/5 h-screen fixed right-0 top-0 overflow-y-auto z-50 shadow-2xl transition-all">
      {/* Header */}
      <div className="p-10 border-b border-white/5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none"></div>
        
        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Activity className="w-6 h-6 text-white" />
          </div>
          Islam's Guide
        </h2>
        
        <div className="mr-[3.25rem] mt-2">
            {userProfile?.role === 'doctor' && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {language === 'ar' ? 'نسخة الأطباء' : 'Doctor Edition'}
                </span>
            )}
            {userProfile?.role === 'admin' && (
                <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
                </span>
            )}
            {(userProfile?.role === 'patient' || userProfile?.role === 'normal_user') && (
                <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                    Smart Edition <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </span>
            )}
        </div>
      </div>
      
      {/* Menu */}
      <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
              currentView === item.id 
              ? 'bg-gradient-to-r from-indigo-600/10 to-transparent text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]' 
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            {currentView === item.id && (
              <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_indigo]"></div>
            )}
            <item.icon className={`w-5 h-5 transition-transform duration-300 ${currentView === item.id ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-slate-600 group-hover:text-slate-400'}`} />
            <span className="font-bold text-lg tracking-wide truncate">{item.label}</span>
            
            {item.id === AppView.ADMIN && (
                <span className="mr-auto w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
            )}
          </button>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="p-6 border-t border-white/5 shrink-0 space-y-6">
        <LanguageSwitcher />
        
        <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 flex items-center gap-3 group hover:border-indigo-500/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                {userProfile?.role === 'doctor' ? <Stethoscope size={18} /> : (userProfile?.name?.charAt(0).toUpperCase() || <UserIcon size={18} />)}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{userProfile?.name || 'Guest'}</p>
                <p className="text-[10px] text-slate-500 truncate">{userProfile?.role?.toUpperCase()}</p>
            </div>
            <button 
                onClick={handleLogout} 
                className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                title={t('logout')}
            >
                <LogOut size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};
```
---

### File: `contexts\AuthContext.tsx`
```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  enableDemoMode: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // مراقبة حالة المستخدم (Firebase Listener)
  useEffect(() => {
    // التحقق من وجود auth لضمان عدم حدوث أخطاء إذا لم يتم تهيئة Firebase
    if (!auth) {
        setLoading(false);
        // لا نقوم بضبط خطأ هنا حتى لا يظهر للمستخدم العادي في حالة الديمو
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isDemoMode) {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const loginWithEmail = async (email: string, password: string) => {
    if (!auth) {
        setError("Authentication service is not initialized.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      let errorMessage = 'Login Error';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please check your email.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      } else {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!auth) {
        setError("Authentication service is not initialized.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError('Google Login Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (!isDemoMode && auth) {
        await signOut(auth);
      }
      setIsDemoMode(false);
      setCurrentUser(null);
      // مسح التخزين المحلي لضمان خروج نظيف
      localStorage.removeItem('taper_profile');
      localStorage.removeItem('taper_plan');
      window.location.reload();
    } catch (err: any) {
      console.error("Logout Error:", err);
    }
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    // التصحيح هنا: استخدام as unknown as User لإجبار التايب سكربت على قبول الكائن الناقص
    setCurrentUser({ 
      uid: 'demo-user', 
      email: 'demo@example.com', 
      displayName: 'Demo User',
      emailVerified: true,
      isAnonymous: true,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: null,
      photoURL: null,
    } as unknown as User);
    setLoading(false);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      error, 
      isDemoMode,
      loginWithEmail, 
      loginWithGoogle, 
      logout,
      enableDemoMode,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```
---

### File: `contexts\DataContext.tsx`
```tsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Inventory, PlanDay, DailyLog } from '../types';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

interface DataContextType {
  userProfile: UserProfile | null;
  setUserProfile: (p: UserProfile | null) => void;
  inventory: Inventory;
  setInventory: (i: Inventory) => void;
  plan: PlanDay[];
  setPlan: (p: PlanDay[]) => void;
  logs: DailyLog[];
  setLogs: (l: DailyLog[]) => void;
  speedModifier: number;
  setSpeedModifier: (s: number) => void;
  dataLoading: boolean;
  resyncData: () => void;
  resetAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isDemoMode, logout } = useAuth();
  const { t } = useLanguage();

  // -- Data State --
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [inventory, setInventory] = useState<Inventory>({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
  const [plan, setPlan] = useState<PlanDay[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [speedModifier, setSpeedModifier] = useState<number>(1.0);
  const [dataLoading, setDataLoading] = useState(true);

  // Ref to track unsaved changes
  const isDirty = useRef(false);

  // 1. Fetch Data Listener
  useEffect(() => {
    if (!currentUser) {
      if (!isDemoMode) {
        // Reset state on logout
        setUserProfile(null);
        setPlan([]);
        setLogs([]);
        setInventory({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
        setDataLoading(false);
      } else {
        // Demo Mode - Assume setup handled elsewhere or mock data
        setDataLoading(false);
      }
      return;
    }

    // Check if we have pending data from a crash/close
    const savedLogs = localStorage.getItem('pending_sync_logs');
    if (savedLogs) {
        try {
            const parsedLogs = JSON.parse(savedLogs);
            if (parsedLogs.length > 0) setLogs(parsedLogs);
            localStorage.removeItem('pending_sync_logs'); // Clear after load
        } catch (e) { console.error("Error loading pending logs", e); }
    }

    setDataLoading(true);
    const docRef = doc(db, "users", currentUser.uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fetchedProfile = { ...data, uid: currentUser.uid } as UserProfile;
        
        // Merge nested object if exists (legacy support)
        if (data.userProfile) Object.assign(fetchedProfile, data.userProfile);

        setUserProfile(fetchedProfile);

        // Only update local state from cloud if we are not currently "dirty" (editing)
        // This prevents overwriting local changes with old cloud data during rapid edits
        if (!isDirty.current) {
            if (data.plan) setPlan(data.plan);
            if (data.logs) setLogs(data.logs);
            if (data.inventory) setInventory(data.inventory);
            if (data.speedModifier) setSpeedModifier(data.speedModifier);
        }

        // Security Check
        if (data.isBanned) {
           alert(t('banned_msg'));
           logout();
        }
      } else {
        // New User Skeleton
        setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            name: currentUser.displayName || 'New User',
            role: 'normal_user',
            setupComplete: false,
            durationMonths: 0
        });
      }
      setDataLoading(false);
    }, (error) => {
      console.error("Error fetching user data:", error);
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, isDemoMode]);

  // 2. Sync Logic (Debounced Save + Persistence)
  useEffect(() => {
    // Flag that we have changes
    if (userProfile?.setupComplete) {
        isDirty.current = true;
    }

    // A. Local Storage Backup (Immediate)
    if (userProfile) localStorage.setItem('taper_profile', JSON.stringify(userProfile));
    if (plan.length > 0) localStorage.setItem('taper_plan', JSON.stringify(plan));
    
    // B. Cloud Sync (Debounced)
    if (currentUser && !isDemoMode && userProfile?.setupComplete) {
        // Skip sync for doctors who don't have profile data yet
        if (userProfile.role === 'doctor' && !userProfile.doctorData) return;

        const timeoutId = setTimeout(async () => {
            try {
                const totalDays = plan.length;
                const daysCompleted = logs.length;
                const progressPercentage = totalDays > 0 ? (daysCompleted / totalDays) * 100 : 0;

                const updateData: any = {
                    email: currentUser.email,   
                    uid: currentUser.uid,       
                    lastActive: new Date().toISOString(),
                    ...(userProfile.name ? { name: userProfile.name } : {})
                };

                // Only sync large data arrays for patients/users
                if (userProfile.role === 'patient' || userProfile.role === 'normal_user') {
                    updateData.plan = plan;
                    updateData.logs = logs;
                    updateData.inventory = inventory;
                    updateData.speedModifier = speedModifier;
                    updateData.progress = progressPercentage;
                }
                
                // Sync Doctor Data structure if needed
                if (userProfile.role === 'doctor' && userProfile.doctorData) {
                    updateData.doctorData = userProfile.doctorData;
                }

                await setDoc(doc(db, "users", currentUser.uid), updateData, { merge: true });
                
                // Reset dirty flag after successful sync
                isDirty.current = false;

            } catch(e) {
                console.error("Cloud sync failed", e);
            }
        }, 5000); // 5 seconds debounce

        // C. Safety Net: Save to localStorage on tab close
        const handleBeforeUnload = () => {
            if (isDirty.current) {
                localStorage.setItem('pending_sync_logs', JSON.stringify(logs));
                localStorage.setItem('pending_sync_plan', JSON.stringify(plan));
                localStorage.setItem('pending_sync_inv', JSON.stringify(inventory));
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }
  }, [userProfile, plan, logs, inventory, speedModifier, currentUser, isDemoMode]);

  const resyncData = () => {
      setDataLoading(true);
      setTimeout(() => setDataLoading(false), 1000);
  };

  const resetAllData = async () => {
      localStorage.clear();
      setUserProfile(null);
      setPlan([]);
      setLogs([]);
      setInventory({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
      await logout();
  };

  return (
    <DataContext.Provider value={{ 
      userProfile, setUserProfile,
      inventory, setInventory,
      plan, setPlan,
      logs, setLogs,
      speedModifier, setSpeedModifier,
      dataLoading,
      resyncData,
      resetAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
```
---

### File: `contexts\LanguageContext.tsx`
```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../services/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string; // Type-safe translation keys
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children?: React.ReactNode }) => {
  // 1. Initialize Language State
  const [language, setLanguageState] = useState<Language>(() => {
    // A. Check Local Storage first
    const saved = localStorage.getItem('app_lang');
    if (saved && ['ar', 'en', 'ru'].includes(saved)) {
        return saved as Language;
    }
    
    // B. Check Browser Language preference
    if (typeof navigator !== 'undefined') {
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'ar') return 'ar';
        if (browserLang === 'ru') return 'ru';
    }

    // C. Default fallback (Arabic for this specific audience)
    return 'ar'; 
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
    
    // Update HTML attributes for accessibility and CSS
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  };

  // The translation function
  const t = (key: keyof typeof translations['en']) => {
    // Fallback to English if key missing in current lang, then fallback to key string
    return translations[language][key] || translations['en'][key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Effect to sync direction on mount/change
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
```
---

### File: `services\locales\ar.ts`
```ts
export const ar = {
    // Auth
    welcome: "مرحباً بك",
    subtitle: "نظام التعافي الذكي القائم على علم الأعصاب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    login_email: "تسجيل الدخول",
    login_google: "دخول عبر Google",
    demo_account: "حساب تجريبي",
    error_prefix: "تنبيه: ",
    or: "أو",
    banned_msg: "تم تعليق حسابك. يرجى مراجعة الدعم الفني.",
    
    // Sidebar & Nav
    nav_dashboard: "الرئيسية",
    nav_calendar: "الجدول الزمني",
    nav_stats: "التحليلات",
    nav_settings: "الإعدادات",
    nav_community: "المجتمع",
    nav_admin: "الإدارة",
    nav_support: "الدعم الفني",
    nav_articles: "المعرفة",
    logout: "تسجيل خروج",
    create_room: "إنشاء غرفة",
    room_name: "اسم الغرفة",
    type_msg: "اكتب رسالتك...",
    comm_rooms: "غرف الدردشة",
    comm_leaderboard: "لوحة المتصدرين",

    // Dashboard
    daily_report: "المتابعة اليومية",
    days_left: "أيام متبقية",
    status_stable: "الحالة مستقرة",
    safety_active: "نظام الأمان نشط",
    safety_desc: "رصدت الخوارزمية تذبذباً في مؤشراتك الحيوية. تم تفعيل بروتوكول التثبيت مؤقتاً لحمايتك من الأعراض الانسحابية.",
    freeze_plan_btn: "تجميد الخطة (راحة 3 أيام)",
    target_dose: "الجرعة المستهدفة لليوم",
    documented: "تم التوثيق بنجاح",
    dose: "الجرعة",
    mood: "المزاج",
    excellent: "ممتاز",
    stable: "جيد",
    bad: "متعب",
    step_1: "الجرعة الفعلية",
    step_2: "المؤشرات الحيوية",
    confirm_log: "تأكيد وتحديث المخزون",
    algo_active: "المحلل الذكي يعمل",
    algo_desc: "نظام آمن يحسب التخفيض بناءً على الكمية المتوفرة.",
    recovery_path: "مسار التعافي المتوقع",
    sos_button: "طوارئ (SOS)",
    export_report: "تقرير للطبيب",
    print: "طباعة التقرير", 
    
    // Inventory
    inv_status_ok: "المخزون كافٍ",
    inv_status_low: "نقص في المخزون",
    inv_alert_desc: "بناءً على وتيرتك الحالية، قد ينفد المخزون قبل انتهاء فترة التثبيت النهائية. يوصى بتقليل السرعة أو توفير المزيد.",
    inventory_title: "جرد المخزون",
    boxes: "عدد العبوات الكاملة",
    pills_per_box: "الكمية داخل العبوة",
    loose_pills: "الكمية المفردة (فراط)",
    total_balance: "الرصيد الكلي",
    current_habit: "جرعتك الحالية",
    analyze_plan: "تحليل وإنشاء الخطة",
    guest: "زائر",

    // Toasts
    toast_log_success: "تم حفظ البيانات وإعادة حساب المتبقي",
    toast_freeze_success: "تم تفعيل وضع الراحة لمدة 3 أيام",
    toast_speed_updated: "تم تعديل وتيرة الخطة العلاجية بنجاح",

    // Features
    sleep_label: "ساعات النوم",
    symptoms_label: "هل تشعر بأي مما يلي؟",
    sym_insomnia: "أرق",
    sym_anxiety: "قلق",
    sym_sweating: "تعرق",
    sym_shake: "رجفة",
    sym_nausea: "غثيان",
    sym_headache: "صداع",
    
    // Badges
    badges_title: "الإنجازات",
    badge_7days: "محارب الأسبوع",
    badge_halfway: "منتصف الطريق",
    badge_sleep: "نوم منتظم",
    badge_stable: "ثبات انفعالي",

    // SOS
    sos_title: "بروتوكول الطوارئ",
    sos_phase_1_title: "توقف.",
    sos_phase_1_text: "أنت بأمان. هذا شعور كيميائي مؤقت سيعبر.",
    sos_btn_ground: "التالي",
    sos_phase_2_title: "الوعي الحسي",
    sos_phase_2_text: "انظر حولك. سمِّ 5 أشياء زرقاء.",
    sos_btn_next: "تم",
    sos_phase_3_title: "صدمة حرارية",
    sos_phase_3_text: "اغسل وجهك بماء بارد جداً لتفعيل العصب الحائر.",
    sos_btn_breathe: "تمارين التنفس",
    sos_phase_4_title: "تنفس",
    sos_phase_4_subtitle: "شهيق عميق... زفير بطيء.",
    breathe_in: "شهيق",
    breathe_hold: "إمساك",
    breathe_out: "زفير",
    close: "إنهاء",

    // Settings & Profile
    settings_title: "إعدادات النظام",
    settings_subtitle: "التحكم في الخوارزمية",
    pace_control: "وتيرة التعافي",
    pace_desc: "يمكنك تعديل سرعة الخطة في أي وقت. النظام سيقوم بإعادة توزيع المخزون تلقائياً لضمان عدم انقطاع الدواء.",
    pace_slow: "مريح (تمديد)",
    pace_balanced: "متوازن (قياسي)",
    pace_fast: "سريع (مكثف)",
    danger_zone: "منطقة الخطر",
    factory_reset_btn: "إعادة ضبط المصنع (حذف البيانات)",
    profile_title: "الملف الشخصي",
    photo_url_label: "رابط الصورة الشخصية",
    save_changes: "حفظ التغييرات",
    rank_label: "التصنيف العالمي",
    edit_profile: "تعديل الملف",

    // Onboarding & Roles
    onboard_title: "أهلاً بك في Islam's Guide",
    onboard_desc: "قبل البدء، يرجى تحديد طبيعة استخدامك للنظام.",
    role_patient: "مستخدم / مريض",
    role_patient_desc: "أريد التعافي من الدواء، سواء بمساعدة الخوارزمية الذكية أو تحت إشراف طبيب مختص.",
    role_doctor: "طبيب معالج",
    role_doctor_desc: "أرغب في الانضمام للكادر الطبي لمتابعة المرضى وإنشاء الخطط العلاجية لهم.",
    
    // Doctor Registration
    doc_req_title: "طلب اعتماد طبيب",
    doc_req_desc: "ستتم مراجعة بياناتك من قبل الإدارة قبل تفعيل حسابك.",
    doc_fullname: "الاسم الكامل (كما سيظهر للمرضى)",
    doc_specialty: "التخصص الطبي",
    doc_license: "رقم الترخيص المهني",
    doc_location: "مقر العيادة / المستشفى",
    doc_phone: "رقم هاتف للتواصل (للإدارة)",
    doc_bio: "نبذة تعريفية (تظهر للمرضى)",
    doc_submit: "إرسال طلب الاعتماد",

    // Path Selection
    path_select_title: "اختر مسار العلاج",
    path_algo: "الخوارزمية الذكية",
    path_algo_desc: "أريد أن يقوم الموقع بحساب خطة التخفيض تلقائياً بناءً على كمية الدواء المتوفرة لدي.",
    path_doctor: "متابعة مع طبيب",
    path_doctor_desc: "سأقوم باختيار طبيب من المنصة، وانتظر حتى يقوم هو بوضع الجدول العلاجي المناسب لي.",

    // Doctor Selection
    doc_select_title: "اختر طبيبك المعالج",
    doc_search_placeholder: "بحث باسم الطبيب...",
    doc_select_btn: "إرسال طلب انضمام", 

    // Algorithm Setup
    med_type_title: "نوع الدواء",
    med_type_narcotic: "مخدرات (جدول أول)",
    med_type_narcotic_desc: "يتطلب حجز في مصحة",
    med_type_psych: "أدوية نفسية",
    med_type_psych_desc: "يتطلب إشراف طبي",
    med_type_normal: "أدوية عامة",
    med_type_normal_desc: "آمن للتخفيض الذاتي",
    blocked_title: "الدخول محظور",
    warning_title: "تنبيه طبي هام",
    med_form_title: "شكل الدواء",
    form_tablet: "أقراص / حبوب",
    form_liquid: "سائل / قطرات",
    unit_title: "وحدة القياس",

    // Doctor Dashboard & Plan Builder (NEW)
    stat_total_patients: "إجمالي المرضى",
    stat_new_requests: "طلبات جديدة",
    stat_recovered: "حالات التعافي",
    stat_overview: "نظرة عامة",
    create_plan_btn: "إنشاء الخطة العلاجية",
    plan_notes: "ملاحظات للمريض",
    plan_phases: "مراحل التخفيض",
    duration_days: "المدة (أيام)",
    submit_plan: "اعتماد وإرسال",
    
    // NEW KEYS FOR PLAN BUILDER
    pattern_builder: "منشئ الأنماط",
    pattern_sequence: "النمط (مثال: 0.5, 0, 0.5, 0)",
    repeat_count: "عدد التكرار",
    days_per_dose: "أيام لكل جرعة",
    apply_pattern: "تطبيق النمط",
    clear_phases: "مسح الكل",
    
    // NEW KEYS FOR PATIENT REQUESTS
    patient_requests_title: "طلبات المرضى الجدد",
    accept_patient: "قبول",
    reject_patient: "رفض",
    no_requests: "لا توجد طلبات معلقة",
    req_sent_msg: "تم إرسال طلبك للطبيب. يرجى الانتظار لحين الموافقة.",

    // Admin & Management
    admin_title: "غرفة التحكم المركزية",
    admin_subtitle: "نظام الإدارة المتكامل",
    tab_overview: "نظرة عامة",
    tab_doctors: "إدارة الأطباء",
    tab_users: "المستخدمين",
    tab_cms: "المحتوى",
    stat_approved_docs: "أطباء معتمدين",
    pending_approvals: "طلبات الانضمام المعلقة",
    review_btn: "مراجعة",
    approve_btn: "اعتماد",
    reject_btn: "رفض",
    approved_docs_list: "قائمة الأطباء المعتمدين",
    ban_user: "حظر",
    unban_user: "فك الحظر",
    delete_user: "حذف نهائي", 
    delete_confirm_msg: "هل أنت متأكد من حذف هذا المستخدم نهائياً؟ لا يمكن التراجع عن هذا الإجراء.", 
    view_details: "عرض التفاصيل", 
    search_user_placeholder: "بحث عن مستخدم...",
    
    // Patient Management
    manage_patients_title: "إدارة ملفات المرضى",
    add_patient_btn: "ضم مريض جديد",
    back_list_btn: "العودة للقائمة",
    search_available_placeholder: "بحث عن مستخدم بالاسم أو البريد...",
    add_btn: "ضم",
    
    // Articles
    knowledge_center: "مركز المعرفة",
    knowledge_desc: "مقالات طبية ونصائح يومية لمساعدتك في رحلة التعافي.",
    new_article_btn: "نشر مقال جديد",
    article_title_label: "عنوان المقال",
    article_cat_label: "التصنيف",
    article_content_label: "المحتوى",
    publish_now: "نشر الآن",
    cat_medical: "طبي وعلمي",
    cat_motivation: "دعم نفسي",
    cat_tip: "نصائح عملية",
    cat_all: "الكل",
    cancel_btn: "إلغاء",
    read_more: "قراءة المزيد",
    author_by: "بقلم",

    // Support & Tickets
    support_desc: "تواصل مباشرة مع الفريق التقني والإداري للنظام.",
    new_ticket: "فتح تذكرة جديدة",
    new_ticket_title: "طلب مساعدة جديد",
    ticket_subject: "الموضوع",
    ticket_details: "التفاصيل",
    send_request: "إرسال الطلب",
    my_tickets: "تذاكري",
    no_tickets: "لا توجد تذاكر سابقة.",
    select_ticket_prompt: "اختر تذكرة لعرض التفاصيل أو ابدأ تذكرة جديدة",
    status_open: "مفتوح",
    status_pending: "قيد المراجعة",
    status_resolved: "تم الحل",
    status_closed: "مغلق",
    ticket_closed_msg: "تم إغلاق هذه التذكرة. لفتحها مجدداً، يرجى إنشاء تذكرة جديدة.",
    write_reply: "اكتب ردك هنا...",
    me: "أنا",
    support_team: "الدعم الفني",
    current_account: "حسابك الحالي",

    // Scientific Modal (New)
    sci_title: "تم بناء خطتك على أسس علمية",
    sci_subtitle: "تعتمد هذه الخوارزمية على أحدث البروتوكولات الطبية العالمية لعام 2024.",
    sci_principle_1_title: "التخفيض الزائدي (Hyperbolic Tapering)",
    sci_principle_1_desc: "نظام يقلل نسبة الخصم كلما انخفضت الجرعة. هذا يمنع 'صدمة المستقبلات' التي تحدث عند التوقف المفاجئ في الجرعات الصغيرة.",
    sci_principle_2_title: "التكيف العصبي (Neuro-Adaptation)",
    sci_principle_2_desc: "الخطة ليست ثابتة. النظام يحلل نومك ومزاجك يومياً ويقوم بتعديل سرعة التخفيض تلقائياً لحمايتك من الأعراض الانسحابية.",
    sci_principle_3_title: "محاكاة المخزون (Inventory Optimization)",
    sci_principle_3_desc: "تم حساب كل حبة متبقية لديك لضمان عدم انقطاع الدواء فجأة قبل الوصول لخط النهاية الآمن.",
    sci_sources_title: "المصادر والمراجع العلمية:",
    sci_source_1: "The Maudsley Deprescribing Guidelines (Horowitz & Taylor, 2024)",
    sci_source_2: "The Ashton Manual (Benzodiazepines: How They Work and How to Withdraw)",
    sci_source_3: "Lancet Psychiatry: Tapering of SSRIs to mitigate withdrawal symptoms",
    sci_trust_msg: "هذا النظام مصمم ليكون مساعداً، لكنه لا يستبدل استشارة طبيبك الخاص.",
    sci_btn_understood: "فهمت، ابدأ الخطة",

    // Community & Inventory New Keys
    community_clinic: "عيادة الطبيب",
    community_public_room_hint: "* ستكون هذه الغرفة عامة ويمكن لجميع المستخدمين رؤيتها والانضمام إليها.",
    community_doctor_room_hint: "* سيتمكن جميع مرضاك الحاليين والمستقبليين من دخول هذه الغرفة تلقائياً.",
    inventory_updated_msg: "تم تحديث المخزون وإعادة حساب الرصيد."
};
```
---

### File: `services\locales\en.ts`
```ts
export const en = {
    welcome: "Welcome",
    subtitle: "Neuro-Scientific Recovery System",
    email: "Email",
    password: "Password",
    login_email: "Login",
    login_google: "Google Login",
    demo_account: "Demo Access",
    error_prefix: "Error: ",
    or: "OR",
    banned_msg: "Account suspended.",
    nav_dashboard: "Dashboard",
    nav_calendar: "Schedule",
    nav_stats: "Analytics",
    nav_settings: "Settings",
    nav_community: "Community",
    nav_admin: "Admin",
    nav_support: "Support",
    nav_articles: "Knowledge",
    logout: "Logout",
    create_room: "Create Room",
    room_name: "Room Name",
    type_msg: "Type a message...",
    comm_rooms: "Chat Rooms",
    comm_leaderboard: "Leaderboard",
    daily_report: "Daily Check-in",
    days_left: "Days Left",
    status_stable: "Stable",
    safety_active: "Safety Guard Active",
    safety_desc: "Biometric instability detected. Doses stabilized temporarily.",
    freeze_plan_btn: "Freeze (3 Days Rest)",
    target_dose: "Target Dose",
    documented: "Logged Successfully",
    dose: "Dose",
    mood: "Mood",
    excellent: "Great",
    stable: "Good",
    bad: "Bad",
    step_1: "Actual Dose",
    step_2: "Vitals",
    confirm_log: "Confirm & Update Inventory",
    algo_active: "Smart Engine Active",
    algo_desc: "Safety-first tapering system.",
    recovery_path: "Projected Path",
    sos_button: "SOS",
    export_report: "Doctor Report",
    print: "Print Report",
    inv_status_ok: "Inventory Sufficient",
    inv_status_low: "Low Inventory",
    inv_alert_desc: "Current pace may deplete inventory before tapering ends. Consider slowing down.",
    inventory_title: "Inventory Check",
    boxes: "Full Boxes",
    pills_per_box: "Qty per Box",
    loose_pills: "Loose Qty",
    total_balance: "Total Balance",
    current_habit: "Current Dose",
    analyze_plan: "Generate Plan",
    guest: "Guest",
    toast_log_success: "Log saved. Plan recalculated.",
    toast_freeze_success: "Plan frozen for 3 days.",
    toast_speed_updated: "Pace updated successfully.",
    sleep_label: "Sleep Hours",
    symptoms_label: "Symptoms",
    sym_insomnia: "Insomnia",
    sym_anxiety: "Anxiety",
    sym_sweating: "Sweating",
    sym_shake: "Tremors",
    sym_nausea: "Nausea",
    sym_headache: "Headache",
    badges_title: "Milestones",
    badge_7days: "Week Warrior",
    badge_halfway: "Halfway Point",
    badge_sleep: "Sleep Restored",
    badge_stable: "Emotional Stability",
    sos_title: "Emergency Protocol",
    sos_phase_1_title: "STOP.",
    sos_phase_1_text: "You are safe. This is just chemistry.",
    sos_btn_ground: "Next",
    sos_phase_2_title: "Grounding",
    sos_phase_2_text: "Name 5 blue objects.",
    sos_btn_next: "Done",
    sos_phase_3_title: "Thermal Shock",
    sos_phase_3_text: "Use ice water on your face.",
    sos_btn_breathe: "Breathe",
    sos_phase_4_title: "Breathe",
    sos_phase_4_subtitle: "Deep inhale... slow exhale.",
    breathe_in: "Inhale",
    breathe_hold: "Hold",
    breathe_out: "Exhale",
    close: "Close",
    settings_title: "System Settings",
    settings_subtitle: "Algorithm Control",
    pace_control: "Tapering Pace",
    pace_desc: "Adjust speed anytime. The system auto-recalculates to ensure supply lasts.",
    pace_slow: "Relaxed (Extend)",
    pace_balanced: "Balanced",
    pace_fast: "Fast (Intense)",
    danger_zone: "Danger Zone",
    factory_reset_btn: "Factory Reset",
    profile_title: "My Profile",
    photo_url_label: "Profile Photo URL",
    save_changes: "Save Changes",
    rank_label: "Global Rank",
    edit_profile: "Edit Profile",

    onboard_title: "Welcome to Islam's Guide",
    onboard_desc: "Before we start, please select how you'll use the system.",
    role_patient: "User / Patient",
    role_patient_desc: "I want to taper off medication, either via the Smart Algorithm or under doctor supervision.",
    role_doctor: "Therapist / Doctor",
    role_doctor_desc: "I want to join the medical staff to monitor patients and create treatment plans.",
    doc_req_title: "Doctor Accreditation Request",
    doc_req_desc: "Your details will be reviewed by admin before account activation.",
    doc_fullname: "Full Name (Visible to patients)",
    doc_specialty: "Medical Specialty",
    doc_license: "License Number",
    doc_location: "Clinic / Hospital Location",
    doc_phone: "Contact Phone (For Admin)",
    doc_bio: "Bio (Visible to patients)",
    doc_submit: "Submit Request",
    path_select_title: "Choose Treatment Path",
    path_algo: "Smart Algorithm",
    path_algo_desc: "I want the system to auto-calculate my tapering plan based on my inventory.",
    path_doctor: "Follow with a Doctor",
    path_doctor_desc: "I will choose a doctor from the platform and wait for them to assign a plan.",
    doc_select_title: "Select Your Doctor",
    doc_search_placeholder: "Search by doctor name...",
    doc_select_btn: "Request to Join", 

    med_type_title: "Medication Type",
    med_type_narcotic: "Narcotics (Schedule I)",
    med_type_narcotic_desc: "Requires Rehab Center",
    med_type_psych: "Psychiatric Meds",
    med_type_psych_desc: "Requires Medical Supervision",
    med_type_normal: "General Meds",
    med_type_normal_desc: "Safe for Self-Tapering",
    blocked_title: "Access Restricted",
    warning_title: "Important Medical Warning",
    med_form_title: "Medication Form",
    form_tablet: "Tablets / Pills",
    form_liquid: "Liquid / Drops",
    unit_title: "Measurement Unit",
    stat_total_patients: "Total Patients",
    stat_new_requests: "New Requests",
    stat_recovered: "Recovered",
    stat_overview: "Overview",
    create_plan_btn: "Create Treatment Plan",
    plan_notes: "Notes for Patient",
    plan_phases: "Tapering Phases",
    duration_days: "Duration (Days)",
    submit_plan: "Approve & Send",
    
    // NEW KEYS FOR PLAN BUILDER
    pattern_builder: "Pattern Builder",
    pattern_sequence: "Sequence (e.g. 0.5, 0, 0.5, 0)",
    repeat_count: "Repeat Count",
    days_per_dose: "Days per Dose",
    apply_pattern: "Apply Pattern",
    clear_phases: "Clear All",

    // NEW KEYS FOR PATIENT REQUESTS
    patient_requests_title: "Patient Requests",
    accept_patient: "Accept",
    reject_patient: "Reject",
    no_requests: "No pending requests",
    req_sent_msg: "Request sent. Waiting for doctor approval.",

    admin_title: "Central Control Room",
    admin_subtitle: "Integrated Management System",
    tab_overview: "Overview",
    tab_doctors: "Doctors",
    tab_users: "Users",
    tab_cms: "Content",
    stat_approved_docs: "Approved Doctors",
    pending_approvals: "Pending Approvals",
    review_btn: "Review",
    approve_btn: "Approve",
    reject_btn: "Reject",
    approved_docs_list: "Approved Doctors List",
    ban_user: "Ban",
    unban_user: "Unban",
    delete_user: "Delete User", 
    delete_confirm_msg: "Are you sure you want to permanently delete this user? This cannot be undone.", 
    view_details: "View Details", 
    search_user_placeholder: "Search user...",
    manage_patients_title: "Patient Files Management",
    add_patient_btn: "Add New Patient",
    back_list_btn: "Back to List",
    search_available_placeholder: "Search user by name or email...",
    add_btn: "Add",
    knowledge_center: "Knowledge Center",
    knowledge_desc: "Medical articles and daily tips to help your recovery journey.",
    new_article_btn: "New Article",
    article_title_label: "Article Title",
    article_cat_label: "Category",
    article_content_label: "Content",
    publish_now: "Publish Now",
    cat_medical: "Medical",
    cat_motivation: "Motivation",
    cat_tip: "Tip",
    cat_all: "All",
    cancel_btn: "Cancel",
    read_more: "Read More",
    author_by: "By",

    // Support & Tickets
    support_desc: "Contact the support team directly.",
    new_ticket: "New Ticket",
    new_ticket_title: "New Support Request",
    ticket_subject: "Subject",
    ticket_details: "Details",
    send_request: "Submit",
    my_tickets: "My Tickets",
    no_tickets: "No previous tickets.",
    select_ticket_prompt: "Select a ticket to view details",
    status_open: "Open",
    status_pending: "Pending",
    status_resolved: "Resolved",
    status_closed: "Closed",
    ticket_closed_msg: "This ticket is closed.",
    write_reply: "Write your reply...",
    me: "Me",
    support_team: "Support",
    current_account: "Current Account",

    // Scientific Modal (New)
    sci_title: "Your Plan is Scientifically Grounded",
    sci_subtitle: "This algorithm is based on the latest global medical protocols of 2024.",
    sci_principle_1_title: "Hyperbolic Tapering",
    sci_principle_1_desc: "A system that reduces the cut rate as the dose gets lower. This prevents 'receptor shock' that occurs with sudden stops at low doses.",
    sci_principle_2_title: "Neuro-Adaptation",
    sci_principle_2_desc: "The plan is not static. The system analyzes your sleep and mood daily and automatically adjusts the tapering speed to protect you from withdrawal symptoms.",
    sci_principle_3_title: "Inventory Optimization",
    sci_principle_3_desc: "Every remaining pill has been calculated to ensure the medication doesn't run out suddenly before reaching the safe finish line.",
    sci_sources_title: "Scientific Sources & References:",
    sci_source_1: "The Maudsley Deprescribing Guidelines (Horowitz & Taylor, 2024)",
    sci_source_2: "The Ashton Manual (Benzodiazepines: How They Work and How to Withdraw)",
    sci_source_3: "Lancet Psychiatry: Tapering of SSRIs to mitigate withdrawal symptoms",
    sci_trust_msg: "This system is designed to be an assistant, but it does not replace the advice of your personal doctor.",
    sci_btn_understood: "Understood, Start Plan",

    // Community & Inventory New Keys
    community_clinic: "Doctor's Clinic",
    community_public_room_hint: "* This room will be public and visible to all users.",
    community_doctor_room_hint: "* All your current and future patients will be able to access this room automatically.",
    inventory_updated_msg: "Inventory updated and balance recalculated."
};
```
---

### File: `services\locales\ru.ts`
```ts
export const ru = {
    // Auth
    welcome: "Добро пожаловать",
    subtitle: "Нейро-научная система восстановления",
    email: "Эл. почта",
    password: "Пароль",
    login_email: "Войти",
    login_google: "Войти через Google",
    demo_account: "Демо-доступ",
    error_prefix: "Ошибка: ",
    or: "ИЛИ",
    banned_msg: "Ваш аккаунт заблокирован. Свяжитесь с поддержкой.",
    
    // Sidebar & Nav
    nav_dashboard: "Главная",
    nav_calendar: "График",
    nav_stats: "Аналитика",
    nav_settings: "Настройки",
    nav_community: "Сообщество",
    nav_admin: "Админ",
    nav_support: "Поддержка",
    nav_articles: "База знаний",
    logout: "Выход",
    create_room: "Создать комнату",
    room_name: "Название комнаты",
    type_msg: "Введите сообщение...",
    comm_rooms: "Чат-комнаты",
    comm_leaderboard: "Лидеры",

    // Dashboard
    daily_report: "Ежедневный отчет",
    days_left: "Дней осталось",
    status_stable: "Стабильно",
    safety_active: "Защита активна",
    safety_desc: "Обнаружена нестабильность биометрии. Доза временно зафиксирована.",
    freeze_plan_btn: "Заморозить (3 дня отдыха)",
    target_dose: "Целевая доза",
    documented: "Записано успешно",
    dose: "Доза",
    mood: "Настроение",
    excellent: "Отлично",
    stable: "Хорошо",
    bad: "Плохо",
    step_1: "Фактическая доза",
    step_2: "Показатели",
    confirm_log: "Подтвердить и обновить",
    algo_active: "Смарт-алгоритм активен",
    algo_desc: "Система безопасного снижения на основе запасов.",
    recovery_path: "Прогноз восстановления",
    sos_button: "SOS",
    export_report: "Отчет для врача",
    print: "Печать отчета",
    
    // Inventory
    inv_status_ok: "Запас достаточен",
    inv_status_low: "Низкий запас",
    inv_alert_desc: "Текущий темп может истощить запасы до окончания курса. Рекомендуется замедлиться.",
    inventory_title: "Инвентарь",
    boxes: "Полные упаковки",
    pills_per_box: "Шт. в упаковке",
    loose_pills: "Остаток (шт)",
    total_balance: "Общий баланс",
    current_habit: "Текущая доза",
    analyze_plan: "Создать план",
    guest: "Гость",

    // Toasts
    toast_log_success: "Данные сохранены. План пересчитан.",
    toast_freeze_success: "План заморожен на 3 дня.",
    toast_speed_updated: "Скорость плана обновлена.",

    // Features
    sleep_label: "Часы сна",
    symptoms_label: "Симптомы",
    sym_insomnia: "Бессонница",
    sym_anxiety: "Тревога",
    sym_sweating: "Потливость",
    sym_shake: "Дрожь",
    sym_nausea: "Тошнота",
    sym_headache: "Головная боль",
    
    // Badges
    badges_title: "Достижения",
    badge_7days: "Воин недели",
    badge_halfway: "Половина пути",
    badge_sleep: "Сон восстановлен",
    badge_stable: "Эмоциональная стабильность",

    // SOS
    sos_title: "Протокол экстренной помощи",
    sos_phase_1_title: "СТОП.",
    sos_phase_1_text: "Вы в безопасности. Это просто химия, это пройдет.",
    sos_btn_ground: "Далее",
    sos_phase_2_title: "Заземление",
    sos_phase_2_text: "Назовите 5 синих предметов вокруг.",
    sos_btn_next: "Готово",
    sos_phase_3_title: "Термический шок",
    sos_phase_3_text: "Умойтесь очень холодной водой.",
    sos_btn_breathe: "Дыхание",
    sos_phase_4_title: "Дышите",
    sos_phase_4_subtitle: "Глубокий вдох... медленный выдох.",
    breathe_in: "Вдох",
    breathe_hold: "Удержание",
    breathe_out: "Выдох",
    close: "Закрыть",

    // Settings & Profile
    settings_title: "Настройки системы",
    settings_subtitle: "Управление алгоритмом",
    pace_control: "Темп снижения",
    pace_desc: "Вы можете изменить скорость в любой момент. Система пересчитает остатки.",
    pace_slow: "Медленно (Растянуть)",
    pace_balanced: "Сбалансированно",
    pace_fast: "Быстро (Интенсивно)",
    danger_zone: "Опасная зона",
    factory_reset_btn: "Сброс к заводским настройкам",
    profile_title: "Мой профиль",
    photo_url_label: "URL фото профиля",
    save_changes: "Сохранить изменения",
    rank_label: "Глобальный рейтинг",
    edit_profile: "Редактировать профиль",

    // Onboarding & Roles
    onboard_title: "Добро пожаловать в Islam's Guide",
    onboard_desc: "Пожалуйста, выберите цель использования системы.",
    role_patient: "Пользователь / Пациент",
    role_patient_desc: "Я хочу снизить дозу лекарств (с алгоритмом или врачом).",
    role_doctor: "Врач / Терапевт",
    role_doctor_desc: "Я хочу присоединиться как врач для наблюдения за пациентами.",
    
    // Doctor Registration
    doc_req_title: "Заявка на аккредитацию врача",
    doc_req_desc: "Ваши данные будут проверены администрацией перед активацией.",
    doc_fullname: "ФИО (видно пациентам)",
    doc_specialty: "Медицинская специальность",
    doc_license: "Номер лицензии",
    doc_location: "Клиника / Больница",
    doc_phone: "Телефон (для админа)",
    doc_bio: "О себе (видно пациентам)",
    doc_submit: "Отправить заявку",

    // Path Selection
    path_select_title: "Выберите путь лечения",
    path_algo: "Умный алгоритм",
    path_algo_desc: "Я хочу, чтобы система автоматически рассчитала план на основе моих запасов.",
    path_doctor: "Наблюдение у врача",
    path_doctor_desc: "Я выберу врача на платформе и буду ждать назначения плана.",

    // Doctor Selection
    doc_select_title: "Выберите своего врача",
    doc_search_placeholder: "Поиск врача по имени...",
    doc_select_btn: "Отправить запрос", 

    // Algorithm Setup
    med_type_title: "Тип лекарства",
    med_type_narcotic: "Наркотические (Список I)",
    med_type_narcotic_desc: "Требуется стационар",
    med_type_psych: "Психиатрические",
    med_type_psych_desc: "Требуется наблюдение врача",
    med_type_normal: "Общие препараты",
    med_type_normal_desc: "Безопасно для самоснижения",
    blocked_title: "Доступ запрещен",
    warning_title: "Важное медицинское предупреждение",
    med_form_title: "Форма выпуска",
    form_tablet: "Таблетки / Капсулы",
    form_liquid: "Жидкость / Капли",
    unit_title: "Единица измерения",

    // Doctor Dashboard & Plan Builder
    stat_total_patients: "Всего пациентов",
    stat_new_requests: "Новые заявки",
    stat_recovered: "Выздоровели",
    stat_overview: "Обзор",
    create_plan_btn: "Создать план лечения",
    plan_notes: "Заметки для пациента",
    plan_phases: "Фазы снижения",
    duration_days: "Длительность (дни)",
    submit_plan: "Утвердить и отправить",
    
    // NEW KEYS FOR PLAN BUILDER
    pattern_builder: "Конструктор шаблонов",
    pattern_sequence: "Шаблон (напр: 0.5, 0, 0.5, 0)",
    repeat_count: "Количество повторений",
    days_per_dose: "Дней на каждую дозу",
    apply_pattern: "Применить шаблон",
    clear_phases: "Очистить всё",
    
    // NEW KEYS FOR PATIENT REQUESTS
    patient_requests_title: "Запросы пациентов",
    accept_patient: "Принять",
    reject_patient: "Отклонить",
    no_requests: "Нет ожидающих запросов",
    req_sent_msg: "Запрос отправлен врачу. Ожидайте подтверждения.",

    // Admin & Management
    admin_title: "Центральная панель управления",
    admin_subtitle: "Интегрированная система управления",
    tab_overview: "Обзор",
    tab_doctors: "Врачи",
    tab_users: "Пользователи",
    tab_cms: "Контент",
    stat_approved_docs: "Одобренные врачи",
    pending_approvals: "Ожидающие одобрения",
    review_btn: "Обзор",
    approve_btn: "Одобрить",
    reject_btn: "Отклонить",
    approved_docs_list: "Список одобренных врачей",
    ban_user: "Заблокировать",
    unban_user: "Разблокировать",
    delete_user: "Удалить навсегда", 
    delete_confirm_msg: "Вы уверены? Это действие необратимо.", 
    view_details: "Подробнее", 
    search_user_placeholder: "Поиск пользователя...",
    
    // Patient Management
    manage_patients_title: "Управление досье пациентов",
    add_patient_btn: "Добавить пациента",
    back_list_btn: "Назад к списку",
    search_available_placeholder: "Поиск по имени или email...",
    add_btn: "Добавить",
    
    // Articles
    knowledge_center: "Центр знаний",
    knowledge_desc: "Медицинские статьи и советы для вашего восстановления.",
    new_article_btn: "Новая статья",
    article_title_label: "Заголовок статьи",
    article_cat_label: "Категория",
    article_content_label: "Содержание",
    publish_now: "Опубликовать",
    cat_medical: "Медицина",
    cat_motivation: "Мотивация",
    cat_tip: "Советы",
    cat_all: "Все",
    cancel_btn: "Отмена",
    read_more: "Читать далее",
    author_by: "Автор:",

    // Support & Tickets
    support_desc: "Свяжитесь с технической поддержкой напрямую.",
    new_ticket: "Создать тикет",
    new_ticket_title: "Новый запрос в поддержку",
    ticket_subject: "Тема",
    ticket_details: "Детали",
    send_request: "Отправить запрос",
    my_tickets: "Мои тикеты",
    no_tickets: "Нет предыдущих тикетов.",
    select_ticket_prompt: "Выберите тикет для просмотра деталей",
    status_open: "Открыт",
    status_pending: "В ожидании",
    status_resolved: "Решен",
    status_closed: "Закрыт",
    ticket_closed_msg: "Этот тикет закрыт. Создайте новый для продолжения.",
    write_reply: "Напишите ваш ответ...",
    me: "Я",
    support_team: "Поддержка",
    current_account: "Текущий аккаунт",

    // Scientific Modal (New)
    sci_title: "Ваш план научно обоснован",
    sci_subtitle: "Этот алгоритм основан на последних мировых медицинских протоколах 2024 года.",
    sci_principle_1_title: "Гиперболическое снижение",
    sci_principle_1_desc: "Система снижает процент сокращения дозы по мере ее уменьшения. Это предотвращает «шок рецепторов», возникающий при резкой отмене малых доз.",
    sci_principle_2_title: "Нейроадаптация",
    sci_principle_2_desc: "План не статичен. Система ежедневно анализирует ваш сон и настроение, автоматически регулируя скорость снижения для защиты от синдрома отмены.",
    sci_principle_3_title: "Оптимизация запасов",
    sci_principle_3_desc: "Каждая оставшаяся таблетка была учтена, чтобы гарантировать, что лекарство не закончится внезапно до достижения безопасного финиша.",
    sci_sources_title: "Научные источники и ссылки:",
    sci_source_1: "The Maudsley Deprescribing Guidelines (Horowitz & Taylor, 2024)",
    sci_source_2: "The Ashton Manual (Benzodiazepines: How They Work and How to Withdraw)",
    sci_source_3: "Lancet Psychiatry: Tapering of SSRIs to mitigate withdrawal symptoms",
    sci_trust_msg: "Эта система разработана как помощник, но она не заменяет консультацию вашего лечащего врача.",
    sci_btn_understood: "Понятно, начать план",

    // Community & Inventory New Keys
    community_clinic: "Клиника врача",
    community_public_room_hint: "* Эта комната будет публичной и видимой для всех пользователей.",
    community_doctor_room_hint: "* Все ваши текущие и будущие пациенты получат автоматический доступ к этой комнате.",
    inventory_updated_msg: "Инвентарь обновлен, баланс пересчитан."
};
```
---

### File: `services\adminServices.ts`
```ts
import { 
    collection, addDoc, updateDoc, doc, getDocs, query, orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { AuditLog, Ticket, Article, UserProfile } from '../types';

// --- Audit Logger (نظام المراقبة) ---
// يسجل كل حركة يقوم بها الأدمن لضمان عدم التلاعب
export const logAdminAction = async (adminUser: UserProfile, action: string, details: string, targetId?: string) => {
    if (adminUser.role !== 'admin' || !adminUser.uid) return;
    
    try {
        await addDoc(collection(db, 'audit_logs'), {
            adminId: adminUser.uid,
            adminName: adminUser.name,
            action,
            details,
            targetId: targetId || null,
            timestamp: Date.now()
        } as AuditLog);
    } catch (e) {
        console.error("Failed to log audit:", e);
    }
};

// --- User Management (إدارة المستخدمين) ---

// وضع علامة "خطر" على المستخدم لمراقبته
export const flagUser = async (admin: UserProfile, targetUid: string, isFlagged: boolean) => {
    await updateDoc(doc(db, 'users', targetUid), { isFlagged });
    await logAdminAction(admin, 'FLAG_USER', `Set flagged status to ${isFlagged}`, targetUid);
};

// حفظ ملاحظات سرية عن المستخدم (لا يراها المستخدم)
export const saveDoctorNotes = async (targetUid: string, notes: string) => {
    // نستخدم حقل doctorNotes لهذا الغرض، سواء كتبها طبيب أو أدمن
    await updateDoc(doc(db, 'users', targetUid), { doctorNotes: notes });
};

// --- CMS (نظام إدارة المحتوى) ---

export const publishArticle = async (admin: UserProfile, article: Omit<Article, 'id' | 'createdAt' | 'authorName' | 'authorId' | 'authorRole'>) => {
    if (!admin.uid) return;
    
    await addDoc(collection(db, 'articles'), {
        ...article,
        createdAt: Date.now(),
        authorName: admin.name,
        authorId: admin.uid,
        authorRole: 'admin',
        isPublished: true
    });
    await logAdminAction(admin, 'CREATE_ARTICLE', `Published article: ${article.title}`);
};

export const fetchArticles = async () => {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Article));
};

// --- Support Tickets (نظام الدعم الفني) ---

export const fetchAllTickets = async () => {
    const q = query(collection(db, 'tickets'), orderBy('lastUpdate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Ticket));
};

export const updateTicketStatus = async (admin: UserProfile, ticketId: string, status: string) => {
    await updateDoc(doc(db, 'tickets', ticketId), { 
        status,
        lastUpdate: Date.now()
    });
    await logAdminAction(admin, 'UPDATE_TICKET', `Changed ticket status to ${status}`, ticketId);
};

export const replyToTicket = async (admin: UserProfile, ticketId: string, text: string, currentMessages: any[]) => {
    if (!admin.uid) return;

    const newMessage = {
        senderId: admin.uid,
        senderName: admin.name,
        text,
        timestamp: Date.now(),
        isAdmin: true // This flags the message as coming from Support/Admin
    };
    
    await updateDoc(doc(db, 'tickets', ticketId), {
        messages: [...currentMessages, newMessage],
        lastUpdate: Date.now(),
        status: 'pending' // انتظار رد المستخدم
    });
};
```
---

### File: `services\firebase.ts`
```ts
/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// قراءة المتغيرات من ملف .env بشكل آمن
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// تهيئة المتغيرات
let app;
let auth: Auth | undefined;
let db: Firestore; 
const googleProvider = new GoogleAuthProvider();

try {
  // التحقق من وجود المفاتيح قبل البدء
  if (!firebaseConfig.apiKey) {
    throw new Error("Missing Firebase Configuration in .env file");
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log("✅ Firebase initialized successfully.");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
}

export { auth, db, googleProvider };
```
---

### File: `services\taperingEngine.ts`
```ts
import { Inventory, PlanDay, DailyLog, ManualPhase, MedForm } from '../types';

// ============================================================================
// 1. PRECISION KERNEL (النواة الدقيقة)
// ============================================================================
const PRECISION = 1000; 
const MIN_SPLIT_MICRO = 250; // 0.25mg (ربع حبة) - أقل وحدة قياسية للأقراص

const toMicro = (val: number) => Math.round(val * PRECISION);
const fromMicro = (val: number) => val / PRECISION;

/**
 * دالة "التقريب الذكي": 
 * للأقراص: تقرب لأقرب 0.25 (ربع حبة).
 * للسوائل: تقرب لأقرب 0.1 (عشر المليلتر).
 */
const smartRound = (microVal: number, form: MedForm = 'tablet'): number => {
    // 1. تحديد حجم الخطوة بناءً على الشكل الدوائي
    // للأقراص: 250 ميكرو = 0.25
    // للسوائل: 100 ميكرو = 0.1
    const step = form === 'liquid' ? 100 : 250; 
    
    // 2. حساب الباقي
    const remainder = microVal % step;
    
    // 3. التقريب (لأقرب خطوة)
    let result = remainder < step / 2 
        ? microVal - remainder 
        : microVal + (step - remainder);

    // 4. حماية الجرعات الصغيرة جداً
    // إذا كانت النتيجة صغيرة جداً ولكن ليست صفراً، نجعلها تساوي أقل خطوة ممكنة
    // هذا يمنع ظهور جرعات غريبة مثل 0.1mg للأقراص
    if (result > 0 && result < step) {
        return step;
    }
    
    return result;
};

// ============================================================================
// 2. NEURO-SCIENCE LOGIC (المنطق العلمي)
// ============================================================================

/**
 * معادلة التخفيض الزائدي (Hyperbolic)
 */
const getHyperbolicReductionRate = (currentMicro: number, startMicro: number): number => {
    if (startMicro === 0) return 0.1;
    
    const ratio = currentMicro / startMicro;

    // تخفيف النسب قليلاً لتكون ألطف على المستخدم
    if (ratio > 0.75) return 0.10; // 10%
    if (ratio > 0.40) return 0.07; // 7%
    if (ratio > 0.15) return 0.05; // 5%
    return 0.05;                   // تثبيت الحد الأدنى عند 5% لتجنب التخفيض البطيء جداً في النهاية
};

/**
 * تحليل جاهزية الجهاز العصبي (Neuro-Readiness)
 */
const calculateNeuroReadiness = (logs: DailyLog[]): number => {
    if (logs.length < 3) return 1.0; 

    const recent = logs.slice(-5);
    
    // تحليل النوم (المعيار 7 ساعات)
    const sleepAvg = recent.reduce((a, b) => a + (b.sleepHours || 0), 0) / recent.length;
    const sleepFactor = Math.min(1, Math.max(0.5, sleepAvg / 7)); 

    // تحليل الأعراض
    const symptomSeverity = recent.reduce((a, b) => a + (b.symptoms?.length || 0), 0);
    const symptomFactor = Math.max(0.4, 1 - (symptomSeverity * 0.1));

    const score = (sleepFactor * 0.5) + (symptomFactor * 0.5);
    return Math.max(0.5, score); 
};

// ============================================================================
// 3. ENGINE CORE (محرك التوليد)
// ============================================================================

const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0];
};

export const calculateTotalInventory = (inv: Inventory): number => {
    return (inv.boxes * (inv.pillsPerBox || 1)) + inv.loosePills;
};

// --- المولد اليدوي (للأطباء) ---
export const generateManualPlan = (phases: ManualPhase[], startDateStr: string): PlanDay[] => {
    const plan: PlanDay[] = [];
    let currentDate = startDateStr.split('T')[0];
    phases.forEach(phase => {
        for (let i = 0; i < phase.days; i++) {
            plan.push({ date: currentDate, plannedDose: phase.dose, isPast: false });
            currentDate = addDays(currentDate, 1);
        }
    });
    return plan;
};

// --- المولد الذكي (الخوارزمية) ---
export const generatePlan = (
    totalPills: number, 
    startDose: number, 
    startDateStr: string,
    speedModifier: number = 1.0,
    recentLogs: DailyLog[] = [],
    medForm: MedForm = 'tablet' // افتراضياً أقراص لتكون أكثر أماناً
): PlanDay[] => {
    
    const totalInvMicro = toMicro(totalPills);
    const startMicro = toMicro(startDose);
    
    if (totalInvMicro <= 0 || startMicro <= 0) return [];

    const readiness = calculateNeuroReadiness(recentLogs);
    const effectiveSpeed = speedModifier * readiness;

    let bestSteps: number[] = [];
    let quality = 1.0;
    let foundSolution = false;
    
    // Safety Circuit Breaker (قاطع الطوارئ لمنع التعليق)
    let loopGuard = 0;
    const MAX_ITERATIONS = 50; 

    while (quality > 0.1 && !foundSolution) {
        loopGuard++;
        if (loopGuard > MAX_ITERATIONS) {
            console.warn("Tapering Engine: Max iterations reached. Breaking to safe mode.");
            break;
        }

        const steps: number[] = [];
        let currentMicro = startMicro;
        let simulatedInventory = totalInvMicro;
        let isFeasible = true;
        let internalLoopGuard = 0;

        while (currentMicro > 0) {
            internalLoopGuard++;
            if (internalLoopGuard > 5000) { isFeasible = false; break; }

            // 1. حساب نسبة الخصم
            let reductionRate = getHyperbolicReductionRate(currentMicro, startMicro);
            reductionRate = reductionRate / (quality * effectiveSpeed);
            
            // 2. حساب الهدف القادم مع التقريب الذكي (هنا يتم إصلاح مشكلة الكسور)
            let targetMicro = Math.round(currentMicro * (1 - reductionRate));
            targetMicro = smartRound(targetMicro, medForm); 

            // منع التوقف (إذا كان التقريب يعيدنا لنفس الرقم، ننزل خطوة واحدة قسراً)
            if (targetMicro >= currentMicro) {
                const stepSize = medForm === 'liquid' ? 100 : 250; // 0.1ml or 0.25mg
                targetMicro = Math.max(0, currentMicro - stepSize);
            }

            // 3. تحديد المدة (أيام الثبات)
            let daysOnDose = Math.round(14 * quality); 
            if (daysOnDose < 4) daysOnDose = 4; // لا تقل عن 4 أيام

            // 4. المحاكاة
            for (let i = 0; i < daysOnDose; i++) {
                steps.push(currentMicro);
                simulatedInventory -= currentMicro;
            }

            // 5. النهاية (الذيل)
            if (targetMicro === 0) {
                // نمط يوم إيه / يوم لا في النهاية لتخفيف الصدمة
                const tailCycles = Math.max(2, Math.round(4 * quality));
                for(let i=0; i < tailCycles; i++) {
                    steps.push(currentMicro); simulatedInventory -= currentMicro;
                    steps.push(0);
                }
                break; 
            }

            // فحص المخزون
            if (simulatedInventory < 0) {
                isFeasible = false;
                break;
            }

            currentMicro = targetMicro;
        }

        if (isFeasible && simulatedInventory >= 0) {
            bestSteps = steps;
            foundSolution = true;
        } else {
            // تقليل الجودة (زيادة السرعة) والمحاولة مرة أخرى
            quality -= 0.05;
        }
    }

    // fallback: الحل الخطي الطارئ إذا فشل كل شيء
    if (!foundSolution) {
        let budget = totalInvMicro;
        let emergencyDose = startMicro;
        const stepSize = medForm === 'liquid' ? 100 : 250;
        
        while (budget >= emergencyDose && emergencyDose > 0) {
            bestSteps.push(emergencyDose);
            budget -= emergencyDose;
            emergencyDose = Math.max(0, emergencyDose - stepSize);
        }
    }

    // تحويل النتائج لخطة نهائية
    const finalPlan: PlanDay[] = [];
    let currDate = startDateStr.split('T')[0];

    bestSteps.forEach(microDose => {
        finalPlan.push({
            date: currDate,
            plannedDose: fromMicro(microDose),
            isPast: false
        });
        currDate = addDays(currDate, 1);
    });

    return finalPlan;
};

// --- إعادة الحساب الديناميكي ---
export const adjustPlan = (
    originalPlan: PlanDay[],
    logs: DailyLog[],
    totalInitialInventory: number, 
    speedModifier: number = 1.0,
    medForm: MedForm = 'tablet'
): PlanDay[] => {
    
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedLogs.length === 0) {
        return originalPlan.length > 0 
            ? generatePlan(totalInitialInventory, originalPlan[0].plannedDose, originalPlan[0].date, speedModifier, [], medForm)
            : [];
    }

    const lastLog = sortedLogs[sortedLogs.length - 1];
    const totalUsed = sortedLogs.reduce((acc, log) => acc + log.doseTaken, 0);
    const remainingInventory = Math.max(0, totalInitialInventory - totalUsed);

    const historyDays = originalPlan.filter(day => day.date <= lastLog.date).map(day => {
        const log = sortedLogs.find(l => l.date === day.date);
        return { ...day, isPast: true, log: log || undefined };
    });

    let startPoint = lastLog.doseTaken;
    if (startPoint === 0) {
        const lastActive = [...sortedLogs].reverse().find(l => l.doseTaken > 0);
        startPoint = lastActive ? lastActive.doseTaken : (originalPlan[0]?.plannedDose || 0);
    }

    const futureDays = generatePlan(
        remainingInventory,
        startPoint,
        addDays(lastLog.date, 1),
        speedModifier,
        sortedLogs,
        medForm
    );

    return [...historyDays, ...futureDays];
};
```
---

### File: `services\translations.ts`
```ts
import { ar } from './locales/ar';
import { en } from './locales/en';
import { ru } from './locales/ru';

export type Language = 'ar' | 'en' | 'ru';

export const translations = {
  ar,
  en,
  ru
};
```
---

### File: `views\admin\AdminCMS.tsx`
```tsx
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Article, ArticleCategory } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminCMSProps {
    articles: Article[];
    publishArticle: (article: any) => void;
    deleteArticle: (id: string) => void;
}

export const AdminCMS = ({ articles, publishArticle, deleteArticle }: AdminCMSProps) => {
    const { t } = useLanguage();
    const [showArticleModal, setShowArticleModal] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'tip' as ArticleCategory });

    const handlePublish = () => {
        publishArticle(newArticle);
        setShowArticleModal(false);
        setNewArticle({ title: '', content: '', category: 'tip' });
    };

    return (
        <div className="animate-in fade-in space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{t('tab_cms')}</h2>
                <Button onClick={() => setShowArticleModal(true)} variant="primary" className="!py-2 !px-4 !text-sm">
                    <Plus size={16}/> {t('new_article_btn')}
                </Button>
            </div>

            {showArticleModal && (
                 <Card className="bg-slate-900 border-indigo-500/30 mb-6">
                     <div className="space-y-4">
                         <input 
                             className="w-full bg-slate-950 p-3 rounded-lg text-white border border-white/10 outline-none focus:border-indigo-500" 
                             placeholder={t('article_title_label')}
                             value={newArticle.title} 
                             onChange={e => setNewArticle({...newArticle, title: e.target.value})} 
                         />
                         
                         <div>
                             <label className="text-xs text-slate-500 mb-2 block font-bold uppercase">{t('article_cat_label')}</label>
                             <div className="flex gap-2">
                                 {(['medical', 'motivation', 'tip', 'news'] as const).map(cat => (
                                     <button 
                                        key={cat}
                                        onClick={() => setNewArticle({...newArticle, category: cat})}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${newArticle.category === cat ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                     >
                                         {cat.toUpperCase()}
                                     </button>
                                 ))}
                             </div>
                         </div>

                         <textarea 
                             className="w-full bg-slate-950 p-3 rounded-lg text-white border border-white/10 h-32 outline-none focus:border-indigo-500" 
                             placeholder={t('article_content_label')}
                             value={newArticle.content} 
                             onChange={e => setNewArticle({...newArticle, content: e.target.value})} 
                         />
                         
                         <div className="flex justify-end gap-2">
                             <Button variant="secondary" onClick={() => setShowArticleModal(false)}>{t('cancel_btn')}</Button>
                             <Button variant="success" onClick={handlePublish}>{t('publish_now')}</Button>
                         </div>
                     </div>
                 </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {articles.map(art => (
                    <div key={art.id} className="bg-slate-900 p-5 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all group relative">
                        <button 
                            onClick={() => art.id && deleteArticle(art.id)}
                            className="absolute top-4 left-4 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={16}/>
                        </button>

                        <Badge color="blue" className="mb-3">{art.category}</Badge>
                        <h3 className="font-bold text-white mb-2 line-clamp-1">{art.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-3 mb-4">{art.content}</p>
                        <div className="text-[10px] text-slate-600 font-mono">
                            {new Date(art.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
```
---

### File: `views\admin\AdminDoctors.tsx`
```tsx
import React from 'react';
import { Lock, AlertCircle, Stethoscope, Eye, Ban, Trash2 } from 'lucide-react';
import { UserProfile } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminDoctorsProps {
    users: UserProfile[];
    setSelectedDoctor: (doc: UserProfile) => void;
    toggleBan: (user: UserProfile) => void;
    deleteUser: (uid: string) => void;
}

export const AdminDoctors = ({ users, setSelectedDoctor, toggleBan, deleteUser }: AdminDoctorsProps) => {
    const { t } = useLanguage();
    
    // فلترة القوائم
    const doctorsList = users.filter(u => u.role === 'doctor');
    const pendingDoctors = doctorsList.filter(d => d.doctorData?.accountStatus === 'pending');
    const approvedDoctors = doctorsList.filter(d => d.doctorData?.accountStatus === 'approved');

    return (
        <div className="animate-in fade-in space-y-8">
             {/* 1. Pending Approvals */}
             <div className="space-y-4">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2 pb-2 border-b border-white/5">
                     <Lock className="text-amber-500" /> {t('pending_approvals')}
                     <Badge color="amber">{pendingDoctors.length}</Badge>
                 </h2>
                 
                 {pendingDoctors.length === 0 ? (
                     <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-500">
                         <AlertCircle className="mx-auto mb-2 opacity-50" size={32} />
                         <p>لا توجد طلبات انضمام معلقة حالياً.</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingDoctors.map(doc => (
                            <div key={doc.uid} className="bg-slate-900 border border-amber-500/50 p-6 rounded-2xl relative shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                                <Badge color="amber" className="absolute top-4 left-4">Pending Request</Badge>
                                
                                <div className="flex items-center gap-4 mb-4">
                                    {doc.doctorData?.photoUrl ? (
                                        <img src={doc.doctorData.photoUrl} alt="Dr" className="w-14 h-14 rounded-full object-cover border border-white/10" />
                                    ) : (
                                        <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 text-xl font-bold">Dr</div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{doc.name}</h3>
                                        <p className="text-sm text-slate-400">{doc.doctorData?.specialty}</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 mt-6">
                                    <Button onClick={() => setSelectedDoctor(doc)} variant="secondary" className="flex-1 !py-2">
                                        <Eye size={16} className="mr-2"/> {t('view_details')}
                                    </Button>
                                </div>
                            </div>
                        ))}
                     </div>
                 )}
             </div>

             {/* 2. Active Doctors List */}
             <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                     <Stethoscope className="text-emerald-500" /> {t('approved_docs_list')}
                </h2>
                <Card className="bg-slate-900 border-white/5 overflow-hidden !p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm text-slate-400">
                            <thead className="bg-slate-950 text-slate-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="p-4">Doctor</th>
                                    <th className="p-4">Specialty</th>
                                    <th className="p-4 text-center">Patients</th>
                                    <th className="p-4 text-center">Level</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {approvedDoctors.length === 0 && (
                                    <tr><td colSpan={5} className="p-6 text-center">No approved doctors yet.</td></tr>
                                )}
                                {approvedDoctors.map(doc => {
                                    // حساب عدد المرضى غير المتعافين لهذا الطبيب
                                    const patientCount = users.filter(u => u.patientData?.assignedDoctorId === doc.uid && !u.patientData?.isRecovered).length;
                                    const level = Math.floor((doc.doctorData?.recoveredCount || 0) / 5) + 1;

                                    return (
                                        <tr key={doc.uid} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 font-bold text-white flex items-center gap-3">
                                                {doc.doctorData?.photoUrl ? (
                                                    <img src={doc.doctorData.photoUrl} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">Dr</div>
                                                )}
                                                {doc.name}
                                            </td>
                                            <td className="p-4">{doc.doctorData?.specialty}</td>
                                            <td className="p-4 text-center text-indigo-400 font-bold">{patientCount}</td>
                                            <td className="p-4 text-center"><Badge color="amber">LVL {level}</Badge></td>
                                            <td className="p-4 text-center flex justify-center gap-2">
                                                <button onClick={() => setSelectedDoctor(doc)} className="p-2 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20" title={t('view_details')}><Eye size={16}/></button>
                                                <button onClick={() => toggleBan(doc)} className="p-2 bg-amber-500/10 text-amber-400 rounded hover:bg-amber-500/20" title={doc.isBanned ? t('unban_user') : t('ban_user')}><Ban size={16}/></button>
                                                <button onClick={() => doc.uid && deleteUser(doc.uid)} className="p-2 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500/20" title={t('delete_user')}><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
             </div>
        </div>
    );
};
```
---

### File: `views\admin\AdminOverview.tsx`
```tsx
import React, { useMemo } from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { UserProfile } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminOverviewProps {
    users: UserProfile[];
    setActiveTab: (tab: any) => void;
}

export const AdminOverview = ({ users, setActiveTab }: AdminOverviewProps) => {
    const { t } = useLanguage();

    const doctorsList = users.filter(u => u.role === 'doctor');
    const pendingDoctors = doctorsList.filter(d => d.doctorData?.accountStatus === 'pending');
    const approvedDoctors = doctorsList.filter(d => d.doctorData?.accountStatus === 'approved');
    const normalUsers = users.filter(u => u.role === 'normal_user' || u.role === 'patient');
    const recoveredUsers = users.filter(u => u.patientData?.isRecovered);

    const stats = useMemo(() => {
        return [
            { name: t('stat_total_patients'), value: normalUsers.length, color: '#6366f1' },
            { name: t('stat_approved_docs'), value: approvedDoctors.length, color: '#10b981' },
            { name: t('stat_recovered'), value: recoveredUsers.length, color: '#f59e0b' },
            { name: t('pending_approvals'), value: pendingDoctors.length, color: '#f43f5e' },
        ];
    }, [users, t]);

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="bg-slate-900 border-white/5 p-6 flex flex-col justify-between">
                        <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">{stat.name}</h3>
                        <div className="text-4xl font-black" style={{color: stat.color}}>{stat.value}</div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-white/5 min-h-[300px]">
                    <h3 className="text-white font-bold mb-4">{t('stat_overview')}</h3>
                    <ResponsiveContainer width="100%" height="250px">
                        <BarChart data={stats}>
                            <XAxis dataKey="name" stroke="#475569" fontSize={10} tick={false} />
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px'}} cursor={{fill: 'transparent'}} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                {stats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                
                <Card className="bg-slate-900 border-white/5">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Lock size={16} className="text-amber-500"/> {t('pending_approvals')}
                    </h3>
                    {pendingDoctors.length === 0 ? (
                        <div className="text-center text-slate-500 py-10 flex flex-col items-center">
                            <CheckCircle size={32} className="mb-2 opacity-20"/>
                            <p>No pending approvals.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingDoctors.slice(0, 3).map(doc => (
                                <div key={doc.uid} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-white/5">
                                    <div>
                                        <div className="font-bold text-white text-sm">{doc.name}</div>
                                        <div className="text-xs text-slate-500">{doc.doctorData?.specialty}</div>
                                    </div>
                                    <Button onClick={() => setActiveTab('doctors')} variant="secondary" className="!py-1 !px-3 !text-xs">{t('review_btn')}</Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
```
---

### File: `views\admin\AdminUsers.tsx`
```tsx
import React, { useState } from 'react';
import { Search, Ban, Trash2 } from 'lucide-react';
import { UserProfile } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminUsersProps {
    users: UserProfile[];
    toggleBan: (user: UserProfile) => void;
    deleteUser: (uid: string) => void;
}

export const AdminUsers = ({ users, toggleBan, deleteUser }: AdminUsersProps) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState("");

    // تصفية المستخدمين (نستبعد الأطباء والأدمن)
    const normalUsers = users.filter(u => u.role === 'normal_user' || u.role === 'patient');

    return (
        <div className="space-y-4 animate-in fade-in">
            {/* شريط البحث */}
            <div className="flex bg-slate-900 p-4 rounded-2xl border border-white/5 mb-4">
                <Search className="text-slate-500 ml-4" size={20} />
                <input 
                    className="bg-transparent w-full text-white outline-none"
                    placeholder={t('search_user_placeholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* شبكة المستخدمين */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {normalUsers
                    .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(user => (
                    <div key={user.uid} className="bg-slate-900/80 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    {user.name} 
                                    {user.isBanned && <Ban size={12} className="text-rose-500"/>}
                                </h4>
                                <div className="flex gap-2 mt-1">
                                    <Badge color="blue" className="!text-[9px] !px-1.5 !py-0.5">{user.role === 'patient' ? t('role_patient') : 'User'}</Badge>
                                    {user.patientData?.assignedDoctorName && (
                                        <span className="text-[9px] text-slate-500 flex items-center">Dr: {user.patientData.assignedDoctorName}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => toggleBan(user)} className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" title={user.isBanned ? t('unban_user') : t('ban_user')}>
                                <Ban size={16} />
                            </button>
                            <button onClick={() => user.uid && deleteUser(user.uid)} className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20" title={t('delete_user')}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
```
---

### File: `views\dashboard\DailyCheckIn.tsx`
```tsx
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
```
---

### File: `views\dashboard\DashboardCharts.tsx`
```tsx
import React from 'react';
import { FlaskConical, Clock, Info } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserProfile, PlanDay } from '../../types';

interface DashboardChartsProps {
    userProfile: UserProfile | null;
    plan: PlanDay[];
}

export const DashboardCharts = ({ userProfile, plan }: DashboardChartsProps) => {
    const { t } = useLanguage();
    
    const isLiquid = userProfile?.medForm === 'liquid';
    const isPatient = userProfile?.role === 'patient';
    const doctorName = userProfile?.patientData?.assignedDoctorName;

    return (
        <div className="space-y-6">
            {/* Plan Info Card */}
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

            {/* Projection Chart Card */}
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
    );
};
```
---

### File: `views\dashboard\DashboardHeader.tsx`
```tsx
import React from 'react';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { useLanguage } from '../../contexts/LanguageContext';
import { PlanDay, DailyLog, UserProfile } from '../../types';

interface DashboardHeaderProps {
    todayPlan: PlanDay | undefined;
    todayLog: DailyLog | undefined;
    progressPercentage: number;
    totalDays: number;
    daysCompleted: number;
    userProfile: UserProfile | null;
    children?: React.ReactNode; // For the DailyCheckIn component injection
}

export const DashboardHeader = ({
    todayPlan,
    todayLog,
    progressPercentage,
    totalDays,
    daysCompleted,
    userProfile,
    children
}: DashboardHeaderProps) => {
    const { t } = useLanguage();
    const unitLabel = userProfile?.medUnit || 'mg';

    return (
        <Card className="lg:col-span-8 bg-gradient-to-br from-[#0f172a] via-[#101626] to-indigo-950/20 min-h-[550px] flex flex-col justify-between !p-8 md:!p-10 border-indigo-500/10 shadow-2xl relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
                {/* Top Section: Target Dose & Progress */}
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
                        <ProgressRing 
                            radius={70} 
                            stroke={8} 
                            progress={progressPercentage} 
                            totalSteps={totalDays - daysCompleted} 
                        />
                    </div>
                </div>

                {/* Interaction Section OR Logged State */}
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
                    <div className="mt-8">
                        {children}
                    </div>
                )}
            </div>
        </Card>
    );
};
```
---

### File: `views\AdminView.tsx`
```tsx
import React, { useEffect, useState } from 'react';
import { 
    collection, updateDoc, doc, addDoc, query, orderBy, deleteDoc, onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, Article, ArticleCategory } from '../types';
// تم إضافة Trash2 هنا
import { Activity, Users, FileText, Stethoscope, MessageSquareWarning, X, Trash2 } from 'lucide-react';

// المكونات الأساسية
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// المكونات الفرعية الجديدة للإدارة
import { AdminOverview } from './admin/AdminOverview';
import { AdminDoctors } from './admin/AdminDoctors';
import { AdminUsers } from './admin/AdminUsers';
import { AdminCMS } from './admin/AdminCMS';

import { useLanguage } from '../contexts/LanguageContext';

export const AdminView = () => {
    const { t } = useLanguage();

    // -- Global State --
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'users' | 'cms'>('overview');
    const [loading, setLoading] = useState(false);
    
    // -- Data Stores --
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);

    // -- Doctor View/Reject State (Shared Modals) --
    const [selectedDoctor, setSelectedDoctor] = useState<UserProfile | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    // -- 1. REAL-TIME DATA FETCHING --
    useEffect(() => {
        setLoading(true);
        // جلب المستخدمين
        const qUsers = query(collection(db, "users"));
        const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
            const fetchedUsers: UserProfile[] = [];
            snapshot.forEach(d => fetchedUsers.push({ uid: d.id, ...d.data() } as UserProfile));
            setUsers(fetchedUsers);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoading(false);
        });

        // جلب المقالات
        const qArticles = query(collection(db, "articles"), orderBy("createdAt", "desc"));
        const unsubscribeArticles = onSnapshot(qArticles, (snapshot) => {
            setArticles(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Article)));
        });

        return () => {
            unsubscribeUsers();
            unsubscribeArticles();
        };
    }, []);

    // -- DOCTOR MANAGEMENT ACTIONS --
    
    const approveDoctor = async (docUid: string) => {
        if (!confirm("Are you sure you want to approve this doctor?")) return;
        try {
            await updateDoc(doc(db, "users", docUid), {
                "doctorData.accountStatus": "approved",
                "doctorData.rejectionReason": null 
            });
            if (selectedDoctor?.uid === docUid) setSelectedDoctor(null);
        } catch (e) { console.error(e); }
    };

    const handleRejectClick = (doctor: UserProfile) => {
        setSelectedDoctor(doctor);
        setShowRejectModal(true);
        setRejectionReason("");
    };

    const confirmReject = async () => {
        if (!selectedDoctor?.uid || !rejectionReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }

        try {
            await updateDoc(doc(db, "users", selectedDoctor.uid), {
                "doctorData.accountStatus": "rejected",
                "doctorData.rejectionReason": rejectionReason
            });
            setShowRejectModal(false);
            setSelectedDoctor(null);
            setRejectionReason("");
        } catch (e) { console.error(e); }
    };

    // -- USER MANAGEMENT ACTIONS --

    const toggleBan = async (user: UserProfile) => {
        if (!user.uid) return;
        const newVal = !user.isBanned;
        if(confirm(newVal ? "Ban this user?" : "Unban this user?")) {
            await updateDoc(doc(db, "users", user.uid), { isBanned: newVal });
        }
    };

    const deleteUser = async (targetUid: string) => {
        if (!confirm("Are you sure you want to permanently delete this user?")) return;
        try {
            await deleteDoc(doc(db, "users", targetUid));
            if (selectedDoctor?.uid === targetUid) setSelectedDoctor(null);
        } catch (e) {
            console.error("Error deleting user:", e);
            alert("Failed to delete user.");
        }
    };

    // -- CMS ACTIONS --

    const publishArticle = async (articleData: Omit<Article, 'id' | 'createdAt' | 'authorName' | 'authorId' | 'authorRole'>) => {
        const currentUser = auth?.currentUser;
        if (!articleData.title || !articleData.content) return;
        
        try {
            await addDoc(collection(db, "articles"), {
                ...articleData,
                isPublished: true,
                createdAt: Date.now(),
                authorName: currentUser?.displayName || "System Admin",
                authorRole: "admin",
                authorId: currentUser?.uid || "ADMIN_CONSOLE"
            });
        } catch (e) { console.error(e); }
    };

    const deleteArticle = async (id: string) => {
        if(confirm("Delete this article?")) {
            await deleteDoc(doc(db, "articles", id));
        }
    }

    const pendingDoctorsCount = users.filter(u => u.role === 'doctor' && u.doctorData?.accountStatus === 'pending').length;

    return (
        <LayoutContainer>
            <PageHeader title={t('admin_title')} subtitle={t('admin_subtitle')} />

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 custom-scrollbar">
                {[
                    { id: 'overview', icon: Activity, label: t('tab_overview') },
                    { id: 'doctors', icon: Stethoscope, label: t('tab_doctors') },
                    { id: 'users', icon: Users, label: t('tab_users') },
                    { id: 'cms', icon: FileText, label: t('tab_cms') },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                            activeTab === tab.id 
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' 
                            : 'bg-slate-900 text-slate-500 border-white/5 hover:bg-slate-800'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {tab.id === 'doctors' && pendingDoctorsCount > 0 && (
                             <span className="ml-2 bg-rose-500 text-white text-[10px] px-1.5 rounded-full animate-pulse">{pendingDoctorsCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            {activeTab === 'overview' && (
                <AdminOverview users={users} setActiveTab={setActiveTab} />
            )}

            {activeTab === 'doctors' && (
                <AdminDoctors 
                    users={users} 
                    setSelectedDoctor={setSelectedDoctor} 
                    toggleBan={toggleBan} 
                    deleteUser={deleteUser} 
                />
            )}

            {activeTab === 'users' && (
                <AdminUsers 
                    users={users} 
                    toggleBan={toggleBan} 
                    deleteUser={deleteUser} 
                />
            )}

            {activeTab === 'cms' && (
                <AdminCMS 
                    articles={articles} 
                    publishArticle={publishArticle} 
                    deleteArticle={deleteArticle} 
                />
            )}

            {/* --- SHARED MODALS --- */}

            {/* DOCTOR DETAILS MODAL */}
            {selectedDoctor && !showRejectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-lg bg-slate-900 border-white/10 shadow-2xl relative">
                        <button onClick={() => setSelectedDoctor(null)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20}/></button>
                        
                        <div className="text-center mb-6">
                            {selectedDoctor.doctorData?.photoUrl ? (
                                <img src={selectedDoctor.doctorData.photoUrl} alt="Dr" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-800 object-cover" />
                            ) : (
                                <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-slate-500">Dr</div>
                            )}
                            <h2 className="text-2xl font-bold text-white">{selectedDoctor.name}</h2>
                            <p className="text-indigo-400 font-medium">{selectedDoctor.doctorData?.specialty}</p>
                        </div>

                        <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-white/5 text-sm">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-500">License</span>
                                <span className="text-white font-mono">{selectedDoctor.doctorData?.licenseNumber}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-500">Email</span>
                                <span className="text-white">{selectedDoctor.email}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-500">Phone</span>
                                <span className="text-white font-mono">{selectedDoctor.doctorData?.phoneNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Location</span>
                                <span className="text-white">{selectedDoctor.doctorData?.clinicLocation}</span>
                            </div>
                        </div>

                        {selectedDoctor.doctorData?.accountStatus === 'pending' && (
                            <div className="flex gap-3 mt-6">
                                <Button onClick={() => selectedDoctor.uid && approveDoctor(selectedDoctor.uid)} variant="success" className="flex-1">
                                    Approve
                                </Button>
                                <Button onClick={() => handleRejectClick(selectedDoctor)} variant="danger" className="flex-1">
                                    Reject
                                </Button>
                            </div>
                        )}
                        
                        {selectedDoctor.doctorData?.accountStatus === 'approved' && (
                             <div className="mt-6 flex justify-center">
                                 {/* التصحيح هنا: استخدام دالة سهمية للتحقق من uid قبل الحذف */}
                                 <Button 
                                     onClick={() => {
                                         if (selectedDoctor.uid) {
                                             deleteUser(selectedDoctor.uid);
                                         }
                                     }} 
                                     variant="danger" 
                                     className="w-full"
                                 >
                                     <Trash2 size={18} className="mr-2"/> Delete User
                                 </Button>
                             </div>
                        )}
                    </Card>
                </div>
            )}

            {/* REJECTION REASON MODAL */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-md bg-slate-900 border-white/10 shadow-2xl relative">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <MessageSquareWarning className="text-rose-500" /> سبب الرفض
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">يرجى توضيح سبب رفض طلب الطبيب ليتمكن من تصحيحه.</p>
                        
                        <textarea 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-rose-500 outline-none h-32 resize-none"
                            placeholder="مثال: رقم الترخيص غير واضح، البيانات ناقصة..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        
                        <div className="flex gap-3 mt-6">
                            <Button onClick={() => setShowRejectModal(false)} variant="secondary" className="flex-1">إلغاء</Button>
                            <Button onClick={confirmReject} variant="danger" className="flex-1">تأكيد الرفض</Button>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `views\ArticlesView.tsx`
```tsx
import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Article, UserProfile, ArticleCategory } from '../types';
import { BookOpen, Lightbulb, Heart, Stethoscope, X, ArrowRight, Plus, PenTool } from 'lucide-react';

// 👇 تحديث المسارات للمكونات الجديدة
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

import { useLanguage } from '../contexts/LanguageContext';

interface ArticlesViewProps {
    userProfile?: UserProfile | null;
}

export const ArticlesView = ({ userProfile }: ArticlesViewProps) => {
    const { t, language } = useLanguage();
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<'all' | ArticleCategory>('all');
    const [readingArticle, setReadingArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    // -- Create Mode State --
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'tip' as ArticleCategory });

    // -- Fetch Articles --
    const fetchArticles = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "articles"), 
                where("isPublished", "==", true),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
            setArticles(fetched);
        } catch (e) {
            console.error("Error fetching articles", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    // -- Publish Action --
    const handlePublish = async () => {
        const currentUser = auth?.currentUser;

        if (!currentUser || !userProfile) return;
        
        if (!newArticle.title.trim() || !newArticle.content.trim()) return;

        try {
            await addDoc(collection(db, "articles"), {
                title: newArticle.title,
                content: newArticle.content,
                category: newArticle.category,
                isPublished: true,
                createdAt: Date.now(),
                authorId: currentUser.uid, 
                authorName: userProfile.name,
                authorRole: userProfile.role 
            });
            
            setShowCreateModal(false);
            setNewArticle({ title: '', content: '', category: 'tip' });
            fetchArticles();
            alert(language === 'ar' ? "تم نشر المقال بنجاح!" : "Article published successfully!");
        } catch (e) {
            console.error("Error publishing article:", e);
            alert("Error publishing article.");
        }
    };

    // -- Helpers --
    const filteredArticles = selectedCategory === 'all' 
        ? articles 
        : articles.filter(a => a.category === selectedCategory);

    const getCategoryIcon = (cat: string) => {
        switch(cat) {
            case 'medical': return <Stethoscope size={16} />;
            case 'motivation': return <Heart size={16} />;
            default: return <Lightbulb size={16} />;
        }
    };

    const getCategoryColor = (cat: string) => {
        switch(cat) {
            case 'medical': return 'indigo';
            case 'motivation': return 'rose';
            default: return 'amber';
        }
    };

    const canPublish = userProfile?.role === 'admin' || (userProfile?.role === 'doctor' && userProfile?.doctorData?.accountStatus === 'approved');

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('knowledge_center')} 
                subtitle={t('knowledge_desc')}
                action={
                    canPublish && (
                        <Button onClick={() => setShowCreateModal(true)} variant="primary" className="!py-2 !px-4 !text-sm">
                            <PenTool size={16} /> {t('new_article_btn')}
                        </Button>
                    )
                }
            />

            {/* Category Filters */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                {[
                    { id: 'all', label: t('cat_all'), icon: BookOpen },
                    { id: 'medical', label: t('cat_medical'), icon: Stethoscope },
                    { id: 'motivation', label: t('cat_motivation'), icon: Heart },
                    { id: 'tip', label: t('cat_tip'), icon: Lightbulb },
                ].map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as any)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                            selectedCategory === cat.id 
                            ? 'bg-white text-slate-900 border-white shadow-lg shadow-white/10' 
                            : 'bg-slate-900 text-slate-500 border-white/5 hover:border-white/10 hover:text-white'
                        }`}
                    >
                        <cat.icon size={16} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Articles Grid */}
            {loading ? (
                <div className="text-center py-20 text-slate-500 animate-pulse">Loading...</div>
            ) : filteredArticles.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                    <BookOpen size={48} className="mx-auto text-slate-700 mb-4"/>
                    <p className="text-slate-500">{language === 'ar' ? 'لا توجد مقالات هنا.' : 'No articles found.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map(article => (
                        <div 
                            key={article.id}
                            onClick={() => setReadingArticle(article)}
                            className="group bg-slate-900 border border-white/5 rounded-[2rem] p-6 hover:border-indigo-500/30 hover:bg-slate-800 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-${getCategoryColor(article.category)}-500/10 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
                            
                            <div className="mb-4 relative z-10">
                                <Badge color={getCategoryColor(article.category) as any} className="mb-3 w-fit flex items-center gap-1">
                                    {getCategoryIcon(article.category)} {article.category.toUpperCase()}
                                </Badge>
                                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors">
                                    {article.title}
                                </h3>
                            </div>
                            
                            <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">
                                {article.content}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold">
                                        {article.authorName} {article.authorRole === 'doctor' && '(Dr)'}
                                    </span>
                                    <span className="text-[9px] text-slate-600 font-mono">
                                        {new Date(article.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <span className="flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                                    {t('read_more')} <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Article Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-2xl bg-slate-900 border-white/10 shadow-2xl relative">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20}/></button>
                        
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <PenTool className="text-indigo-400"/> {t('new_article_btn')}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('article_title_label')}</label>
                                <input 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
                                    value={newArticle.title}
                                    onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                                    placeholder="..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('article_cat_label')}</label>
                                <div className="flex gap-2">
                                    {[
                                        { id: 'medical', label: t('cat_medical') },
                                        { id: 'motivation', label: t('cat_motivation') },
                                        { id: 'tip', label: t('cat_tip') },
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setNewArticle({...newArticle, category: cat.id as ArticleCategory})}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                                                newArticle.category === cat.id 
                                                ? 'bg-indigo-600 border-indigo-500 text-white' 
                                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('article_content_label')}</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 h-40 resize-none"
                                    value={newArticle.content}
                                    onChange={e => setNewArticle({...newArticle, content: e.target.value})}
                                    placeholder="..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>{t('cancel_btn')}</Button>
                                <Button variant="success" onClick={handlePublish} disabled={!newArticle.title || !newArticle.content}>
                                    {t('publish_now')}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Reading Modal */}
            {readingArticle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border-white/10 shadow-2xl relative overflow-hidden !p-0">
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 bg-slate-950 border-b border-white/5 relative">
                            <button 
                                onClick={() => setReadingArticle(null)}
                                className="absolute top-6 left-6 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <Badge color={getCategoryColor(readingArticle.category) as any} className="mb-4">
                                {readingArticle.category.toUpperCase()}
                            </Badge>
                            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-2">
                                {readingArticle.title}
                            </h2>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span>{t('author_by')}: {readingArticle.authorName}</span>
                                {readingArticle.authorRole === 'doctor' && <Badge color="blue" className="!py-0 !px-1.5 !text-[9px]">Dr</Badge>}
                                {readingArticle.authorRole === 'admin' && <Badge color="rose" className="!py-0 !px-1.5 !text-[9px]">Admin</Badge>}
                                <span>•</span>
                                <span>{new Date(readingArticle.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-900">
                            <article className="prose prose-invert prose-lg max-w-none">
                                <p className="text-slate-300 leading-loose whitespace-pre-wrap">
                                    {readingArticle.content}
                                </p>
                            </article>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-white/5 bg-slate-950 flex justify-between items-center">
                            <p className="text-xs text-slate-600">Islam's Guide Knowledge Center</p>
                            <Button variant="secondary" onClick={() => setReadingArticle(null)} className="!py-2 !px-4 !text-xs">
                                {t('close')}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `views\CalendarView.tsx`
```tsx
import React from 'react';
import { Check, X, Stethoscope, BrainCircuit } from 'lucide-react';

// المكونات
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

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

    // 1. حساب إزاحة بداية الشهر (لضبط التقويم)
    // نبدأ الرسم من أول يوم في الخطة
    const startDate = new Date(plan[0]?.date || new Date());
    // في JavaScript: الأحد=0، الاثنين=1... السبت=6
    // نريد أن يبدأ الأسبوع من السبت (Saturday = 0 في مصفوفتنا)
    // معادلة التحويل: (Day + 1) % 7 تجعل السبت هو البداية
    const startDayIndex = (startDate.getDay() + 1) % 7; 
    const blanks = Array.from({ length: startDayIndex });

    const unitLabel = userProfile?.medUnit || 'mg';
    const isDoctorPlan = userProfile?.planType === 'manual';

    const daysMap: Record<string, string[]> = {
        ar: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
        en: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        ru: ['Сб', 'Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт']
    };
    
    const weekDays = daysMap[language] || daysMap['en'];
    const dir = language === 'ar' ? 'rtl' : 'ltr';

    return (
      <LayoutContainer>
        <PageHeader 
            title={t('nav_calendar')}
            subtitle={language === 'ar' ? "خارطة الطريق نحو التعافي." : "Your recovery roadmap."}
            action={
                <div className="flex gap-2">
                    {isDoctorPlan ? (
                        <Badge color="indigo" className="!text-xs md:!text-sm !py-2 !px-3 md:!px-4">
                            <Stethoscope size={14} className="mr-2" /> {language === 'ar' ? 'خطة الطبيب' : 'Doctor Plan'}
                        </Badge>
                    ) : (
                        <Badge color="emerald" className="!text-xs md:!text-sm !py-2 !px-3 md:!px-4">
                            <BrainCircuit size={14} className="mr-2" /> {t('path_algo')}
                        </Badge>
                    )}
                </div>
            }
        />
        
        <Card className="overflow-hidden bg-slate-900/50 border border-white/5 shadow-2xl !p-4 md:!p-6">
          {/* Legend (مفتاح الخريطة) */}
          <div className="flex flex-wrap gap-3 md:gap-4 mb-6 text-[10px] md:text-xs text-slate-400 border-b border-white/5 pb-4">
              <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-[0_0_8px_indigo]"></div> 
                  {language === 'ar' ? 'اليوم' : 'Today'}
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> 
                  {language === 'ar' ? 'تم' : 'Done'}
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> 
                  {language === 'ar' ? 'فائت' : 'Missed'}
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-white/10"></div> 
                  {language === 'ar' ? 'قادم' : 'Future'}
              </div>
          </div>

          {/* ترويسة أيام الأسبوع */}
          <div className="grid grid-cols-7 gap-1 md:gap-4 mb-2" dir={dir}>
            {weekDays.map(d => (
              <div key={d} className="bg-slate-950/50 p-2 text-center text-[9px] md:text-xs font-bold text-slate-500 rounded-lg">
                  {d}
              </div>
            ))}
          </div>

          {/* شبكة الأيام */}
          <div className="grid grid-cols-7 gap-1 md:gap-4" dir={dir}>
            {/* الأيام الفارغة لضبط بداية الشهر */}
            {blanks.map((_, i) => <div key={`blank-${i}`} className="min-h-[60px] md:min-h-[80px]" />)}

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
                  if (log.doseTaken <= day.plannedDose) { // التزام جيد
                      bgClass = "bg-emerald-900/10";
                      borderClass = "border-emerald-500/30";
                  } else { // تجاوز
                      bgClass = "bg-rose-900/10";
                      borderClass = "border-rose-500/30";
                  }
              } else if (isPast) {
                  bgClass = "bg-slate-950/30";
                  textClass = "text-slate-600";
                  borderClass = "border-dashed border-slate-700";
              }

              return (
                <div 
                    key={idx} 
                    className={`${bgClass} border ${borderClass} rounded-xl p-1.5 md:p-3 min-h-[70px] md:min-h-[110px] flex flex-col justify-between transition-all duration-300 relative group`}
                >
                   {/* Header: رقم اليوم + الأيقونة */}
                   <div className="flex justify-between items-start">
                        <span className={`text-[9px] md:text-xs font-bold ${textClass}`}>
                            {day.date.slice(8)}
                        </span>
                        
                        {log && (
                            <span className={log.doseTaken <= day.plannedDose ? "text-emerald-400" : "text-rose-400"}>
                                {log.doseTaken <= day.plannedDose ? <Check size={12} className="md:w-4 md:h-4" /> : <X size={12} className="md:w-4 md:h-4" />}
                            </span>
                        )}
                        {isToday && !log && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-500 rounded-full animate-pulse"></div>}
                   </div>
                  
                  {/* Content: الجرعة */}
                  <div className="text-center mt-1">
                    <span className={`text-sm md:text-2xl font-black ${isToday ? 'text-white' : isPast && !log ? 'text-slate-600' : 'text-slate-300'}`}>
                      {day.plannedDose}
                    </span>
                    <span className="text-[7px] md:text-[10px] block uppercase text-slate-600 font-bold scale-90 md:scale-100">
                        {unitLabel}
                    </span>
                  </div>

                  {/* Footer: شريط الحالة المزاجية */}
                  {log && (
                      <div className={`h-1 w-full rounded-full mt-1.5 md:mt-2 ${
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
```
---

### File: `views\CommunityView.tsx`
```tsx
import React, { useEffect, useState, useRef } from 'react';
import { 
    collection, query, orderBy, limit, onSnapshot, addDoc, doc, deleteDoc 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, ChatRoom, ChatMessage } from '../types';
import { 
    Trophy, Users, MessageCircle, Plus, Trash2, Send, Globe, Crown, 
    ShieldCheck, Pill, FlaskConical, Zap, Stethoscope, Lock
} from 'lucide-react';

// المكونات
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

import { useLanguage } from '../contexts/LanguageContext';

interface CommunityViewProps {
    currentUser: UserProfile;
}

export const CommunityView = ({ currentUser }: CommunityViewProps) => {
    const { t } = useLanguage();
    const [tab, setTab] = useState<'rooms' | 'leaderboard'>('rooms');
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
    
    // Create Room State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");

    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    // 1. جلب غرف الدردشة (Smart Filtering)
    useEffect(() => {
        if (!currentUser.uid) return;

        const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allRooms: ChatRoom[] = [];
            snapshot.forEach((doc) => allRooms.push({ id: doc.id, ...doc.data() } as ChatRoom));
            
            // --- منطق الفلترة المحدث ---
            const filteredRooms = allRooms.filter(room => {
                // 1. الأدمن يرى كل شيء
                if (currentUser.role === 'admin') return true;

                // 2. المريض يرى فقط غرفة طبيبه المعالج (ويتم إخفاء الغرف العامة عنه للتركيز)
                if (currentUser.role === 'patient') {
                    return room.isDoctorRoom && room.doctorId === currentUser.patientData?.assignedDoctorId;
                }

                // 3. الطبيب يرى غرفته الخاصة فقط
                if (currentUser.role === 'doctor') {
                    return room.doctorId === currentUser.uid;
                }

                // 4. المستخدم العادي يرى الغرف العامة فقط (يخفي غرف العيادات الخاصة)
                if (currentUser.role === 'normal_user') {
                    return !room.isDoctorRoom;
                }

                return false;
            });

            setRooms(filteredRooms);
        });
        return () => unsubscribe();
    }, [currentUser]);

    // 2. جلب لوحة المتصدرين
    useEffect(() => {
        if (tab === 'leaderboard') {
            const q = query(collection(db, "users"), orderBy("progress", "desc"), limit(20));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const u: UserProfile[] = [];
                snapshot.forEach((doc) => u.push({ ...doc.data(), uid: doc.id } as UserProfile));
                setLeaderboard(u);
            });
            return () => unsubscribe();
        }
    }, [tab]);

    // 3. جلب الرسائل
    useEffect(() => {
        if (!activeRoom) return;
        const q = query(collection(db, "rooms", activeRoom.id, "messages"), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const m: ChatMessage[] = [];
            snapshot.forEach((doc) => m.push({ id: doc.id, ...doc.data() } as ChatMessage));
            setMessages(m);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });
        return () => unsubscribe();
    }, [activeRoom]);

    // --- Actions ---

    const createRoom = async () => {
        if (!newRoomName.trim() || !currentUser.uid) return;
        
        const isDoctor = currentUser.role === 'doctor';
        
        await addDoc(collection(db, "rooms"), {
            name: newRoomName,
            createdBy: currentUser.uid,
            creatorName: currentUser.name,
            language: 'mixed',
            createdAt: Date.now(),
            // إذا كان طبيباً، تصبح الغرفة "عيادة"، وإلا فهي غرفة عامة
            isDoctorRoom: isDoctor,
            doctorId: isDoctor ? currentUser.uid : null
        });
        
        setNewRoomName("");
        setShowCreateModal(false);
    };

    const deleteRoom = async (roomId: string) => {
        if (confirm("هل أنت متأكد من حذف هذه الغرفة؟")) {
            await deleteDoc(doc(db, "rooms", roomId));
            if (activeRoom?.id === roomId) setActiveRoom(null);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeRoom || !currentUser.uid) return;
        
        await addDoc(collection(db, "rooms", activeRoom.id, "messages"), {
            text: newMessage,
            senderId: currentUser.uid,
            senderName: currentUser.name,
            timestamp: Date.now(),
            role: currentUser.role,
            isDoctor: currentUser.role === 'doctor',
            isAdmin: currentUser.role === 'admin'
        });
        setNewMessage("");
    };

    // السماح بإنشاء الغرفة للجميع ما عدا المريض
    const canCreateRoom = currentUser.role !== 'patient';

    return (
        <LayoutContainer className="h-[calc(100vh-140px)] flex flex-col">
            {/* Tabs */}
            <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-white/5 mb-4 shrink-0">
                <button 
                    onClick={() => {setTab('rooms'); setActiveRoom(null);}} 
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'rooms' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <MessageCircle size={18} /> {t('comm_rooms')}
                </button>
                <button 
                    onClick={() => setTab('leaderboard')} 
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'leaderboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <Trophy size={18} /> {t('comm_leaderboard')}
                </button>
            </div>

            {/* LEADERBOARD TAB */}
            {tab === 'leaderboard' && (
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                    {leaderboard.map((user, idx) => {
                        let rankColor = 'bg-slate-800 text-slate-400';
                        let borderClass = 'border-white/5';
                        if (idx === 0) { rankColor = 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-amber-500/20 shadow-lg'; borderClass = 'border-amber-500/30'; }
                        else if (idx === 1) { rankColor = 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-500/20 shadow-lg'; borderClass = 'border-slate-400/30'; }
                        else if (idx === 2) { rankColor = 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-orange-500/20 shadow-lg'; borderClass = 'border-orange-500/30'; }

                        const MedIcon = user.medForm === 'liquid' ? FlaskConical : Pill;

                        return (
                            <div key={idx} className={`flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border ${borderClass} relative overflow-hidden group`}>
                                {idx < 3 && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-black text-xl ${rankColor}`}>
                                        {idx === 0 ? <Crown size={24} /> : idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white flex items-center gap-2">
                                            {user.name} 
                                            {user.role === 'admin' && <ShieldCheck size={14} className="text-rose-400" />}
                                            {user.role === 'doctor' && <Stethoscope size={14} className="text-blue-400" />}
                                        </p>
                                        <div className="flex gap-2 mt-1">
                                            {user.medType && (
                                                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 flex items-center gap-1">
                                                    <MedIcon size={10} /> {user.medType}
                                                </span>
                                            )}
                                            {user.streak ? (
                                                <span className="text-[10px] text-amber-500 flex items-center gap-1 font-bold">
                                                    <Zap size={10} /> {user.streak} days
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right relative z-10">
                                    <span className="text-2xl font-black text-white">{Math.round(user.progress || 0)}<span className="text-sm text-slate-500">%</span></span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ROOMS TAB (List) */}
            {tab === 'rooms' && !activeRoom && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Globe size={20} className="text-indigo-400"/> 
                            {currentUser.role === 'patient' ? t('community_clinic') : t('comm_rooms')}
                        </h2>
                        {/* زر الإنشاء يظهر للمستخدم العادي، الأدمن، والطبيب فقط */}
                        {canCreateRoom && (
                            <Button variant="success" onClick={() => setShowCreateModal(true)} className="!py-2 !px-4 !text-xs !rounded-full">
                                <Plus size={16} /> {t('create_room')}
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pb-20 custom-scrollbar pr-1">
                        {rooms.length === 0 && (
                            <div className="col-span-full text-center py-10 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                                لا توجد غرف متاحة حالياً.
                            </div>
                        )}
                        {rooms.map(room => (
                            <div key={room.id} onClick={() => setActiveRoom(room)} className={`bg-slate-900 border p-5 rounded-2xl hover:bg-slate-800 transition-all cursor-pointer group relative flex flex-col justify-between h-32 ${room.isDoctorRoom ? 'border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-white/5'}`}>
                                <div className="flex justify-between items-start">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${room.isDoctorRoom ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                                        {room.isDoctorRoom ? <Stethoscope size={20} /> : <MessageCircle size={20} />}
                                    </div>
                                    {/* حذف الغرفة: للأدمن أو لمنشئ الغرفة */}
                                    {(currentUser.uid === room.createdBy || currentUser.role === 'admin') && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                                            className="p-2 hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 rounded-full transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white truncate flex items-center gap-2">
                                        {room.name}
                                        {room.isDoctorRoom && <Lock size={12} className="text-indigo-400"/>}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                        {room.isDoctorRoom ? t('community_clinic') : `By ${room.creatorName}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Create Room Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                            <Card className="w-full max-w-sm bg-slate-900 border-white/10 shadow-2xl">
                                <h3 className="text-lg font-bold text-white mb-4">
                                    {currentUser.role === 'doctor' ? t('community_clinic') : t('create_room')}
                                </h3>
                                <input 
                                    className="w-full bg-slate-950 p-4 rounded-xl border border-white/10 text-white mb-4 outline-none focus:border-indigo-500"
                                    placeholder={t('room_name')}
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                />
                                {currentUser.role === 'doctor' ? (
                                    <p className="text-xs text-indigo-400 mb-4 bg-indigo-500/10 p-2 rounded-lg">
                                        {t('community_doctor_room_hint')}
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-500 mb-4">
                                        {t('community_public_room_hint')}
                                    </p>
                                )}
                                <div className="flex gap-2 justify-end">
                                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>{t('close')}</Button>
                                    <Button variant="primary" onClick={createRoom}>{t('create_room')}</Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* CHAT INTERFACE */}
            {tab === 'rooms' && activeRoom && (
                <div className="flex-1 flex flex-col h-full bg-slate-900 rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/80 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${activeRoom.isDoctorRoom ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                                {activeRoom.isDoctorRoom ? <Stethoscope size={16}/> : <MessageCircle size={16} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">{activeRoom.name}</h3>
                                <span className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online</span>
                            </div>
                        </div>
                        <Button variant="secondary" className="!py-1.5 !px-3 !text-xs !rounded-full" onClick={() => setActiveRoom(null)}>
                            {t('close')}
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 pt-20 space-y-4 custom-scrollbar">
                        {messages.map((msg, i) => {
                            const isMe = msg.senderId === currentUser.uid;
                            const showAvatar = i === 0 || messages[i-1].senderId !== msg.senderId;
                            
                            let bubbleClass = 'bg-slate-800 text-slate-200';
                            if (isMe) bubbleClass = 'bg-indigo-600 text-white';
                            else if (msg.isDoctor || msg.role === 'doctor') bubbleClass = 'bg-blue-900/40 border border-blue-500/30 text-blue-100';
                            else if (msg.isAdmin || msg.role === 'admin') bubbleClass = 'bg-rose-900/40 border border-rose-500/30 text-rose-100';

                            return (
                                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${showAvatar ? (isMe ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300') : 'opacity-0'}`}>
                                        {msg.senderName.charAt(0).toUpperCase()}
                                    </div>

                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                        {showAvatar && !isMe && (
                                            <span className="text-[10px] text-slate-500 mb-1 ml-1 flex items-center gap-1">
                                                {msg.senderName}
                                                {msg.role === 'doctor' && <Badge color="blue" className="!text-[8px] !px-1.5 !py-0">DR</Badge>}
                                                {msg.role === 'admin' && <Badge color="rose" className="!text-[8px] !px-1.5 !py-0">ADMIN</Badge>}
                                            </span>
                                        )}
                                        
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${bubbleClass} ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[9px] text-slate-600 mt-1 px-1 opacity-70">
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-slate-950/80 border-t border-white/5 flex gap-2 backdrop-blur-md">
                        <input 
                            className="flex-1 bg-slate-900 border border-white/10 rounded-full px-5 py-3 text-white text-sm outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all placeholder-slate-600"
                            placeholder={t('type_msg')}
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        />
                        <button 
                            onClick={sendMessage} 
                            disabled={!newMessage.trim()}
                            className="p-3 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `views\DashboardView.tsx`
```tsx
import React, { useState } from 'react';
import { AlertTriangle, HeartPulse, FileText, PauseCircle, Stethoscope } from 'lucide-react';

// المكونات الأساسية
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

// النوافذ المنبثقة
import { BreathingModal } from '../components/modals/BreathingModal';
import { DoctorReportModal } from '../components/modals/DoctorReportModal';

// المكونات الفرعية الجديدة للوحة التحكم
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DailyCheckIn } from './dashboard/DailyCheckIn';
import { DashboardCharts } from './dashboard/DashboardCharts';

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
  
  // هل المستخدم يتبع طبيباً؟
  const isPatient = userProfile?.role === 'patient';
  const isManualPlan = userProfile?.planType === 'manual';
  const doctorName = userProfile?.patientData?.assignedDoctorName;

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
        
        {/* Main Header & Interaction Area */}
        <DashboardHeader
            todayPlan={todayPlan}
            todayLog={todayLog}
            progressPercentage={progressPercentage}
            totalDays={totalDays}
            daysCompleted={daysCompleted}
            userProfile={userProfile}
        >
            {/* هذا المكون سيظهر فقط إذا لم يتم التسجيل اليوم (children) */}
            <DailyCheckIn 
                userProfile={userProfile}
                todayPlan={todayPlan}
                selectedDose={selectedDose}
                setSelectedDose={setSelectedDose}
                selectedMood={selectedMood}
                setSelectedMood={setSelectedMood}
                submitDailyLog={submitDailyLog}
            />
        </DashboardHeader>

        {/* Side Info Cards */}
        <div className="lg:col-span-4">
            <DashboardCharts userProfile={userProfile} plan={plan} />
        </div>

      </div>
    </LayoutContainer>
  );
};
```
---

### File: `views\DoctorDashboardView.tsx`
```tsx
import React, { useEffect, useState } from 'react';
import { 
    collection, query, where, getDocs, updateDoc, doc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, ManualPhase } from '../types';
import { 
    Users, Clock, CheckCircle, Activity, Plus, X, Trash2, 
    ChevronRight, Save, AlertCircle, Copy, Repeat, Eraser 
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { generateManualPlan } from '../services/taperingEngine';
import { useLanguage } from '../contexts/LanguageContext';

// 👇 تحديث المسارات للمكونات الجديدة
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

export const DoctorDashboardView = () => {
    const { t } = useLanguage();
    
    // -- State --
    const [loading, setLoading] = useState(true);
    const [doctorProfile, setDoctorProfile] = useState<UserProfile | null>(null);
    const [patients, setPatients] = useState<UserProfile[]>([]);
    const [pendingPatients, setPendingPatients] = useState<UserProfile[]>([]);
    
    // -- Modal State (For Plan Creation) --
    const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
    const [phases, setPhases] = useState<ManualPhase[]>([]);
    
    // Manual Input
    const [newDose, setNewDose] = useState('');
    const [newDays, setNewDays] = useState('7');
    const [doctorNote, setDoctorNote] = useState('');

    // Pattern Builder State
    const [patternSeq, setPatternSeq] = useState('0.5, 1'); // Default example
    const [patternRepeat, setPatternRepeat] = useState('4');
    const [patternDaysPerDose, setPatternDaysPerDose] = useState('1');

    // -- Fetch Data --
    useEffect(() => {
        const fetchDoctorData = async () => {
            const currentUser = auth?.currentUser;
            if (!currentUser) return;
            
            setLoading(true);
            try {
                // 1. Get Doctor Profile
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDoctorProfile(docSnap.data() as UserProfile);
                }

                // 2. Get Assigned Patients
                // Note: We fetch ALL assigned patients here to categorize them
                const q = query(
                    collection(db, "users"), 
                    where("patientData.assignedDoctorId", "==", currentUser.uid)
                );
                const querySnapshot = await getDocs(q);
                const allPatients: UserProfile[] = [];
                querySnapshot.forEach((doc) => {
                    allPatients.push({ uid: doc.id, ...doc.data() } as UserProfile);
                });

                // Filter Logic:
                // Pending Plan: Request approved BUT no plan assigned yet
                // Active: Plan assigned AND not recovered
                setPendingPatients(allPatients.filter(p => p.patientData?.requestStatus === 'approved' && !p.patientData?.isPlanAssigned));
                setPatients(allPatients.filter(p => p.patientData?.isPlanAssigned));

            } catch (error) {
                console.error("Error fetching doctor data:", error);
            }
            setLoading(false);
        };

        fetchDoctorData();
    }, []);

    // -- Actions --

    // A. Add Single Phase
    const handleAddPhase = () => {
        const dose = parseFloat(newDose);
        const days = parseInt(newDays);
        if (!isNaN(dose) && !isNaN(days) && days > 0) {
            setPhases([...phases, { dose, days }]);
            setNewDose(''); 
        }
    };

    // B. Apply Pattern (The Fix for Complex Plans)
    const handleApplyPattern = () => {
        const sequence = patternSeq.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        const repeat = parseInt(patternRepeat);
        const days = parseInt(patternDaysPerDose);

        if (sequence.length === 0 || isNaN(repeat) || repeat <= 0 || isNaN(days) || days <= 0) {
            alert("Please check your pattern inputs.");
            return;
        }

        const newPhases: ManualPhase[] = [];
        for (let i = 0; i < repeat; i++) {
            sequence.forEach(dose => {
                newPhases.push({ dose, days });
            });
        }

        setPhases([...phases, ...newPhases]);
    };

    const handleRemovePhase = (index: number) => {
        setPhases(phases.filter((_, i) => i !== index));
    };

    const saveTreatmentPlan = async () => {
        if (!selectedPatient?.uid || phases.length === 0) return;

        if (!confirm("Are you sure you want to activate this plan for the patient?")) return;

        // Generate full calendar plan from phases
        const fullPlan = generateManualPlan(phases, new Date().toISOString());

        try {
            await updateDoc(doc(db, "users", selectedPatient.uid), {
                plan: fullPlan,
                "patientData.isPlanAssigned": true,
                "patientData.isRecovered": false,
                doctorNotes: doctorNote,
                planType: 'manual', 
                lastActive: new Date().toISOString()
            });

            // Update UI Locally
            setPendingPatients(prev => prev.filter(p => p.uid !== selectedPatient.uid));
            setPatients(prev => [...prev, { 
                ...selectedPatient, 
                patientData: { ...selectedPatient.patientData!, isPlanAssigned: true } 
            }]);
            
            setSelectedPatient(null);
            setPhases([]);
            setDoctorNote('');
            alert("Plan saved successfully!");

        } catch (e) {
            console.error("Error saving plan:", e);
            alert("Failed to save plan. Check console.");
        }
    };

    const markAsRecovered = async (patient: UserProfile) => {
        if (!patient.uid) return;
        if (!confirm("Mark this patient as recovered?")) return;

        await updateDoc(doc(db, "users", patient.uid), {
            "patientData.isRecovered": true,
            "patientData.recoveryDate": new Date().toISOString()
        });

        setPatients(prev => prev.map(p => p.uid === patient.uid ? { 
            ...p, patientData: { ...p.patientData!, isRecovered: true } 
        } : p));
    };

    const statsData = [
        { name: t('stat_new_requests'), value: pendingPatients.length, color: '#f59e0b' },
        { name: 'Active', value: patients.filter(p => !p.patientData?.isRecovered).length, color: '#6366f1' },
        { name: t('stat_recovered'), value: patients.filter(p => p.patientData?.isRecovered).length, color: '#10b981' },
    ];

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500 animate-pulse">Loading clinic data...</div>;

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('nav_dashboard')} 
                subtitle={`Dr. ${doctorProfile?.name || 'Doctor'} - ${doctorProfile?.doctorData?.specialty || ''}`} 
            />

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-slate-900 border-white/5 p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase mb-1">{t('stat_total_patients')}</p>
                            <h3 className="text-3xl font-black text-white">{patients.length + pendingPatients.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><Users size={20}/></div>
                    </div>
                </Card>
                
                <Card className="bg-amber-900/10 border-amber-500/20 p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-amber-500/70 text-xs font-bold uppercase mb-1">{t('pending_approvals')}</p>
                            <h3 className="text-3xl font-black text-amber-500">{pendingPatients.length}</h3>
                        </div>
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 animate-pulse"><Clock size={20}/></div>
                    </div>
                </Card>

                <Card className="bg-emerald-900/10 border-emerald-500/20 p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-emerald-500/70 text-xs font-bold uppercase mb-1">{t('stat_recovered')}</p>
                            <h3 className="text-3xl font-black text-emerald-500">{patients.filter(p => p.patientData?.isRecovered).length}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><CheckCircle size={20}/></div>
                    </div>
                </Card>

                <Card className="bg-slate-900 border-white/5 p-5">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-4">{t('stat_overview')}</p>
                    <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155'}} itemStyle={{color: '#fff'}} />
                                <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>
                                    {statsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* PENDING PATIENTS (Waiting for Plan) */}
            {pendingPatients.length > 0 && (
                <div className="mb-8 animate-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="text-amber-500" /> Patients Waiting for Plan
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingPatients.map(patient => (
                            <div key={patient.uid} className="bg-slate-900 border border-amber-500/30 p-5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{patient.name}</h3>
                                        <p className="text-xs text-slate-500">{patient.email}</p>
                                    </div>
                                    <Badge color="amber" className="mr-auto">Needs Plan</Badge>
                                </div>
                                <div className="bg-slate-950 p-3 rounded-lg text-xs text-slate-400 mb-4 space-y-1">
                                    <div className="flex justify-between"><span>Type:</span> <span className="text-white">{patient.medType}</span></div>
                                    <div className="flex justify-between"><span>Form:</span> <span className="text-white">{patient.medForm}</span></div>
                                    <div className="flex justify-between"><span>Unit:</span> <span className="text-white">{patient.medUnit}</span></div>
                                </div>
                                <Button onClick={() => setSelectedPatient(patient)} className="w-full" variant="primary">
                                    {t('create_plan_btn')} <ChevronRight size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ACTIVE PATIENTS LIST */}
            <Card className="bg-slate-900 border-white/5 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="text-indigo-400" /> {t('stat_total_patients')}
                    </h2>
                    <div className="text-sm text-slate-500">
                        Total: {patients.length}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">Patient</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Progress</th>
                                <th className="p-4">Last Active</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {patients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-600 italic">No active patients with plans.</td>
                                </tr>
                            )}
                            {patients.map(patient => (
                                <tr key={patient.uid} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-medium text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs">
                                            {patient.name.charAt(0)}
                                        </div>
                                        {patient.name}
                                    </td>
                                    <td className="p-4">
                                        {patient.patientData?.isRecovered ? (
                                            <Badge color="green">Recovered</Badge>
                                        ) : (
                                            <Badge color="indigo">On Plan</Badge>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500" style={{width: `${patient.progress || 0}%`}}></div>
                                            </div>
                                            <span className="text-xs">{Math.round(patient.progress || 0)}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs">
                                        {patient.lastActive ? new Date(patient.lastActive).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-4">
                                        {!patient.patientData?.isRecovered && (
                                            <button 
                                                onClick={() => markAsRecovered(patient)}
                                                className="text-xs text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all"
                                            >
                                                Mark Recovered
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* PLAN CREATION MODAL */}
            {selectedPatient && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-4xl bg-slate-900 border-white/10 shadow-2xl relative max-h-[90vh] flex flex-col">
                        <button type="button" onClick={() => setSelectedPatient(null)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white z-20">
                            <X size={20} />
                        </button>

                        <div className="p-6 border-b border-white/5">
                            <h2 className="text-2xl font-bold text-white mb-1">{t('create_plan_btn')}</h2>
                            <p className="text-slate-500">Patient: <span className="text-indigo-400 font-bold">{selectedPatient.name}</span></p>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* LEFT: Pattern Builder (NEW) */}
                                <div className="bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-xl">
                                    <h3 className="text-indigo-400 font-bold mb-3 flex items-center gap-2">
                                        <Repeat size={16}/> {t('pattern_builder')}
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] text-slate-400 block mb-1">{t('pattern_sequence')}</label>
                                            <input 
                                                className="w-full bg-slate-950 border border-indigo-500/30 rounded-lg p-2 text-white font-mono text-sm"
                                                placeholder="0.5, 1, 0.5, 1"
                                                value={patternSeq}
                                                onChange={e => setPatternSeq(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="text-[10px] text-slate-400 block mb-1">{t('repeat_count')}</label>
                                                <input 
                                                    type="number" className="w-full bg-slate-950 border border-indigo-500/30 rounded-lg p-2 text-white font-mono text-sm"
                                                    value={patternRepeat} onChange={e => setPatternRepeat(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] text-slate-400 block mb-1">{t('days_per_dose')}</label>
                                                <input 
                                                    type="number" className="w-full bg-slate-950 border border-indigo-500/30 rounded-lg p-2 text-white font-mono text-sm"
                                                    value={patternDaysPerDose} onChange={e => setPatternDaysPerDose(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={handleApplyPattern} className="w-full !py-2 !bg-indigo-600 !text-xs">
                                            <Copy size={14} className="mr-2"/> {t('apply_pattern')}
                                        </Button>
                                    </div>
                                </div>

                                {/* RIGHT: Manual Entry */}
                                <div className="bg-slate-950 border border-white/5 p-4 rounded-xl">
                                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                        <Plus size={16}/> Manual Entry
                                    </h3>
                                    <div className="flex gap-2 mb-3">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-slate-500 block mb-1">{t('dose')}</label>
                                            <input type="number" className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white" value={newDose} onChange={e => setNewDose(e.target.value)}/>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] text-slate-500 block mb-1">{t('duration_days')}</label>
                                            <input type="number" className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white" value={newDays} onChange={e => setNewDays(e.target.value)}/>
                                        </div>
                                    </div>
                                    <Button onClick={handleAddPhase} variant="secondary" className="w-full !py-2 !text-xs">Add Phase</Button>
                                </div>
                            </div>

                            {/* Phases List */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-white font-bold flex items-center gap-2"><Activity size={16}/> {t('plan_phases')}</h3>
                                    {phases.length > 0 && (
                                        <button onClick={() => setPhases([])} className="text-rose-500 text-xs flex items-center gap-1 hover:text-rose-400">
                                            <Eraser size={12}/> {t('clear_phases')}
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                    {phases.length === 0 && <p className="text-center text-slate-600 text-sm py-4">No phases added yet.</p>}
                                    {phases.map((phase, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-white/5 animate-in slide-in-from-right-2">
                                            <span className="text-white font-bold text-sm flex items-center gap-2">
                                                <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">{idx + 1}</span>
                                                <span className="text-indigo-400 text-lg">{phase.dose}{selectedPatient.medUnit || 'mg'}</span> 
                                                <span className="text-slate-500 text-xs">x {phase.days} days</span>
                                            </span>
                                            <button type="button" onClick={() => handleRemovePhase(idx)} className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded"><Trash2 size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-sm font-bold text-slate-400">
                                    <span>Total Duration: <span className="text-white">{phases.reduce((a,b) => a + b.days, 0)} days</span></span>
                                    <span>Total Phases: <span className="text-white">{phases.length}</span></span>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('plan_notes')}</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white h-20 outline-none focus:border-indigo-500"
                                    placeholder="..."
                                    value={doctorNote}
                                    onChange={e => setDoctorNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/5 bg-slate-900 flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setSelectedPatient(null)}>{t('close')}</Button>
                            <Button variant="success" onClick={saveTreatmentPlan} disabled={phases.length === 0}>
                                <Save size={18} className="mr-2"/> {t('submit_plan')}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `views\DoctorPatientsView.tsx`
```tsx
import React, { useEffect, useState } from 'react';
import { 
    collection, query, where, getDocs, updateDoc, doc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, DailyLog } from '../types';
import { 
    Users, Search, UserPlus, FileText, Activity, Moon, Smile, Frown, Meh, Calendar, ChevronLeft, X, UserCheck, UserX, Clock
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

// 👇 تحديث المسارات للمكونات الجديدة
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

export const DoctorPatientsView = () => {
    const { t } = useLanguage();

    // -- State --
    const [myPatients, setMyPatients] = useState<UserProfile[]>([]);
    const [pendingRequests, setPendingRequests] = useState<UserProfile[]>([]); // New State
    const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    
    // -- UI State --
    const [activeTab, setActiveTab] = useState<'MY_PATIENTS' | 'REQUESTS'>('MY_PATIENTS');
    const [viewMode, setViewMode] = useState<'LIST' | 'ADD_NEW'>('LIST');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
    const [patientLogs, setPatientLogs] = useState<DailyLog[]>([]);
    
    // -- Fetch Data --
    const fetchData = async () => {
        const currentUser = auth?.currentUser;
        if (!currentUser) return;
        
        setLoading(true);
        try {
            // 1. Fetch Assigned Patients (Both Approved and Pending)
            const q = query(
                collection(db, "users"), 
                where("patientData.assignedDoctorId", "==", currentUser.uid)
            );
            const snapshot = await getDocs(q);
            const allAssigned: UserProfile[] = [];
            snapshot.forEach(d => allAssigned.push({ uid: d.id, ...d.data() } as UserProfile));

            // Split into buckets
            setMyPatients(allAssigned.filter(p => p.patientData?.requestStatus === 'approved'));
            setPendingRequests(allAssigned.filter(p => p.patientData?.requestStatus === 'pending'));

        } catch (e) { console.error("Error fetching data:", e); }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // -- Actions --

    const handleAcceptRequest = async (patient: UserProfile) => {
        if (!patient.uid) return;
        if (!confirm(`Accept ${patient.name} as your patient?`)) return;

        try {
            await updateDoc(doc(db, "users", patient.uid), {
                "patientData.requestStatus": "approved",
                "patientData.isPlanAssigned": false // Needs plan now
            });
            
            // Move from pending to active locally
            setPendingRequests(prev => prev.filter(p => p.uid !== patient.uid));
            setMyPatients(prev => [...prev, { 
                ...patient, 
                patientData: { ...patient.patientData!, requestStatus: 'approved' } 
            }]);
        } catch (e) { console.error(e); }
    };

    const handleRejectRequest = async (patient: UserProfile) => {
        if (!patient.uid) return;
        if (!confirm(`Reject request from ${patient.name}?`)) return;

        try {
            await updateDoc(doc(db, "users", patient.uid), {
                "patientData.requestStatus": "rejected"
            });
            // Remove from list locally
            setPendingRequests(prev => prev.filter(p => p.uid !== patient.uid));
        } catch (e) { console.error(e); }
    };

    // -- Existing Logic for Manual Add --
    const fetchAvailableUsers = async () => {
        setLoading(true);
        try {
            const q1 = query(collection(db, "users"), where("role", "==", "normal_user"));
            const snap1 = await getDocs(q1);
            const q2 = query(collection(db, "users"), where("role", "==", "patient"));
            const snap2 = await getDocs(q2);

            const list: UserProfile[] = [];
            const seenIds = new Set();

            const processDoc = (d: any) => {
                const data = d.data() as UserProfile;
                if (!data.patientData?.assignedDoctorId && !seenIds.has(d.id)) {
                    list.push({ uid: d.id, ...data });
                    seenIds.add(d.id);
                }
            };
            snap1.forEach(processDoc);
            snap2.forEach(processDoc);
            setAvailableUsers(list);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleManualAdd = async (user: UserProfile) => {
        const currentUser = auth?.currentUser;
        if (!currentUser || !user.uid) return;
        
        try {
            await updateDoc(doc(db, "users", user.uid), {
                role: 'patient',
                patientData: {
                    assignedDoctorId: currentUser.uid,
                    assignedDoctorName: currentUser.displayName || 'Doctor',
                    requestStatus: 'approved', // Manual add is auto-approved
                    isPlanAssigned: false, 
                    isRecovered: false
                },
            });
            setAvailableUsers(prev => prev.filter(u => u.uid !== user.uid));
            setMyPatients(prev => [...prev, { ...user, role: 'patient', patientData: { ...user.patientData!, requestStatus: 'approved' } }]);
            setViewMode('LIST');
        } catch (e) { console.error(e); }
    };

    const openPatientDetails = async (patient: UserProfile) => {
        if (!patient.uid) return;
        setSelectedPatient(patient);
        setPatientLogs([]); 
        try {
            const d = await getDoc(doc(db, "users", patient.uid));
            if (d.exists()) {
                const data = d.data();
                setPatientLogs(data.logs || []);
            }
        } catch (e) { console.error(e); }
    };

    const filteredAvailable = availableUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredMyPatients = myPatients.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('manage_patients_title')} 
                subtitle="Track progress and manage your clinic."
                action={
                    viewMode === 'LIST' ? (
                        <Button onClick={() => { setViewMode('ADD_NEW'); fetchAvailableUsers(); }} variant="primary">
                            <UserPlus size={18} /> {t('add_patient_btn')}
                        </Button>
                    ) : (
                        <Button onClick={() => setViewMode('LIST')} variant="secondary">
                            <ChevronLeft size={18} /> {t('back_list_btn')}
                        </Button>
                    )
                }
            />

            {/* --- ADD NEW PATIENT MODE --- */}
            {viewMode === 'ADD_NEW' && (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <Card className="bg-slate-900 border-white/5 mb-6">
                        <h3 className="text-xl font-bold text-white mb-4">Find Users</h3>
                        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-white/5 mb-6">
                            <Search className="text-slate-500" />
                            <input 
                                className="bg-transparent w-full text-white outline-none placeholder-slate-600"
                                placeholder={t('search_available_placeholder')}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {filteredAvailable.map(user => (
                                <div key={user.uid} className="flex justify-between items-center p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">{user.name.charAt(0)}</div>
                                        <div><h4 className="font-bold text-white">{user.name}</h4><p className="text-xs text-slate-500">{user.email}</p></div>
                                    </div>
                                    <Button onClick={() => handleManualAdd(user)} variant="success" className="!py-2 !px-3 !text-xs"><UserPlus size={14} className="mr-1"/> {t('add_btn')}</Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* --- LIST MODE --- */}
            {viewMode === 'LIST' && (
                <div className="animate-in fade-in">
                    {/* TABS */}
                    <div className="flex gap-4 mb-6 border-b border-white/10 pb-1">
                        <button 
                            onClick={() => setActiveTab('MY_PATIENTS')}
                            className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === 'MY_PATIENTS' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {t('stat_total_patients')}
                            <span className="ml-2 bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full">{myPatients.length}</span>
                            {activeTab === 'MY_PATIENTS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full"></div>}
                        </button>
                        
                        <button 
                            onClick={() => setActiveTab('REQUESTS')}
                            className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === 'REQUESTS' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {t('patient_requests_title')}
                            {pendingRequests.length > 0 && <span className="ml-2 bg-amber-500 text-slate-900 text-[10px] px-2 py-0.5 rounded-full animate-pulse font-black">{pendingRequests.length}</span>}
                            {activeTab === 'REQUESTS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t-full"></div>}
                        </button>
                    </div>

                    {/* TAB: REQUESTS */}
                    {activeTab === 'REQUESTS' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-left-4">
                            {pendingRequests.length === 0 && (
                                <div className="col-span-full text-center py-12 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800 text-slate-500">
                                    <Clock size={40} className="mx-auto mb-2 opacity-20"/> {t('no_requests')}
                                </div>
                            )}
                            {pendingRequests.map(patient => (
                                <div key={patient.uid} className="bg-slate-900 border border-amber-500/20 p-6 rounded-2xl relative">
                                    <Badge color="amber" className="absolute top-4 right-4 !py-0.5 !px-2">Pending</Badge>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold text-lg">{patient.name.charAt(0)}</div>
                                        <div>
                                            <h3 className="font-bold text-white">{patient.name}</h3>
                                            <p className="text-xs text-slate-500">{patient.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-lg mb-4">
                                        <div className="flex-1 text-center border-r border-white/5"><span className="block font-bold text-white">{patient.medType}</span>Type</div>
                                        <div className="flex-1 text-center"><span className="block font-bold text-white">{patient.medForm}</span>Form</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={() => handleAcceptRequest(patient)} variant="success" className="flex-1 !py-2 !text-xs">
                                            <UserCheck size={14} className="mr-1"/> {t('accept_patient')}
                                        </Button>
                                        <Button onClick={() => handleRejectRequest(patient)} variant="danger" className="flex-1 !py-2 !text-xs">
                                            <UserX size={14} className="mr-1"/> {t('reject_patient')}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TAB: MY PATIENTS */}
                    {activeTab === 'MY_PATIENTS' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in slide-in-from-right-4">
                            {filteredMyPatients.map(patient => (
                                <div 
                                    key={patient.uid} 
                                    onClick={() => openPatientDetails(patient)}
                                    className="bg-slate-900 border border-white/5 p-6 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800 cursor-pointer transition-all group relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 font-bold text-xl">{patient.name.charAt(0)}</div>
                                            <div><h3 className="text-lg font-bold text-white">{patient.name}</h3><p className="text-sm text-slate-500">{patient.email}</p></div>
                                        </div>
                                        <Badge color={patient.patientData?.isRecovered ? 'green' : patient.patientData?.isPlanAssigned ? 'indigo' : 'amber'}>
                                            {patient.patientData?.isRecovered ? 'Recovered' : patient.patientData?.isPlanAssigned ? 'Active' : 'Needs Plan'}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                        <div className="bg-slate-950 p-2 rounded-lg border border-white/5"><span className="block text-[10px] text-slate-500 uppercase">Progress</span><span className="block font-bold text-indigo-400">{Math.round(patient.progress || 0)}%</span></div>
                                        <div className="bg-slate-950 p-2 rounded-lg border border-white/5"><span className="block text-[10px] text-slate-500 uppercase">Status</span><span className="block font-bold text-white">{patient.patientData?.isPlanAssigned ? 'On Track' : 'Waiting'}</span></div>
                                        <div className="bg-slate-950 p-2 rounded-lg border border-white/5"><span className="block text-[10px] text-slate-500 uppercase">Last Active</span><span className="block font-bold text-slate-300 text-[10px] mt-1">{patient.lastActive ? new Date(patient.lastActive).toLocaleDateString() : 'N/A'}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- PATIENT DETAILS MODAL --- */}
            {selectedPatient && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-5xl h-[90vh] flex flex-col bg-slate-900 border-white/10 shadow-2xl relative !p-0 overflow-hidden">
                        <div className="p-6 bg-slate-950 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">{selectedPatient.name.charAt(0)}</div>
                                <div><h2 className="text-2xl font-bold text-white">{selectedPatient.name}</h2><div className="flex items-center gap-2 text-xs text-slate-500"><FileText size={12}/> {selectedPatient.medType || 'General'} • {selectedPatient.medForm} • {selectedPatient.medUnit}</div></div>
                            </div>
                            <button type="button" onClick={() => setSelectedPatient(null)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 custom-scrollbar">
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="bg-slate-950 border-white/5">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Activity size={16} className="text-indigo-400"/> Adherence</h3>
                                    <div className="h-64 w-full">
                                        {patientLogs.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%"><AreaChart data={patientLogs.slice(-30)}><defs><linearGradient id="colorDoseP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} /><XAxis dataKey="date" hide /><YAxis stroke="#475569" fontSize={10} /><Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b'}} /><Area type="monotone" dataKey="doseTaken" stroke="#6366f1" fill="url(#colorDoseP)" /></AreaChart></ResponsiveContainer>
                                        ) : (<div className="h-full flex items-center justify-center text-slate-600">No data available</div>)}
                                    </div>
                                </Card>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-slate-950 p-4 rounded-xl border border-white/5 text-center"><span className="text-xs text-slate-500 uppercase block mb-1">{t('sleep_label')}</span><span className="text-xl font-bold text-white flex items-center justify-center gap-1"><Moon size={16} className="text-blue-400"/> {patientLogs.length > 0 ? (patientLogs.reduce((a,b) => a + (b.sleepHours || 0), 0) / patientLogs.length).toFixed(1) : '-'}h</span></div>
                                     <div className="bg-slate-950 p-4 rounded-xl border border-white/5 text-center"><span className="text-xs text-slate-500 uppercase block mb-1">{t('mood')}</span><span className="text-xl font-bold text-white flex items-center justify-center gap-1"><Smile size={16} className="text-emerald-400"/>Good</span></div>
                                </div>
                                <Card className="bg-slate-900 border-white/5 flex-1 max-h-[400px] overflow-hidden flex flex-col">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 sticky top-0 bg-slate-950 pb-2"><Calendar size={16} className="text-indigo-400"/> Daily Logs</h3>
                                    <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2 pr-2">
                                        {patientLogs.slice().reverse().map((log, i) => (<div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-900 border border-white/5 text-xs"><span className="text-slate-400">{log.date}</span><span className="font-bold text-white">{log.doseTaken} {selectedPatient.medUnit}</span><span>{log.mood === 'good' ? <Smile size={14} className="text-emerald-500"/> : log.mood === 'bad' ? <Frown size={14} className="text-rose-500"/> : <Meh size={14} className="text-amber-500"/>}</span></div>))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `views\LoginView.tsx`
```tsx
import React from 'react';
import { Activity, Chrome, LogIn } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginViewProps {
  handleLogin: (e: React.FormEvent) => void;
  handleGoogleLogin: () => void;
  email: string;
  setEmail: (s: string) => void;
  password: string;
  setPassword: (s: string) => void;
  loginError: string;
  setDemoCreds: () => void;
}

export const LoginView = ({ 
  handleLogin, handleGoogleLogin, email, setEmail, password, setPassword, loginError, setDemoCreds 
}: LoginViewProps) => {
  const { t, dir } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden" dir={dir}>
      {/* خلفية تفاعلية (Ambient Background Effects) */}
      <div className="absolute top-0 left-0 w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-indigo-600/10 rounded-full blur-[100px] md:blur-[150px] -translate-x-1/2 -translate-y-1/2 animate-pulse duration-[10000ms]"></div>
      <div className="absolute bottom-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-violet-600/5 rounded-full blur-[80px] md:blur-[120px] translate-x-1/2 translate-y-1/2"></div>
      
      {/* مبدل اللغة في الزاوية */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md p-8 md:p-10 relative z-10 border-white/10 shadow-[0_0_80px_rgba(79,70,229,0.15)] bg-slate-900/80 backdrop-blur-2xl">
        <div className="text-center mb-10">
          <div className="relative inline-block group">
              <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
              <div className="bg-gradient-to-br from-indigo-500 to-violet-600 w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative z-10 border border-white/20 transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
                  <Activity className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">Islam's Guide<span className="text-indigo-500">.</span></h1>
          <p className="text-slate-400 font-bold tracking-[0.2em] uppercase text-[10px]">{t('subtitle')}</p>
        </div>

        <div className="space-y-6">
            {/* Google Login */}
            <Button 
                onClick={handleGoogleLogin}
                className="w-full py-4 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-950 border-0 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 font-bold"
            >
                <Chrome className="w-5 h-5" />
                <span>{t('login_google')}</span>
            </Button>

            <div className="flex items-center gap-4 text-xs text-slate-600 font-bold uppercase tracking-widest">
                <div className="h-px bg-slate-800 flex-1"></div>
                {t('or')}
                <div className="h-px bg-slate-800 flex-1"></div>
            </div>

            {/* Email/Password Login */}
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-4">
                    <div className="group relative">
                        <input 
                            type="text" 
                            placeholder={t('email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-slate-950/60 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white outline-none transition-all placeholder-slate-600 font-medium group-hover:border-slate-700"
                        />
                    </div>
                    <div className="group relative">
                        <input 
                            type="password" 
                            placeholder={t('password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-slate-950/60 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white outline-none transition-all placeholder-slate-600 font-medium group-hover:border-slate-700"
                        />
                    </div>
                </div>
                
                {loginError && (
                    <div className="text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 flex items-center gap-2 animate-in slide-in-from-top-2">
                        {t('error_prefix')}{loginError}
                    </div>
                )}
                
                <Button className="w-full py-5 text-lg shadow-indigo-500/25" type="submit">
                    {t('login_email')} <LogIn size={18} className="ml-2"/>
                </Button>
            </form>
        </div>
          
          {/* Demo Mode Link */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-4">
             <p 
                onClick={setDemoCreds}
                className="text-slate-500 text-xs cursor-pointer hover:text-indigo-400 transition-colors"
             >
                {t('demo_account')}
             </p>
          </div>
      </Card>
    </div>
  );
};
```
---

### File: `views\OnboardingView.tsx`
```tsx
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Pill, AlertTriangle, ArrowRight, ArrowLeft, 
  Stethoscope, BrainCircuit, FlaskConical, UserPlus, FileText, MapPin, Phone, Award, Search, User
} from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

// المكونات
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { Badge } from '../components/ui/Badge';
import { ScientificPlanModal } from '../components/modals/ScientificPlanModal'; // استيراد المودال الجديد

import { UserProfile, Inventory, PlanDay, MedForm, MedUnit, DoctorProfileData } from '../types';
import { calculateTotalInventory, generatePlan } from '../services/taperingEngine';
import { useLanguage } from '../contexts/LanguageContext';

interface OnboardingViewProps {
  userProfile: UserProfile; 
  setUserProfile: (p: UserProfile | null) => void;
  inventory: Inventory;
  setInventory: (i: Inventory) => void;
  currentDoseHabit: number;
  setCurrentDoseHabit: (n: number) => void;
  startPlan: (customPlan: PlanDay[], speed: number, type: 'algorithm' | 'manual') => void;
  email: string;
  handleLogout?: () => void;
}

type OnboardingStep = 
  | 'ROLE_SELECT' 
  | 'DOCTOR_FORM' 
  | 'USER_PATH_SELECT' 
  | 'DOCTOR_SELECT' 
  | 'ALGO_SETUP_MED' 
  | 'ALGO_SETUP_FORM' 
  | 'ALGO_SETUP_INV' 
  | 'ALGO_PREVIEW';

export const OnboardingView = ({ 
  userProfile, setUserProfile, inventory, setInventory, 
  currentDoseHabit, setCurrentDoseHabit, startPlan, email, handleLogout
}: OnboardingViewProps) => {
  const { t, dir } = useLanguage();
  
  const [step, setStep] = useState<OnboardingStep>('ROLE_SELECT');
  const [loading, setLoading] = useState(false);
  
  // Doctor States
  const [doctorName, setDoctorName] = useState(userProfile.name || '');
  const [doctorForm, setDoctorForm] = useState<Partial<DoctorProfileData>>({
      specialty: '', licenseNumber: '', clinicLocation: '', phoneNumber: '', bio: ''
  });

  const [availableDoctors, setAvailableDoctors] = useState<UserProfile[]>([]);
  const [searchDoctor, setSearchDoctor] = useState('');

  // Algorithm States
  const [medForm, setMedForm] = useState<MedForm | null>(null);
  const [medUnit, setMedUnit] = useState<MedUnit | null>(null);
  const [medType, setMedType] = useState<'narcotic' | 'psychiatric' | 'normal' | null>(null);
  const [blockedState, setBlockedState] = useState(false);
  const [psychWarning, setPsychWarning] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<PlanDay[]>([]);
  
  // Scientific Modal State
  const [showSciModal, setShowSciModal] = useState(false);
  
  const totalInventory = calculateTotalInventory(inventory);
  
  // -- Load existing data if resubmitting --
  useEffect(() => {
      if (userProfile.role === 'doctor' && userProfile.doctorData) {
          setDoctorName(userProfile.name);
          setDoctorForm({
              specialty: userProfile.doctorData.specialty,
              licenseNumber: userProfile.doctorData.licenseNumber,
              clinicLocation: userProfile.doctorData.clinicLocation,
              phoneNumber: userProfile.doctorData.phoneNumber,
              bio: userProfile.doctorData.bio
          });
          setStep('DOCTOR_FORM');
      }
  }, [userProfile]);

  const NavBackBtn = ({ to }: { to?: OnboardingStep }) => (
      <button 
        onClick={() => to ? setStep(to) : handleLogout?.()}
        className="absolute top-6 left-6 z-20 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        disabled={loading}
      >
        {dir === 'rtl' ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
      </button>
  );

  // --- Actions ---

  const handleDoctorSubmit = async () => {
      if (!auth || !auth.currentUser) return;
      
      if (!doctorForm.specialty || !doctorForm.licenseNumber || !doctorForm.phoneNumber || !doctorName) {
          alert("يرجى ملء جميع الحقول المطلوبة.");
          return;
      }

      setLoading(true);
      const currentUser = auth.currentUser;
      
      const newProfile: UserProfile = {
          ...userProfile,
          uid: currentUser.uid, 
          name: doctorName,
          role: 'doctor',
          setupComplete: true, 
          doctorData: {
              specialty: doctorForm.specialty!,
              licenseNumber: doctorForm.licenseNumber!,
              clinicLocation: doctorForm.clinicLocation || '',
              phoneNumber: doctorForm.phoneNumber!,
              bio: doctorForm.bio || '',
              accountStatus: 'pending', 
              totalPatients: 0,
              activePatients: 0,
              recoveredCount: 0,
              doctorLevel: 1,
              photoUrl: null
          },
          durationMonths: 0,
          medType: null
      };

      try {
          await setDoc(doc(db, "users", currentUser.uid), newProfile, { merge: true });
          alert("تم إرسال طلبك بنجاح!");
      } catch (e: any) {
          console.error(e);
          alert("حدث خطأ أثناء الحفظ.");
      }
      setLoading(false);
  };

  const handleAssignDoctor = async (docProfile: UserProfile) => {
      if (!auth || !auth.currentUser || !docProfile.uid) return;
      
      setLoading(true);
      const currentUser = auth.currentUser;
      
      const newProfile: UserProfile = {
          ...userProfile,
          uid: currentUser.uid,
          role: 'patient',
          setupComplete: true,
          patientData: {
              assignedDoctorId: docProfile.uid,
              assignedDoctorName: docProfile.name,
              requestStatus: 'pending',
              isPlanAssigned: false, 
              isRecovered: false
          },
          medType: 'normal', 
          durationMonths: 0
      };

      try {
           await setDoc(doc(db, "users", currentUser.uid), newProfile, { merge: true });
           alert(t('req_sent_msg'));
      } catch(e: any) {
           console.error(e);
           alert("حدث خطأ.");
      }
      setLoading(false);
  };

  const confirmAlgorithmPlan = async () => {
      if (!auth || !auth.currentUser) return;
      setLoading(true);
      const currentUser = auth.currentUser;

      const newProfile: UserProfile = {
          ...userProfile,
          uid: currentUser.uid,
          role: 'normal_user',
          planType: 'algorithm',
          medType: medType,
          medForm: medForm!,
          medUnit: medUnit!,
          setupComplete: true
      };

      startPlan(previewPlan, 1.0, 'algorithm');
      
      try {
          await setDoc(doc(db, "users", currentUser.uid), newProfile, { merge: true });
      } catch(e: any) {
          console.error(e);
          alert("حدث خطأ.");
      }
      setLoading(false);
  };

  useEffect(() => {
      if (step === 'DOCTOR_SELECT') {
          const fetchDocs = async () => {
              try {
                  const q = query(
                      collection(db, "users"), 
                      where("role", "==", "doctor"),
                      where("doctorData.accountStatus", "==", "approved")
                  );
                  const snapshot = await getDocs(q);
                  setAvailableDoctors(snapshot.docs.map(d => ({...d.data(), uid: d.id} as UserProfile)));
              } catch (e) { console.error(e); }
          };
          fetchDocs();
      }
  }, [step]);

  const handleMedTypeSelect = (type: 'narcotic' | 'psychiatric' | 'normal') => {
      if (type === 'narcotic') setBlockedState(true);
      else if (type === 'psychiatric') { setMedType(type); setPsychWarning(true); } 
      else { setMedType(type); setStep('ALGO_SETUP_FORM'); }
  };

  const generatePreview = () => {
      // توليد الخطة
      const plan = generatePlan(totalInventory, currentDoseHabit, new Date().toISOString(), 1.0, [], medForm || 'tablet');
      setPreviewPlan(plan);
      
      // فتح المودال العلمي أولاً قبل عرض المعاينة
      setShowSciModal(true);
  };

  // --- RENDERS ---

  if (step === 'ROLE_SELECT') {
      return (
        <div className="min-h-screen bg-[#020617] p-6 flex flex-col items-center justify-center relative">
             <div className="absolute top-6 right-6 z-50"><LanguageSwitcher /></div>
             {handleLogout && <NavBackBtn />}
             <header className="mb-12 text-center animate-in slide-in-from-top-4">
                <h1 className="text-4xl font-black text-white mb-4">{t('onboard_title')}</h1>
                <p className="text-slate-400 max-w-lg mx-auto">{t('onboard_desc')}</p>
             </header>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                 <button onClick={() => setStep('USER_PATH_SELECT')} className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <UserPlus size={40} className="text-indigo-400 mb-6 group-hover:scale-110 transition-transform"/>
                     <h3 className="text-2xl font-bold text-white mb-2">{t('role_patient')}</h3>
                     <p className="text-slate-500 leading-relaxed">{t('role_patient_desc')}</p>
                 </button>
                 <button onClick={() => setStep('DOCTOR_FORM')} className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <Stethoscope size={40} className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform"/>
                     <h3 className="text-2xl font-bold text-white mb-2">{t('role_doctor')}</h3>
                     <p className="text-slate-500 leading-relaxed">{t('role_doctor_desc')}</p>
                 </button>
             </div>
        </div>
      );
  }

  // ... (DOCTOR_FORM omitted for brevity, logic remains same) ...
  if (step === 'DOCTOR_FORM') {
      // (نفس كود نموذج الطبيب السابق بدون تغيير)
      return (
          <div className="min-h-screen bg-[#020617] p-6 pt-20 flex flex-col items-center">
              <NavBackBtn to="ROLE_SELECT" />
              <div className="max-w-2xl w-full animate-in fade-in slide-in-from-bottom-8">
                  <header className="text-center mb-8">
                      <h1 className="text-3xl font-black text-white mb-2">{t('doc_req_title')}</h1>
                      <p className="text-slate-400">{t('doc_req_desc')}</p>
                  </header>
                  <Card className="bg-slate-900 border-white/5 space-y-6">
                      {/* ... Form Fields ... */}
                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('doc_fullname')}</label><div className="relative"><User className="absolute top-3 right-3 text-slate-500" size={18} /><input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:border-emerald-500 outline-none" placeholder={t('doc_fullname')} value={doctorName} onChange={e => setDoctorName(e.target.value)}/></div></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('doc_specialty')}</label><div className="relative"><Award className="absolute top-3 right-3 text-slate-500" size={18} /><input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:border-emerald-500 outline-none" placeholder={t('doc_specialty')} value={doctorForm.specialty} onChange={e => setDoctorForm({...doctorForm, specialty: e.target.value})}/></div></div><div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('doc_license')}</label><div className="relative"><FileText className="absolute top-3 right-3 text-slate-500" size={18} /><input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:border-emerald-500 outline-none" placeholder={t('doc_license')} value={doctorForm.licenseNumber} onChange={e => setDoctorForm({...doctorForm, licenseNumber: e.target.value})}/></div></div></div>
                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('doc_location')}</label><div className="relative"><MapPin className="absolute top-3 right-3 text-slate-500" size={18} /><input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:border-emerald-500 outline-none" placeholder={t('doc_location')} value={doctorForm.clinicLocation} onChange={e => setDoctorForm({...doctorForm, clinicLocation: e.target.value})}/></div></div>
                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('doc_phone')}</label><div className="relative"><Phone className="absolute top-3 right-3 text-slate-500" size={18} /><input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:border-emerald-500 outline-none" placeholder="+966..." value={doctorForm.phoneNumber} onChange={e => setDoctorForm({...doctorForm, phoneNumber: e.target.value})}/></div></div>
                      <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('doc_bio')}</label><textarea className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none h-24 resize-none" placeholder={t('doc_bio')} value={doctorForm.bio} onChange={e => setDoctorForm({...doctorForm, bio: e.target.value})}/></div>
                      
                      <Button variant="success" className="w-full py-4 text-lg" onClick={handleDoctorSubmit} disabled={!doctorName || !doctorForm.specialty || !doctorForm.licenseNumber || !doctorForm.phoneNumber || loading}>
                          {loading ? 'جاري الإرسال...' : t('doc_submit')}
                      </Button>
                  </Card>
              </div>
          </div>
      );
  }

  if (step === 'USER_PATH_SELECT') { return (<div className="min-h-screen bg-[#020617] p-6 pt-20 flex flex-col items-center"><NavBackBtn to="ROLE_SELECT" /><header className="mb-12 text-center animate-in slide-in-from-top-4"><h1 className="text-4xl font-black text-white mb-4">{t('path_select_title')}</h1><p className="text-slate-400 max-w-lg mx-auto">{t('onboard_desc')}</p></header><div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full"><button onClick={() => {setMedType(null); setStep('ALGO_SETUP_MED');}} className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div><BrainCircuit size={40} className="text-indigo-400 mb-6 group-hover:scale-110 transition-transform"/><h3 className="text-2xl font-bold text-white mb-2">{t('path_algo')}</h3><p className="text-slate-500 leading-relaxed">{t('path_algo_desc')}</p></button><button onClick={() => setStep('DOCTOR_SELECT')} className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-blue-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div><Stethoscope size={40} className="text-blue-400 mb-6 group-hover:scale-110 transition-transform"/><h3 className="text-2xl font-bold text-white mb-2">{t('path_doctor')}</h3><p className="text-slate-500 leading-relaxed">{t('path_doctor_desc')}</p></button></div></div>); }
  
  if (step === 'DOCTOR_SELECT') { 
      const filteredDocs = availableDoctors.filter(d => d.name.toLowerCase().includes(searchDoctor.toLowerCase())); 
      return (
        <div className="min-h-screen bg-[#020617] p-6 pt-20 flex flex-col items-center">
            <NavBackBtn to="USER_PATH_SELECT" />
            <div className="max-w-4xl w-full animate-in fade-in">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-white mb-2">{t('doc_select_title')}</h1>
                    <p className="text-slate-400">{t('path_doctor_desc')}</p>
                </header>
                <div className="relative mb-6"><Search className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500" size={18}/><input className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-12 text-white outline-none focus:border-blue-500" placeholder={t('doc_search_placeholder')} value={searchDoctor} onChange={e => setSearchDoctor(e.target.value)}/></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDocs.length === 0 ? (<div className="col-span-2 text-center py-20 bg-slate-900 rounded-3xl border border-dashed border-slate-800"><Stethoscope className="mx-auto mb-4 text-slate-700" size={48} /><p className="text-slate-500">{availableDoctors.length === 0 ? 'No approved doctors available yet.' : 'No results found.'}</p></div>) : (
                        filteredDocs.map(doc => (
                            <div key={doc.uid} className="bg-slate-900 border border-white/5 p-6 rounded-2xl hover:border-blue-500/30 transition-all group flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4"><div className="flex items-center gap-4">{doc.doctorData?.photoUrl ? (<img src={doc.doctorData.photoUrl} alt="Dr" className="w-12 h-12 rounded-full object-cover border border-white/10" />) : (<div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 font-bold text-lg">Dr</div>)}<div><h3 className="font-bold text-white text-lg">{doc.name}</h3><Badge color="blue">{doc.doctorData?.specialty}</Badge></div></div></div>
                                <p className="text-slate-400 text-sm mb-6 line-clamp-2 bg-slate-950/50 p-3 rounded-lg border border-white/5 flex-1">{doc.doctorData?.bio || "No bio available."}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4"><MapPin size={14}/> {doc.doctorData?.clinicLocation || "Online"}</div>
                                <Button onClick={() => handleAssignDoctor(doc)} className="w-full" variant="secondary" disabled={loading}>{loading ? 'Sending...' : t('doc_select_btn')}</Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      ); 
  }

  if (step === 'ALGO_SETUP_MED') { if (blockedState) return (<div className="min-h-screen flex flex-col items-center justify-center bg-red-950 p-6 text-center animate-in zoom-in"><div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-6 animate-bounce"><AlertTriangle size={48} className="text-white" /></div><h1 className="text-4xl font-black text-white mb-4">{t('blocked_title')}</h1><p className="text-red-200 text-xl max-w-lg mb-8">{t('med_type_narcotic_desc')}</p><Button onClick={() => setBlockedState(false)} variant="secondary">{t('close')}</Button></div>); if (psychWarning) return (<div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in"><Card className="max-w-md border-amber-500/30 bg-slate-900 shadow-[0_0_50px_rgba(245,158,11,0.2)]"><div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse"><AlertTriangle size={32} className="text-amber-500" /></div><h2 className="text-2xl font-bold text-white text-center mb-4">{t('warning_title')}</h2><p className="text-slate-300 text-center mb-6 leading-relaxed">{t('med_type_psych_desc')}</p><div className="flex gap-4"><Button variant="secondary" onClick={() => setPsychWarning(false)} className="flex-1">{t('close')}</Button><Button variant="primary" onClick={() => { setPsychWarning(false); setStep('ALGO_SETUP_FORM'); }} className="flex-1">OK</Button></div></Card></div>); return (<div className="min-h-screen bg-[#020617] p-6 pt-20"><NavBackBtn to="USER_PATH_SELECT" /><header className="text-center mb-12 animate-in slide-in-from-top-4"><h1 className="text-4xl font-black text-white mb-4">{t('med_type_title')}</h1></header><div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">{[{ type: 'narcotic', label: t('med_type_narcotic'), icon: AlertTriangle, color: 'rose', desc: t('med_type_narcotic_desc') }, { type: 'psychiatric', label: t('med_type_psych'), icon: BrainCircuit, color: 'amber', desc: t('med_type_psych_desc') }, { type: 'normal', label: t('med_type_normal'), icon: CheckCircle, color: 'emerald', desc: t('med_type_normal_desc') }].map((item: any) => (<button key={item.type} onClick={() => handleMedTypeSelect(item.type)} className={`group relative p-10 rounded-[2.5rem] border border-white/5 bg-slate-900 hover:bg-slate-900/80 transition-all text-right overflow-hidden hover:border-${item.color}-500/30`}><div className={`w-20 h-20 rounded-3xl bg-${item.color}-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}><item.icon className={`w-10 h-10 text-${item.color}-500`} /></div><h3 className="text-2xl font-bold text-white mb-2">{item.label}</h3><p className="text-sm text-slate-500 font-bold">{item.desc}</p></button>))}</div></div>); }
  
  if (step === 'ALGO_SETUP_FORM') { return (<div className="min-h-screen bg-[#020617] p-6 flex flex-col items-center justify-center pt-20"><NavBackBtn to="ALGO_SETUP_MED" /><div className="max-w-2xl w-full animate-in zoom-in"><h1 className="text-3xl font-black text-white text-center mb-8">{t('med_form_title')}</h1><div className="grid grid-cols-2 gap-4 mb-8"><button onClick={() => setMedForm('tablet')} className={`p-8 rounded-3xl border transition-all ${medForm === 'tablet' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'}`}><Pill className="mx-auto mb-4" size={40} /><span className="block text-center font-bold text-lg">{t('form_tablet')}</span></button><button onClick={() => setMedForm('liquid')} className={`p-8 rounded-3xl border transition-all ${medForm === 'liquid' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'}`}><FlaskConical className="mx-auto mb-4" size={40} /><span className="block text-center font-bold text-lg">{t('form_liquid')}</span></button></div>{medForm && (<div className="animate-in fade-in slide-in-from-bottom-4"><h2 className="text-xl font-bold text-white text-center mb-4">{t('unit_title')}</h2><div className="flex justify-center gap-4 mb-8">{(medForm === 'tablet' ? ['mg', 'g'] : ['ml', 'l', 'mg']).map((u) => (<button key={u} onClick={() => setMedUnit(u as MedUnit)} className={`px-6 py-3 rounded-xl font-bold text-lg border transition-all ${medUnit === u ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-500 hover:text-white'}`}>{u}</button>))}</div></div>)}<Button variant="success" className="w-full py-5 text-xl" disabled={!medForm || !medUnit} onClick={() => setStep('ALGO_SETUP_INV')}>Next <ArrowRight /></Button></div></div>); }
  
  if (step === 'ALGO_SETUP_INV') { const formLabel = medForm === 'liquid' ? 'Bottles' : 'Boxes'; const unitLabel = medUnit || 'mg'; return (<div className="min-h-screen bg-[#020617] p-4 md:p-10 pt-20"><NavBackBtn to="ALGO_SETUP_FORM" /><div className="max-w-4xl mx-auto space-y-8 animate-in fade-in"><Card className="border-white/5 bg-slate-900"><h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-4"><span className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Pill size={24} /></span>{t('inventory_title')}</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-8"><div><label className="block text-xs font-bold text-indigo-400 uppercase mb-4">{t('boxes')} ({formLabel})</label><input type="number" className="w-full bg-slate-950 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none focus:bg-slate-900 transition-all" placeholder="0" value={inventory.boxes || ''} onChange={(e) => setInventory({...inventory, boxes: parseInt(e.target.value) || 0})} /></div><div><label className="block text-xs font-bold text-indigo-400 uppercase mb-4">{t('pills_per_box')}</label><input type="number" className="w-full bg-slate-950 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none focus:bg-slate-900 transition-all" placeholder="0" value={inventory.pillsPerBox || ''} onChange={(e) => setInventory({...inventory, pillsPerBox: parseInt(e.target.value) || 0})} /></div><div><label className="block text-xs font-bold text-indigo-400 uppercase mb-4">{t('loose_pills')}</label><input type="number" className="w-full bg-slate-950 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none focus:bg-slate-900 transition-all" placeholder="0" value={inventory.loosePills || ''} onChange={(e) => setInventory({...inventory, loosePills: parseInt(e.target.value) || 0})} /></div></div><div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center"><span className="text-slate-400 font-bold text-lg">{t('total_balance')}</span><span className="text-5xl font-mono font-black text-emerald-400">{calculateTotalInventory(inventory)} <span className="text-sm text-emerald-600">{unitLabel}</span></span></div></Card><Card className="bg-slate-900 border-white/5"><h2 className="text-2xl font-bold text-white mb-8">{t('current_habit')} ({unitLabel})</h2><div className="flex flex-wrap gap-4">{[0.5, 1, 2, 5, 10, 20, 50, 100].map(dose => (<button key={dose} onClick={() => setCurrentDoseHabit(dose)} className={`h-16 w-24 rounded-2xl font-mono font-bold border transition-all ${currentDoseHabit === dose ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105' : 'bg-slate-950 border-white/10 text-slate-500 hover:bg-slate-800'}`}>{dose}</button>))}<input type="number" placeholder="..." className="h-16 w-32 bg-slate-950 rounded-2xl border border-white/10 px-4 font-mono font-bold text-white focus:border-indigo-500 outline-none transition-all" onChange={(e) => setCurrentDoseHabit(parseFloat(e.target.value))} /></div></Card><Button className="w-full text-2xl py-8 rounded-3xl shadow-2xl shadow-indigo-900/20" variant="success" disabled={currentDoseHabit === 0 || calculateTotalInventory(inventory) === 0} onClick={generatePreview}>{t('analyze_plan')}</Button></div></div>); }
  
  if (step === 'ALGO_PREVIEW') { 
      return (
        <div className="min-h-screen bg-[#020617] p-6 pt-20 flex flex-col items-center">
            {/* Scientific Modal */}
            <ScientificPlanModal 
                isOpen={showSciModal} 
                onClose={() => setShowSciModal(false)} // User can close and see preview
                onConfirm={() => setShowSciModal(false)} 
            />

            <NavBackBtn to="ALGO_SETUP_INV" />
            <div className="max-w-4xl w-full text-center space-y-8 animate-in zoom-in">
                <h1 className="text-4xl font-black text-white">Plan Ready!</h1>
                <p className="text-slate-400">Calculated duration: {previewPlan.length} days.</p>
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-slate-900 text-center">
                        <div className="text-xs text-slate-500 uppercase">{t('duration_days')}</div>
                        <div className="text-3xl font-bold text-white">{previewPlan.length}</div>
                    </Card>
                    <Card className="bg-slate-900 text-center">
                        <div className="text-xs text-slate-500 uppercase">Coverage</div>
                        <div className="text-3xl font-bold text-emerald-400">100%</div>
                    </Card>
                </div>
                <Button onClick={confirmAlgorithmPlan} variant="success" className="w-full py-6 text-xl" disabled={loading}>
                    {loading ? 'Setting up...' : t('confirm_log')}
                </Button>
            </div>
        </div>
      ); 
  }

  return null;
};
```
---

### File: `views\SettingsView.tsx`
```tsx
import React, { useState, useEffect } from 'react';
import { 
    Activity, ShieldCheck, Zap, AlertTriangle, Save, Camera, MapPin, Phone, 
    User, Award, Clock, Package, Pill, RefreshCw
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Inventory } from '../types';

// المكونات
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext'; // استيراد Context للوصول للمخزون

interface SettingsViewProps {
    userProfile: UserProfile;
    resetAllData: () => void;
    updateSpeedSettings: (speed: number) => void;
}

export const SettingsView = ({ userProfile, resetAllData, updateSpeedSettings }: SettingsViewProps) => {
    const { t, language } = useLanguage();
    const { inventory, setInventory } = useData(); // جلب المخزون من البيانات العامة
    const [loading, setLoading] = useState(false);

    // -- Doctor Form State --
    const [formData, setFormData] = useState({
        photoUrl: '',
        bio: '',
        phoneNumber: '',
        clinicLocation: '',
        name: ''
    });

    // -- Inventory Edit State (للمستخدم العادي) --
    const [localInventory, setLocalInventory] = useState<Inventory>({
        boxes: 0, 
        pillsPerBox: 0, 
        loosePills: 0, 
        totalPills: 0
    });

    // Load initial data
    useEffect(() => {
        // Doctor Data
        if (userProfile.role === 'doctor' && userProfile.doctorData) {
            setFormData({
                photoUrl: userProfile.doctorData.photoUrl || '',
                bio: userProfile.doctorData.bio || '',
                phoneNumber: userProfile.doctorData.phoneNumber || '',
                clinicLocation: userProfile.doctorData.clinicLocation || '',
                name: userProfile.name || ''
            });
        }
        
        // User Inventory Data
        if (inventory) {
            setLocalInventory(inventory);
        }
    }, [userProfile, inventory]);

    // -- Save Profile Changes (Doctor) --
    const handleSaveProfile = async () => {
        if (!userProfile.uid) return;
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", userProfile.uid), {
                name: formData.name,
                "doctorData.photoUrl": formData.photoUrl,
                "doctorData.bio": formData.bio,
                "doctorData.phoneNumber": formData.phoneNumber,
                "doctorData.clinicLocation": formData.clinicLocation
            });
            alert("Profile updated successfully!");
        } catch (e) {
            console.error("Error updating profile:", e);
            alert("Failed to update profile.");
        }
        setLoading(false);
    };

    // -- Update Inventory (User) --
    const handleUpdateInventory = () => {
        // حساب المجموع الكلي الجديد
        const newTotal = (localInventory.boxes * localInventory.pillsPerBox) + localInventory.loosePills;
        const updatedInv = { ...localInventory, totalPills: newTotal };
        
        // تحديث الحالة العامة (سيقوم DataContext بحفظها في Firebase تلقائياً)
        setInventory(updatedInv);
        
        alert(language === 'ar' ? 'تم تحديث المخزون وإعادة حساب الرصيد.' : 'Inventory updated successfully.');
    };

    // --- DOCTOR PROFILE VIEW ---
    if (userProfile.role === 'doctor') {
        const level = userProfile.doctorData?.doctorLevel || 1;
        const recovered = userProfile.doctorData?.recoveredCount || 0;
        const active = userProfile.doctorData?.activePatients || 0;

        return (
            <LayoutContainer>
                <PageHeader title={t('profile_title')} subtitle={t('nav_settings')} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: ID Card & Stats */}
                    <div className="space-y-6">
                        <Card className="bg-slate-900 border-white/5 text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-600/20 to-transparent"></div>
                            
                            <div className="relative z-10">
                                <div className="w-32 h-32 mx-auto bg-slate-950 rounded-full border-4 border-slate-800 flex items-center justify-center mb-4 overflow-hidden shadow-2xl relative group-hover:border-indigo-500/50 transition-colors">
                                    {formData.photoUrl ? (
                                        <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-slate-600" />
                                    )}
                                </div>
                                
                                <h2 className="text-2xl font-black text-white mb-1">{formData.name}</h2>
                                <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-4">
                                    {userProfile.doctorData?.specialty}
                                </p>
                                
                                <div className="flex justify-center gap-2 mb-6">
                                    <Badge color="amber">LVL {level}</Badge>
                                    <Badge color={userProfile.doctorData?.accountStatus === 'approved' ? 'green' : 'red'}>
                                        {userProfile.doctorData?.accountStatus.toUpperCase()}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                                    <div>
                                        <span className="block text-2xl font-black text-white">{active}</span>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Active Patients</span>
                                    </div>
                                    <div>
                                        <span className="block text-2xl font-black text-emerald-400">{recovered}</span>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Recovered</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 p-6 rounded-[2rem] flex items-center gap-4">
                            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
                                <Award size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-amber-500 text-lg">{t('rank_label')}</h3>
                                <p className="text-xs text-amber-200/60">Top 10% of Doctors</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Edit Form */}
                    <div className="lg:col-span-2">
                        <Card className="bg-slate-900 border-white/5 h-full">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <User className="text-indigo-400" /> {t('edit_profile')}
                            </h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('doc_fullname')}</label>
                                    <input 
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('photo_url_label')}</label>
                                    <div className="relative">
                                        <Camera className="absolute top-3 right-3 text-slate-600" size={18} />
                                        <input 
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pr-10 text-white focus:border-indigo-500 outline-none"
                                            placeholder="https://example.com/photo.jpg"
                                            value={formData.photoUrl}
                                            onChange={e => setFormData({...formData, photoUrl: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('doc_phone')}</label>
                                        <div className="relative">
                                            <Phone className="absolute top-3 right-3 text-slate-600" size={18} />
                                            <input 
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pr-10 text-white focus:border-indigo-500 outline-none"
                                                value={formData.phoneNumber}
                                                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('doc_location')}</label>
                                        <div className="relative">
                                            <MapPin className="absolute top-3 right-3 text-slate-600" size={18} />
                                            <input 
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pr-10 text-white focus:border-indigo-500 outline-none"
                                                value={formData.clinicLocation}
                                                onChange={e => setFormData({...formData, clinicLocation: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('doc_bio')}</label>
                                    <textarea 
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none h-32 resize-none"
                                        value={formData.bio}
                                        onChange={e => setFormData({...formData, bio: e.target.value})}
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-end">
                                    <Button onClick={handleSaveProfile} variant="primary" disabled={loading}>
                                        <Save size={18} className="mr-2" /> {loading ? 'Saving...' : t('save_changes')}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </LayoutContainer>
        );
    }

    // --- PATIENT / USER SETTINGS VIEW ---
    return (
        <LayoutContainer>
            <PageHeader title={t('settings_title')} subtitle={t('settings_subtitle')} />
            
            {/* Algorithm Pace Settings */}
            <Card className="bg-slate-900 border-white/5 mb-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="text-indigo-400" /> {t('pace_control')}
                </h2>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-2xl">{t('pace_desc')}</p>
                
                {userProfile?.role === 'patient' || userProfile?.planType === 'manual' ? (
                        <div className="p-8 bg-slate-950 rounded-[2rem] border border-dashed border-slate-800 text-slate-500 text-center flex flex-col items-center gap-4">
                            <ShieldCheck size={40} className="text-slate-700" />
                            <p>هذه الخطة مدارة بواسطة {userProfile.role === 'patient' ? 'طبيبك المعالج' : 'النظام اليدوي'}. التعديل التلقائي للسرعة غير متاح.</p>
                        </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button 
                            onClick={() => updateSpeedSettings(0.8)} 
                            className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden ${userProfile.speedModifier && userProfile.speedModifier < 0.9 ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                        >
                            <Clock size={32} className="mx-auto mb-4" />
                            <span className="block font-bold mb-1">{t('pace_slow')}</span>
                            <span className="text-[10px] opacity-70">تمديد المدة للراحة</span>
                        </button>
                        
                        <button 
                            onClick={() => updateSpeedSettings(1.0)} 
                            className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden ${userProfile.speedModifier && userProfile.speedModifier >= 0.9 && userProfile.speedModifier <= 1.1 ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl' : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                        >
                            <ShieldCheck size={32} className="mx-auto mb-4" />
                            <span className="block font-bold mb-1">{t('pace_balanced')}</span>
                            <span className="text-[10px] opacity-70">الوضع القياسي</span>
                        </button>
                        
                        <button 
                            onClick={() => updateSpeedSettings(1.2)} 
                            className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden ${userProfile.speedModifier && userProfile.speedModifier > 1.1 ? 'bg-rose-600 border-rose-500 text-white shadow-xl' : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                        >
                            <Zap size={32} className="mx-auto mb-4" />
                            <span className="block font-bold mb-1">{t('pace_fast')}</span>
                            <span className="text-[10px] opacity-70">تقليص المدة (مكثف)</span>
                        </button>
                    </div>
                )}
            </Card>

            {/* Inventory Management Section (New) */}
            {userProfile?.role === 'normal_user' && (
                <Card className="bg-slate-900 border-white/5 mb-8">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Package className="text-blue-400" /> {t('inventory_title')}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                            <label className="text-xs text-slate-500 font-bold block mb-2">{t('boxes')}</label>
                            <div className="flex items-center gap-3">
                                <Package className="text-slate-600" size={20} />
                                <input 
                                    type="number" 
                                    className="bg-transparent text-white font-bold text-xl w-full outline-none"
                                    value={localInventory.boxes}
                                    onChange={(e) => setLocalInventory({...localInventory, boxes: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                            <label className="text-xs text-slate-500 font-bold block mb-2">{t('pills_per_box')}</label>
                            <div className="flex items-center gap-3">
                                <span className="text-slate-600 font-bold">x</span>
                                <input 
                                    type="number" 
                                    className="bg-transparent text-white font-bold text-xl w-full outline-none"
                                    value={localInventory.pillsPerBox}
                                    onChange={(e) => setLocalInventory({...localInventory, pillsPerBox: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                            <label className="text-xs text-slate-500 font-bold block mb-2">{t('loose_pills')}</label>
                            <div className="flex items-center gap-3">
                                <Pill className="text-slate-600" size={20} />
                                <input 
                                    type="number" 
                                    className="bg-transparent text-white font-bold text-xl w-full outline-none"
                                    value={localInventory.loosePills}
                                    onChange={(e) => setLocalInventory({...localInventory, loosePills: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-between items-center border-t border-white/5 pt-4">
                        <div className="text-sm">
                            <span className="text-slate-500">{t('total_balance')}: </span>
                            <span className="text-white font-bold font-mono text-lg">
                                {(localInventory.boxes * localInventory.pillsPerBox) + localInventory.loosePills} {userProfile.medUnit || 'mg'}
                            </span>
                        </div>
                        <Button onClick={handleUpdateInventory} variant="secondary" className="!py-2 !px-4">
                            <RefreshCw size={16} className="mr-2"/> {t('save_changes')}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Account Actions */}
            <Card className="border-rose-500/10 bg-rose-900/5">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><AlertTriangle className="text-rose-500"/> {t('danger_zone')}</h2>
                <Button variant="danger" onClick={resetAllData}>{t('factory_reset_btn')}</Button>
            </Card>
        </LayoutContainer>
    );
};
```
---

### File: `views\StatsView.tsx`
```tsx
import React, { useMemo } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, ReferenceLine
} from 'recharts';
import { Smile, Activity, Zap, Moon, Shield, Award } from 'lucide-react';

// 👇 تحديث المسارات للمكونات الجديدة
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

import { DailyLog, PlanDay, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface StatsViewProps {
    logs: DailyLog[];
    plan: PlanDay[];
    userProfile?: UserProfile | null;
}

export const StatsView = ({ logs, plan, userProfile }: StatsViewProps) => {
    const { t } = useLanguage();
    const unitLabel = userProfile?.medUnit || 'mg';

    // 1. حساب بيانات الحالة المزاجية (Pie Chart)
    const moodData = useMemo(() => [
        { name: t('excellent'), value: logs.filter(l => l.mood === 'good').length, color: '#10b981' }, // Emerald
        { name: t('stable'), value: logs.filter(l => l.mood === 'normal').length, color: '#f59e0b' }, // Amber
        { name: t('bad'), value: logs.filter(l => l.mood === 'bad').length, color: '#f43f5e' },    // Rose
    ].filter(d => d.value > 0), [logs, t]);

    // 2. حساب بيانات الالتزام (مخطط vs فعلي)
    const adherenceData = useMemo(() => {
        // ندمج السجلات مع التواريخ لرسم الخط
        return logs.map(log => {
            const planned = plan.find(p => p.date === log.date)?.plannedDose || 0;
            return {
                date: log.date.slice(5), // MM-DD
                fullDate: log.date,
                planned: planned,
                actual: log.doseTaken,
                diff: log.doseTaken - planned // الفرق (للتلوين إذا لزم الأمر)
            };
        });
    }, [plan, logs]);

    // 3. منطق الأوسمة (Gamification Logic)
    const badges = [
        {
            id: 'warrior',
            title: t('badge_7days'),
            icon: Shield,
            color: 'indigo',
            achieved: logs.length >= 7
        },
        {
            id: 'halfway',
            title: t('badge_halfway'),
            icon: Zap,
            color: 'amber',
            // تم تحقيق الوسام إذا كانت الجرعة الحالية أقل من نصف جرعة البداية
            achieved: logs.length > 0 && plan.length > 0 && logs[logs.length-1].doseTaken <= (plan[0].plannedDose / 2)
        },
        {
            id: 'sleep',
            title: t('badge_sleep'),
            icon: Moon,
            color: 'blue',
            // معدل النوم آخر 3 أيام جيد (>= 7 ساعات)
            achieved: logs.length >= 3 && (logs.slice(-3).reduce((acc, l) => acc + (l.sleepHours || 0), 0) / 3) >= 7
        },
        {
            id: 'stable',
            title: t('badge_stable'),
            icon: Smile,
            color: 'emerald',
            // آخر 3 أيام مزاج جيد متواصل
            achieved: logs.length >= 3 && logs.slice(-3).every(l => l.mood === 'good')
        }
    ];

    return (
      <LayoutContainer>
          <PageHeader 
            title={t('nav_stats')}
            subtitle="لوحة المعلومات الحيوية وتحليل الأداء."
          />

          {/* Badges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {badges.map((badge) => (
                  <div key={badge.id} className={`relative p-6 rounded-[2rem] border overflow-hidden transition-all duration-500 group ${badge.achieved ? `bg-${badge.color}-500/10 border-${badge.color}-500/30` : 'bg-slate-900/40 border-white/5 opacity-50 grayscale'}`}>
                      {badge.achieved && <div className={`absolute inset-0 bg-gradient-to-br from-${badge.color}-500/0 via-${badge.color}-500/0 to-${badge.color}-500/10 group-hover:to-${badge.color}-500/20`}></div>}
                      
                      <div className="relative z-10 flex flex-col items-center text-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${badge.achieved ? `bg-gradient-to-tr from-${badge.color}-500 to-${badge.color}-400` : 'bg-slate-800'}`}>
                              <badge.icon size={24} />
                          </div>
                          <div>
                              <span className={`text-xs font-bold block ${badge.achieved ? 'text-white' : 'text-slate-500'}`}>{badge.title}</span>
                              {!badge.achieved && <span className="text-[9px] text-slate-600">لم يتم القفل بعد</span>}
                          </div>
                      </div>
                      
                      {badge.achieved && (
                          <div className="absolute top-2 right-2 text-yellow-500 animate-pulse">
                              <Award size={14} />
                          </div>
                      )}
                  </div>
              ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 1. Adherence Chart (Planned vs Actual) */}
              <Card className="min-h-[400px] flex flex-col md:col-span-2 bg-slate-900/50">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                              <Activity className="w-5 h-5"/>
                          </div>
                           الالتزام بالخطة العلاجية
                      </h3>
                      <div className="flex gap-4 text-xs font-bold">
                          <span className="flex items-center gap-2 text-indigo-400"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> المخطط</span>
                          <span className="flex items-center gap-2 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> الفعلي</span>
                      </div>
                  </div>
                  
                  <div className="flex-1 h-[300px]">
                      {adherenceData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={adherenceData.slice(-30)}> {/* Last 30 entries */}
                                  <defs>
                                    <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickMargin={10} />
                                  <YAxis stroke="#475569" fontSize={10} />
                                  <Tooltip 
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                      itemStyle={{color: '#fff'}}
                                      formatter={(val: number) => [`${val} ${unitLabel}`, '']}
                                      labelFormatter={(label) => `التاريخ: ${label}`}
                                  />
                                  <Area type="monotone" dataKey="planned" stroke="#6366f1" fillOpacity={1} fill="url(#colorPlanned)" name="المخطط" strokeWidth={2} />
                                  <Area type="monotone" dataKey="actual" stroke="#10b981" fillOpacity={1} fill="url(#colorActual)" name="الفعلي" strokeWidth={2} connectNulls />
                              </AreaChart>
                          </ResponsiveContainer>
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-500">
                              <Activity size={48} className="opacity-20 mb-4"/>
                              <p>لا توجد بيانات كافية للرسم البياني بعد.</p>
                          </div>
                      )}
                  </div>
              </Card>

              {/* 2. Mood Distribution */}
              <Card className="min-h-[350px] flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Smile className="w-5 h-5"/>
                      </div>
                      الحالة المزاجية
                  </h3>
                  <div className="flex-1 relative">
                       {moodData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={moodData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={100}
                                      paddingAngle={8}
                                      dataKey="value"
                                      stroke="none"
                                      cornerRadius={8}
                                  >
                                      {moodData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                  </Pie>
                                  <Tooltip 
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                      itemStyle={{fontWeight: 'bold', color: '#fff'}}
                                  />
                              </PieChart>
                          </ResponsiveContainer>
                       ) : (
                           <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-medium">
                               سجل مزاجك اليومي لتظهر البيانات
                           </div>
                       )}
                  </div>
                  <div className="flex justify-center gap-4 mt-2 flex-wrap">
                      {moodData.map((d, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5">
                              <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                              {d.name} ({d.value})
                          </div>
                      ))}
                  </div>
              </Card>

              {/* 3. Sleep Quality Chart */}
              <Card className="min-h-[350px] flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Moon className="w-5 h-5"/>
                      </div>
                       جودة النوم (آخر 7 أيام)
                  </h3>
                  <div className="flex-1">
                      {logs.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={logs.slice(-7)}> 
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                  <XAxis dataKey="date" tickFormatter={(str) => str.slice(8)} stroke="#475569" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} domain={[0, 12]} />
                                  <Tooltip 
                                      cursor={{fill: '#1e293b', opacity: 0.5}}
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                      itemStyle={{color: '#fff'}}
                                      formatter={(val) => [`${val} ساعة`, 'النوم']}
                                  />
                                  <ReferenceLine y={7} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'الهدف (7h)', fill: '#10b981', fontSize: 10 }} />
                                  <Bar dataKey="sleepHours" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={20}>
                                    {logs.slice(-7).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.sleepHours && entry.sleepHours >= 7 ? '#10b981' : '#6366f1'} />
                                    ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      ) : (
                          <div className="h-full flex items-center justify-center text-slate-500">
                              <p>لا توجد سجلات للنوم.</p>
                          </div>
                      )}
                  </div>
              </Card>
          </div>
      </LayoutContainer>
    );
};
```
---

### File: `views\SupportView.tsx`
```tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Ticket, TicketMessage } from '../types';
import { LifeBuoy, Plus, MessageSquare, Send, CheckCircle, Lock, X, Pill, FlaskConical, User, Stethoscope } from 'lucide-react';

// 👇 تحديث المسارات للمكونات الجديدة
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

import { useLanguage } from '../contexts/LanguageContext';

interface SupportViewProps {
    user: UserProfile;
}

export const SupportView = ({ user }: SupportViewProps) => {
    const { t } = useLanguage();
    
    // -- State --
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Forms
    const [newSubject, setNewSubject] = useState("");
    const [newMessage, setNewMessage] = useState("");
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // -- 1. Fetch User Tickets --
    useEffect(() => {
        if (!user.uid) return;
        
        const q = query(
            collection(db, "tickets"), 
            where("userId", "==", user.uid), 
            orderBy("lastUpdate", "desc")
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTickets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Ticket));
            setTickets(fetchedTickets);
            
            if (activeTicket) {
                const updatedActive = fetchedTickets.find(t => t.id === activeTicket.id);
                if (updatedActive) setActiveTicket(updatedActive);
            }
        });
        
        return () => unsubscribe();
    }, [user.uid, activeTicket?.id]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (activeTicket) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [activeTicket?.messages, activeTicket]);

    // -- 2. Actions --
    
    const createTicket = async () => {
        if (!user.uid) return;
        if (!newSubject.trim() || !newMessage.trim()) return;
        
        const initialMsg: TicketMessage = {
            senderId: user.uid,
            senderName: user.name,
            text: newMessage,
            timestamp: Date.now(),
            isAdmin: false
        };

        try {
            await addDoc(collection(db, "tickets"), {
                userId: user.uid,
                userEmail: user.email,
                subject: newSubject,
                status: 'open',
                createdAt: Date.now(),
                lastUpdate: Date.now(),
                messages: [initialMsg]
            });
            setShowCreateModal(false);
            setNewSubject("");
            setNewMessage("");
        } catch (e) {
            console.error("Error creating ticket:", e);
            alert("Failed to create ticket.");
        }
    };

    const sendReply = async () => {
        if (!user.uid) return;
        if (!newMessage.trim() || !activeTicket || !activeTicket.id) return;

        const newMsg: TicketMessage = {
            senderId: user.uid,
            senderName: user.name,
            text: newMessage,
            timestamp: Date.now(),
            isAdmin: false
        };

        try {
            const ticketRef = doc(db, "tickets", activeTicket.id);
            const currentMessages = activeTicket.messages || [];
            
            await updateDoc(ticketRef, {
                messages: [...currentMessages, newMsg],
                lastUpdate: Date.now(),
                status: 'open' 
            });
            setNewMessage("");
        } catch (e) {
            console.error("Error sending reply:", e);
        }
    };

    // Helper for translation keys
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return t('status_open') || 'Open';
            case 'pending': return t('status_pending') || 'Pending';
            case 'resolved': return t('status_resolved') || 'Resolved';
            case 'closed': return t('status_closed') || 'Closed';
            default: return status;
        }
    };

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('nav_support')} 
                subtitle={t('support_desc') || "Contact the support team directly."}
                action={
                    <Button onClick={() => setShowCreateModal(true)} variant="primary">
                        <Plus size={18} /> {t('new_ticket') || "New Ticket"}
                    </Button>
                }
            />

            {/* Context Banner */}
            <div className="mb-6 bg-slate-900/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400">
                        {user.role === 'doctor' ? <Stethoscope size={20}/> : 
                         user.medForm === 'liquid' ? <FlaskConical size={20} /> : 
                         user.medForm === 'tablet' ? <Pill size={20} /> : <User size={20}/>}
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">{t('current_account') || "Current Account"}</p>
                        <p className="text-white font-bold text-sm flex items-center gap-2">
                            {user.name} 
                            <Badge color="blue" className="!py-0 !px-1.5 !text-[9px]">{user.role.toUpperCase()}</Badge>
                        </p>
                    </div>
                </div>
                {user.role === 'normal_user' && user.planType === 'algorithm' && (
                    <Badge color="indigo">Smart Algorithm</Badge>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
                {/* LIST COLUMN */}
                <Card className={`md:col-span-4 flex flex-col overflow-hidden bg-slate-900 border-white/5 !p-0 ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/30">
                        <h3 className="font-bold text-white">{t('my_tickets') || "My Tickets"}</h3>
                        <Badge color="indigo">{tickets.length}</Badge>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar">
                        {tickets.length === 0 && (
                            <div className="text-center py-10 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl m-2">
                                <LifeBuoy className="mx-auto mb-2 opacity-50" size={24}/>
                                {t('no_tickets') || "No previous tickets."}
                            </div>
                        )}
                        {tickets.map(ticket => (
                            <div 
                                key={ticket.id}
                                onClick={() => setActiveTicket(ticket)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                    activeTicket?.id === ticket.id 
                                    ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                                    : 'bg-slate-950/50 border-transparent hover:bg-slate-800 hover:border-white/5'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={`font-bold text-sm truncate max-w-[70%] ${activeTicket?.id === ticket.id ? 'text-indigo-300' : 'text-slate-300'}`}>
                                        {ticket.subject}
                                    </h4>
                                    <Badge color={ticket.status === 'resolved' ? 'green' : ticket.status === 'open' ? 'rose' : 'amber'} className="!text-[9px] !px-1.5">
                                        {getStatusLabel(ticket.status)}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-end text-[10px] text-slate-500">
                                    <span>{new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                                    <MessageSquare size={12} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* CHAT COLUMN */}
                <Card className={`md:col-span-8 flex flex-col overflow-hidden bg-slate-900 border-white/5 relative !p-0 ${!activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    {!activeTicket ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 opacity-50">
                                <LifeBuoy size={40} />
                            </div>
                            <p>{t('select_ticket_prompt') || "Select a ticket to view details"}</p>
                        </div>
                    ) : (
                        <>
                            {/* Ticket Header */}
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                                <div>
                                    <button type="button" onClick={() => setActiveTicket(null)} className="md:hidden text-slate-400 mr-2 mb-2 flex items-center gap-1 text-xs">
                                        <X size={14}/> {t('close')}
                                    </button>
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Lock size={14} className="text-emerald-500"/> {activeTicket.subject}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-mono mt-1">Ref: {activeTicket.id}</p>
                                </div>
                                {activeTicket.status === 'resolved' && <Badge color="green"><CheckCircle size={12} /> {t('status_resolved') || "Resolved"}</Badge>}
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
                                {activeTicket.messages?.map((msg, idx) => {
                                    const isMe = !msg.isAdmin; 
                                    return (
                                        <div key={idx} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                                            <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                                                isMe 
                                                ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5' 
                                                : 'bg-indigo-600 text-white rounded-tr-none shadow-lg'
                                            }`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-slate-600 mt-1 px-1 flex items-center gap-1">
                                                {isMe ? (t('me') || "Me") : (t('support_team') || "Support")} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Reply Input */}
                            <div className="p-4 border-t border-white/5 bg-slate-950/30">
                                {activeTicket.status === 'resolved' ? (
                                    <div className="text-center text-xs text-emerald-500 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                        {t('ticket_closed_msg') || "This ticket is closed."}
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input 
                                            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                                            placeholder={t('write_reply') || "Write your reply..."}
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && sendReply()}
                                        />
                                        <Button onClick={sendReply} variant="primary" disabled={!newMessage.trim()} className="!rounded-xl !px-4">
                                            <Send size={18} />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {/* Create Ticket Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <Card className="w-full max-w-md bg-slate-900 border-white/10 relative shadow-2xl">
                        <button type="button" onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all"><X size={20}/></button>
                        
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <LifeBuoy className="text-indigo-500"/> {t('new_ticket_title') || "New Support Request"}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('ticket_subject') || "Subject"}</label>
                                <input 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all" 
                                    value={newSubject} 
                                    onChange={e => setNewSubject(e.target.value)} 
                                    placeholder="..." 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('ticket_details') || "Details"}</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none h-32 resize-none transition-all" 
                                    value={newMessage} 
                                    onChange={e => setNewMessage(e.target.value)} 
                                    placeholder="..." 
                                />
                            </div>
                            <Button onClick={createTicket} variant="primary" className="w-full py-3" disabled={!newSubject || !newMessage}>
                                {t('send_request') || "Submit"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `App.tsx`
```tsx
import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, ArrowLeft, Loader2, XCircle, Clock, AlertTriangle } from 'lucide-react';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Logic & Types
import { calculateTotalInventory, adjustPlan } from './services/taperingEngine';
import { AppView, Inventory, DailyLog, PlanDay, UserProfile } from './types';

// Components & Views
import { Button } from './components/ui/Button';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav'; 
import { LoginView } from './views/LoginView';
import { OnboardingView } from './views/OnboardingView';
import { DashboardView } from './views/DashboardView';
import { CalendarView } from './views/CalendarView';
import { StatsView } from './views/StatsView';
import { AdminView } from './views/AdminView';
import { CommunityView } from './views/CommunityView';
import { SupportView } from './views/SupportView';
import { ArticlesView } from './views/ArticlesView';
import { DoctorDashboardView } from './views/DoctorDashboardView'; 
import { DoctorPatientsView } from './views/DoctorPatientsView';
import { SettingsView } from './views/SettingsView';

// Helper to add days safely
const addDaysSafe = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
};

function AppContent() {
  // -- Context Hooks --
  const { 
    currentUser, loading: authLoading, 
    loginWithEmail, loginWithGoogle, logout, error: loginError, 
    enableDemoMode, clearError, isDemoMode 
  } = useAuth();

  const { 
    userProfile, setUserProfile, 
    inventory, setInventory, 
    plan, setPlan, 
    logs, setLogs, 
    speedModifier, setSpeedModifier,
    dataLoading, resetAllData 
  } = useData();

  const { dir, t } = useLanguage();

  // -- Local UI State --
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [viewHistory, setViewHistory] = useState<AppView[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Onboarding specific state
  const [currentDoseHabit, setCurrentDoseHabit] = useState<number>(0);

  // Dashboard Interaction
  const [selectedDose, setSelectedDose] = useState<number | null>(null);
  const [selectedMood, setSelectedMood] = useState<'bad' | 'normal' | 'good' | null>(null);

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // -- Routing Logic --
  useEffect(() => {
    if (userProfile) {
        // 1. منطق الأدمن
        if (userProfile.role === 'admin' && currentView === AppView.DASHBOARD) {
            setCurrentView(AppView.ADMIN);
        } 
        
        // 2. منطق الطبيب
        else if (userProfile.role === 'doctor' && userProfile.doctorData?.accountStatus === 'approved') {
            const allowedDoctorViews = [
                AppView.DOCTOR_DASHBOARD, AppView.DOCTOR_PATIENTS, 
                AppView.COMMUNITY, AppView.ARTICLES, AppView.SUPPORT, AppView.SETTINGS
            ];
            if (!allowedDoctorViews.includes(currentView)) {
                 setCurrentView(AppView.DOCTOR_DASHBOARD);
            }
        }
        
        // 3. إعادة تعيين حالة إعادة الإرسال
        if (userProfile.role === 'doctor' && userProfile.doctorData?.accountStatus === 'pending') {
            setIsResubmitting(false);
        }
        if (userProfile.role === 'patient' && userProfile.patientData?.requestStatus === 'pending') {
            setIsResubmitting(false);
        }
    }
  }, [userProfile, currentView]);

  // -- Navigation Handlers --
  const navigateTo = (view: AppView) => {
    if (view === currentView) return;
    setViewHistory(prev => [...prev, currentView]);
    setCurrentView(view);
  };

  const goBack = () => {
    if (viewHistory.length > 0) {
      const prevView = viewHistory[viewHistory.length - 1];
      setViewHistory(prev => prev.slice(0, -1));
      setCurrentView(prevView);
    } else {
      const defaultView = userProfile?.role === 'doctor' ? AppView.DOCTOR_DASHBOARD : 
                          userProfile?.role === 'admin' ? AppView.ADMIN : AppView.DASHBOARD;
      setCurrentView(defaultView);
    }
  };

  // -- Logic Handlers --

  const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();
      await loginWithEmail(email, password);
  };

  const startPlan = (customPlan: PlanDay[], speed: number = 1.0, planType: 'algorithm' | 'manual' = 'algorithm') => {
    setSpeedModifier(speed); 
    setPlan(customPlan);
    
    if (userProfile) {
        const baseProfile = userProfile as UserProfile;
        const newProfile: UserProfile = {
            ...baseProfile,
            setupComplete: true,
            planType: planType,
            patientData: baseProfile.role === 'patient' && baseProfile.patientData ? {
                ...baseProfile.patientData,
                isPlanAssigned: true 
            } : undefined
        };
        setUserProfile(newProfile);
    }
  };

  const submitDailyLog = (sleepHours: number, symptoms: string[]) => {
    if (selectedDose === null || selectedMood === null) return;

    const currentTotal = calculateTotalInventory(inventory);
    const newTotal = Math.max(0, Math.round((currentTotal - selectedDose) * 100) / 100);
    
    const newInventory: Inventory = { ...inventory, totalPills: newTotal };
    if (inventory.pillsPerBox > 0) {
        newInventory.boxes = Math.floor(newTotal / inventory.pillsPerBox);
        newInventory.loosePills = Math.round((newTotal % inventory.pillsPerBox) * 100) / 100;
    } else {
        newInventory.loosePills = newTotal;
    }
    setInventory(newInventory);

    const today = new Date().toISOString().split('T')[0];
    const newLog: DailyLog = { 
        date: today, doseTaken: selectedDose, mood: selectedMood, sleepHours, symptoms 
    };
    const newLogs = [...logs.filter(l => l.date !== today), newLog];
    setLogs(newLogs);

    if (userProfile?.planType === 'algorithm') {
        const totalUsed = newLogs.reduce((acc, l) => acc + l.doseTaken, 0);
        const theoreticalInitial = newTotal + totalUsed;
        const newPlan = adjustPlan(plan, newLogs, theoreticalInitial, speedModifier, userProfile.medForm || 'tablet');
        setPlan(newPlan);
    }
    
    setSelectedDose(null);
    setSelectedMood(null);
    showToast(t('toast_log_success'));
  };

  const handleFreezePlan = () => {
      const today = new Date().toISOString().split('T')[0];
      const todayPlanItem = plan.find(p => p.date === today);
      if (!todayPlanItem) return;

      const freezeDose = todayPlanItem.plannedDose;
      const history = plan.filter(p => p.date <= today);
      const future = plan.filter(p => p.date > today);
      
      const newPlanDays: PlanDay[] = [];
      let currentDateStr = today;
      
      for (let i = 0; i < 3; i++) {
          currentDateStr = addDaysSafe(currentDateStr, 1);
          newPlanDays.push({
              date: currentDateStr,
              plannedDose: freezeDose,
              isPast: false
          });
      }
      
      future.forEach(day => {
          currentDateStr = addDaysSafe(currentDateStr, 1);
          newPlanDays.push({ ...day, date: currentDateStr });
      });
      
      setPlan([...history, ...newPlanDays]);
      showToast(t('toast_freeze_success'));
  };

  const updateSpeedSettings = (newSpeed: number) => {
      setSpeedModifier(newSpeed);
      if (userProfile?.planType === 'algorithm') {
          const currentInv = calculateTotalInventory(inventory);
          const totalUsed = logs.reduce((a, b) => a + b.doseTaken, 0);
          const theoreticalInitial = currentInv + totalUsed;
          
          const newPlan = adjustPlan(plan, logs, theoreticalInitial, newSpeed, userProfile.medForm || 'tablet');
          setPlan(newPlan);
          showToast(t('toast_speed_updated'));
      }
  };

  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); }

  const todayDate = new Date().toISOString().split('T')[0];
  const todayPlan = plan.find(p => p.date === todayDate);
  const todayLog = logs.find(l => l.date === todayDate);
  const daysCompleted = logs.length;
  const totalDays = plan.length;
  const progressPercentage = totalDays > 0 ? (daysCompleted / totalDays) * 100 : 0;
  
  const recentLogs = logs.slice(-3);
  const badMoodCount = recentLogs.filter(l => l.mood === 'bad').length;
  const poorSleep = recentLogs.length >= 3 && (recentLogs.reduce((acc, l) => acc + (l.sleepHours || 7), 0) / 3) < 5;
  const showDoctorWarning = badMoodCount >= 3 || poorSleep;

  if (authLoading || dataLoading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-indigo-400 gap-4" dir={dir}>
            <Loader2 size={48} className="animate-spin" />
            <span className="font-bold tracking-widest animate-pulse">LOADING SYSTEM...</span>
        </div>
      );
  }

  // 1. LOGIN SCREEN
  if (!currentUser && !isDemoMode) {
    return (
        <LoginView 
            handleLogin={handleLoginSubmit} 
            handleGoogleLogin={loginWithGoogle} 
            email={email} setEmail={setEmail} 
            password={password} setPassword={setPassword} 
            loginError={loginError || ''} 
            setDemoCreds={enableDemoMode} 
        />
    );
  }

  // 2. ONBOARDING & RESUBMISSION
  if ((userProfile && !userProfile.setupComplete && !userProfile.role?.includes('admin')) || isResubmitting) {
    return (
        <OnboardingView 
            userProfile={userProfile!} 
            setUserProfile={setUserProfile} 
            inventory={inventory} 
            setInventory={setInventory} 
            currentDoseHabit={currentDoseHabit} 
            setCurrentDoseHabit={setCurrentDoseHabit} 
            startPlan={startPlan} 
            email={currentUser?.email || email} 
            handleLogout={logout} 
        />
    );
  }

  // 3. MAIN APP LAYOUT
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200" dir={dir}>
      {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
              <Check size={18} /> {toastMessage}
          </div>
      )}

      {/* REJECTION SCREEN - DOCTOR */}
      {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'rejected' && (
          <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 animate-in zoom-in">
              <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-rose-500/20">
                  <XCircle size={48} className="text-rose-500 animate-pulse" />
              </div>
              <h1 className="text-4xl font-black text-white mb-4">نأسف، تم رفض طلبك</h1>
              <div className="bg-rose-950/30 border border-rose-500/30 p-6 rounded-2xl max-w-lg w-full mb-8">
                  <h3 className="text-rose-400 font-bold mb-2 flex items-center justify-center gap-2">
                      <AlertTriangle size={18}/> سبب الرفض من الإدارة
                  </h3>
                  <p className="text-rose-200 leading-relaxed">
                      {userProfile.doctorData.rejectionReason || "لم يتم تحديد سبب. يرجى مراجعة البيانات."}
                  </p>
              </div>
              <div className="flex gap-4">
                  <Button variant="secondary" onClick={() => logout()}>تسجيل خروج</Button>
                  <Button variant="primary" onClick={() => setIsResubmitting(true)}>تعديل الطلب وإعادة الإرسال</Button>
              </div>
          </div>
      )}

      {/* REJECTION SCREEN - PATIENT */}
      {userProfile?.role === 'patient' && userProfile.patientData?.requestStatus === 'rejected' && (
          <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 animate-in zoom-in">
              <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-rose-500/20">
                  <XCircle size={48} className="text-rose-500 animate-pulse" />
              </div>
              <h1 className="text-4xl font-black text-white mb-4">عذراً، تم رفض الطلب</h1>
              <p className="text-slate-400 max-w-lg leading-relaxed mb-6">
                  لم يتم قبول طلب انضمامك من قبل الطبيب. يمكنك المحاولة مع طبيب آخر.
              </p>
              <div className="flex gap-4">
                  <Button variant="secondary" onClick={() => logout()}>تسجيل خروج</Button>
                  <Button variant="primary" onClick={() => setIsResubmitting(true)}>اختيار طبيب آخر</Button>
              </div>
          </div>
      )}

      {/* NORMAL APP FLOW */}
      {!(userProfile?.doctorData?.accountStatus === 'rejected' || userProfile?.patientData?.requestStatus === 'rejected') && (
          <>
              {/* Mobile Back Nav - Moved Top */}
              {(viewHistory.length > 0 || currentView !== AppView.DASHBOARD) && (
                  <button onClick={goBack} className="fixed top-6 left-4 z-[60] p-3 rounded-full bg-slate-800/80 backdrop-blur-md text-white shadow-lg border border-white/10 hover:bg-indigo-600 transition-colors md:hidden">
                      {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                  </button>
              )}

              <Sidebar currentView={currentView} setCurrentView={navigateTo} handleLogout={logout} userProfile={userProfile} />
              <MobileNav currentView={currentView} setCurrentView={navigateTo} userProfile={userProfile} />
              
              <div className="md:mr-80 p-4 md:p-12 pb-32 md:pb-12 transition-all duration-500">
                
                {/* PENDING SCREENS */}
                {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'pending' ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                        <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                            <Clock size={48} className="text-amber-500 animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">الحساب قيد المراجعة</h1>
                        <p className="text-slate-400 max-w-lg leading-relaxed mb-6">
                            طلبك قيد المراجعة من الإدارة. سيتم توجيهك تلقائياً فور الاعتماد.
                        </p>
                        <Button variant="secondary" onClick={() => logout()} className="!px-6">تسجيل خروج</Button>
                    </div>
                ) : userProfile?.role === 'patient' && userProfile.patientData?.requestStatus === 'pending' ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                            <Clock size={48} className="text-blue-500 animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">{t('req_sent_msg')}</h1>
                        <p className="text-slate-400 max-w-lg leading-relaxed mb-6">
                            طلبك للانضمام قيد المراجعة من قبل الطبيب.
                        </p>
                        <Button variant="secondary" onClick={() => logout()} className="!px-6">تسجيل خروج</Button>
                    </div>
                ) : userProfile?.role === 'patient' && !userProfile.patientData?.isPlanAssigned ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                            <Loader2 size={48} className="text-indigo-500 animate-spin" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">تم القبول، بانتظار الخطة</h1>
                        <p className="text-slate-400 max-w-lg leading-relaxed mb-6">
                            وافق الطبيب على انضمامك. يرجى الانتظار حتى يقوم بوضع الجدول العلاجي.
                        </p>
                        <Button onClick={() => setCurrentView(AppView.COMMUNITY)} variant="secondary">
                            دخول المجتمع مؤقتاً
                        </Button>
                    </div>
                ) : (
                    /* ACTIVE VIEWS - Main Routing */
                    <>
                        {/* 1. Normal Users & Active Patients */}
                        {userProfile && (userProfile.role === 'normal_user' || (userProfile.role === 'patient' && userProfile.patientData?.isPlanAssigned)) && (
                            <>
                                {currentView === AppView.DASHBOARD && (
                                    <DashboardView 
                                        userProfile={userProfile}
                                        plan={plan} logs={logs} todayPlan={todayPlan} todayLog={todayLog}
                                        progressPercentage={progressPercentage} totalDays={totalDays} daysCompleted={daysCompleted}
                                        showDoctorWarning={showDoctorWarning}
                                        selectedDose={selectedDose} setSelectedDose={setSelectedDose}
                                        selectedMood={selectedMood} setSelectedMood={setSelectedMood}
                                        submitDailyLog={submitDailyLog} handleFreezePlan={handleFreezePlan}
                                    />
                                )}
                                {currentView === AppView.CALENDAR && <CalendarView plan={plan} logs={logs} todayDate={todayDate} userProfile={userProfile} />}
                                {currentView === AppView.STATS && <StatsView logs={logs} plan={plan} userProfile={userProfile} />} 
                            </>
                        )}

                        {/* 2. Doctors */}
                        {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'approved' && (
                            <>
                                {currentView === AppView.DOCTOR_DASHBOARD && <DoctorDashboardView />}
                                {currentView === AppView.DOCTOR_PATIENTS && <DoctorPatientsView />}
                            </>
                        )}

                        {/* 3. Shared Views (Accessible by Admin and others) */}
                        {currentView === AppView.COMMUNITY && (
                            <CommunityView currentUser={{...userProfile!, uid: currentUser?.uid}} />
                        )}

                        {currentView === AppView.SUPPORT && (
                            <SupportView user={{...userProfile!, uid: currentUser?.uid || ''}} />
                        )}

                        {currentView === AppView.ARTICLES && (
                            <ArticlesView userProfile={userProfile ? { ...userProfile, uid: currentUser?.uid } : null} />
                        )}
                        
                        {/* 4. Admin Only */}
                        {currentView === AppView.ADMIN && userProfile?.role === 'admin' && (
                            <AdminView />
                        )}
                        
                        {/* 5. Settings */}
                        {currentView === AppView.SETTINGS && userProfile && (
                            <SettingsView 
                                userProfile={userProfile} 
                                resetAllData={resetAllData} 
                                updateSpeedSettings={updateSpeedSettings} 
                            />
                        )}
                    </>
                )}
              </div>
          </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
```
---

### File: `firestore.rules`
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // --- Helper Functions ---
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // Admin Check
    function isAdmin() {
      return isSignedIn() && (
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) && getUserData().role == 'admin') ||
        request.auth.token.email == 'admin@islamguide.com' ||
        request.auth.token.email == 'islamaz@bomba.com'
      );
    }
    
    function isApprovedDoctor() {
      let user = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return isSignedIn() && user.role == 'doctor' && user.doctorData.accountStatus == 'approved';
    }

    // --- 1. Users Collection ---
    match /users/{userId} {
      // Admin: Full Access
      allow read, write, delete: if isAdmin();

      // Read Permissions
      allow read: if isSignedIn() && (
        // 1. User reads own profile
        isOwner(userId) || 
        
        // 2. Anyone can read APPROVED Doctors (Fix for "No doctors available")
        (resource.data.role == 'doctor' && resource.data.doctorData.accountStatus == 'approved') ||
        
        // 3. Approved Doctors can read Normal Users and Patients (Fix for "Doctor sees no users")
        (isApprovedDoctor() && (resource.data.role == 'normal_user' || resource.data.role == 'patient')) ||
        
        // 4. Doctor sees their specific assigned patients
        (isApprovedDoctor() && resource.data.patientData.assignedDoctorId == request.auth.uid)
      );

      // Create: Anyone
      allow create: if isSignedIn() && isOwner(userId);

      // Update
      allow update: if isSignedIn() && (
        // User updates self (with restrictions)
        (isOwner(userId) && 
         request.resource.data.role != 'admin' &&
         (resource.data.isBanned == false || request.resource.data.isBanned == resource.data.isBanned)
        ) ||
        // Doctor updates their patients
        (isApprovedDoctor() && resource.data.patientData.assignedDoctorId == request.auth.uid) ||
        // Doctor assigns themselves to a user
        (isApprovedDoctor() && 
         resource.data.role != 'admin' && 
         resource.data.role != 'doctor' &&
         (resource.data.patientData == null || resource.data.patientData.assignedDoctorId == null)
        )
      );
    }

    // --- 2. Chat Rooms ---
    match /rooms/{roomId} {
      allow read, write, delete: if isAdmin();

      allow read: if isSignedIn() && (
        resource.data.isDoctorRoom == false ||
        (resource.data.isDoctorRoom == true && resource.data.doctorId == request.auth.uid) ||
        (resource.data.isDoctorRoom == true && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.patientData.assignedDoctorId == resource.data.doctorId)
      );

      allow create: if isApprovedDoctor();
      allow update, delete: if isSignedIn() && resource.data.createdBy == request.auth.uid;
      
      match /messages/{msgId} {
        allow read, write: if isSignedIn();
      }
    }

    // --- 3. Articles (CMS) ---
    match /articles/{articleId} {
      allow read, write, delete: if isAdmin();
      allow read: if isSignedIn() && resource.data.isPublished == true;
      allow create: if isApprovedDoctor();
      allow update, delete: if isApprovedDoctor() && resource.data.authorId == request.auth.uid;
    }

    // --- 4. Support Tickets ---
    match /tickets/{ticketId} {
      allow read, write, delete: if isAdmin();
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn();
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
    }

    // --- 5. Audit Logs ---
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      allow create: if isSignedIn(); 
    }
  }
}
```
---

### File: `index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-[#020617] text-slate-200 antialiased;
    /* تحسين عرض الخطوط العربية */
    font-family: 'Tajawal', 'Inter', sans-serif;
    font-feature-settings: "ss01", "ss02", "cv01", "cv02";
    -webkit-font-smoothing: antialiased;
  }
}

@layer utilities {
  /* إخفاء شريط التمرير مع الحفاظ على الوظيفة (للموبايل) */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }

  /* شريط تمرير مخصص ونحيف للقوائم الجانبية والدردشة */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-slate-900/30 rounded-full;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-700/50 rounded-full hover:bg-slate-600 transition-colors border-2 border-transparent bg-clip-content;
  }
}

/* === مكتبة الرسوم المتحركة (Custom Animations) === */
/* هذه التعريفات تحاكي مكتبة tailwindcss-animate لضمان عمل التأثيرات */

@keyframes enter {
  from {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), 1) rotate(var(--tw-enter-rotate, 0));
  }
}

@keyframes exit {
  to {
    opacity: var(--tw-exit-opacity, 1);
    transform: translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), 1) rotate(var(--tw-exit-rotate, 0));
  }
}

@keyframes ping-slow {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-in {
  animation-name: enter;
  animation-duration: 300ms; /* Default duration */
  --tw-enter-opacity: initial;
  --tw-enter-scale: initial;
  --tw-enter-rotate: initial;
  --tw-enter-translate-x: initial;
  --tw-enter-translate-y: initial;
}

.fade-in {
  --tw-enter-opacity: 0;
}

.zoom-in {
  --tw-enter-scale: 0.95;
}

/* اتجاهات الحركة */
.slide-in-from-top-2 {
  --tw-enter-translate-y: -0.5rem;
}
.slide-in-from-top-4 {
  --tw-enter-translate-y: -1rem;
}

.slide-in-from-bottom-2 {
  --tw-enter-translate-y: 0.5rem;
}
.slide-in-from-bottom-4 {
  --tw-enter-translate-y: 1rem;
}
.slide-in-from-bottom-8 {
  --tw-enter-translate-y: 2rem;
}
.slide-in-from-bottom-20 {
  --tw-enter-translate-y: 5rem;
}

.slide-in-from-left-4 {
  --tw-enter-translate-x: -1rem;
}

.slide-in-from-right-2 {
  --tw-enter-translate-x: 0.5rem;
}
.slide-in-from-right-4 {
  --tw-enter-translate-x: 1rem;
}
.slide-in-from-right-8 {
  --tw-enter-translate-x: 2rem;
}

/* مدد زمنية مخصصة */
.duration-300 { animation-duration: 300ms; }
.duration-500 { animation-duration: 500ms; }
.duration-700 { animation-duration: 700ms; }
.duration-1000 { animation-duration: 1000ms; }

/* تأخير الحركة */
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }

/* تنسيقات الطباعة */
@media print {
  body {
    background-color: white;
    color: black;
  }
}
```
---

### File: `index.html`
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    
    <title>Islam's Guide - رفيق التعافي الذكي</title>
    <meta name="description" content="نظام ذكي للتعافي التدريجي الآمن، يجمع بين الخوارزميات والإشراف الطبي.">
    <meta name="theme-color" content="#020617">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet">

    <!-- Tailwind CSS (CDN for quick prototyping/fallback, though build uses PostCSS) -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <style>
      body {
        background-color: #020617;
        color: #e2e8f0;
        font-family: 'Tajawal', sans-serif;
        overflow-x: hidden;
      }
      /* Custom Scrollbar Globally */
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: #0f172a; }
      ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: #475569; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./index.tsx"></script>
  </body>
</html>
```
---

### File: `index.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // استيراد ملف التصميم الذي يحتوي على Tailwind و Animations

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```
---

### File: `metadata.json`
```json
{
  "name": "Islam's Guide",
  "description": "A smart, mathematically driven medication tapering assistant that adapts to your daily progress.",
  "requestFramePermissions": []
}
```
---

### File: `package.json`
```json
{
  "name": "islams-guide-smart-recovery",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "firebase": "^10.8.0",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.64",
    "@types/react-dom": "^18.2.21",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.4"
  }
}
```
---

### File: `postcss.config.js`
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```
---

### File: `README.md`
```md
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1QtyjxMs5XikIhSOz8I1UJdoCAdi7lxLX

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

```
---

### File: `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",        // يشمل الملفات في الجذر مثل App.tsx و index.tsx
    "./views/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'Inter', 'sans-serif'],
      },
      animation: {
        'in': 'enter 0.3s ease-out',
        'out': 'exit 0.15s ease-in',
      },
    },
  },
  plugins: [],
}
```
---

### File: `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["."],
  "exclude": ["vite.config.ts", "node_modules"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```
---

### File: `tsconfig.node.json`
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```
---

### File: `types.ts`
```ts
// --- Basic Medication Types ---
export type MedType = 'narcotic' | 'psychiatric' | 'normal' | null;
export type MedForm = 'tablet' | 'liquid'; 
export type MedUnit = 'mg' | 'g' | 'ml' | 'l';

// --- ROLES & PERMISSIONS ---
export type UserRole = 'admin' | 'doctor' | 'normal_user' | 'patient';

// --- DOCTOR SPECIFIC TYPES ---
export type DoctorAccountStatus = 'pending' | 'approved' | 'rejected';

export interface DoctorProfileData {
  specialty: string;        
  licenseNumber: string;    
  clinicLocation?: string;  
  phoneNumber: string;      
  bio: string;              
  photoUrl?: string | null;        
  accountStatus: DoctorAccountStatus; 
  
  // Rejection & Resubmission Logic
  rejectionReason?: string | null;       
  submissionCount?: number;       
  lastSubmissionDate?: number;    

  // Stats
  totalPatients: number;
  activePatients: number;
  recoveredCount: number;
  doctorLevel: number; 
}

// --- PATIENT SPECIFIC TYPES ---
export interface PatientProfileData {
  assignedDoctorId: string;
  assignedDoctorName: string;
  // NEW: Request Status logic
  requestStatus: 'pending' | 'approved' | 'rejected'; 
  
  isPlanAssigned: boolean; 
  isRecovered: boolean;    
  recoveryDate?: string;   
}

// --- MAIN USER PROFILE ---
export interface UserProfile {
  uid?: string; 
  email: string;
  name: string;
  role: UserRole; 
  
  doctorData?: DoctorProfileData;   
  patientData?: PatientProfileData; 
  
  medType?: MedType;
  medForm?: MedForm;
  medUnit?: MedUnit;
  durationMonths: number;
  setupComplete: boolean; 
  
  planType?: 'algorithm' | 'manual'; 
  speedModifier?: number; 
  
  isBanned?: boolean;
  lastActive?: string; 
  progress?: number;   
  streak?: number;     
  
  doctorNotes?: string; 
  isFlagged?: boolean; 
  
  logs?: DailyLog[];
  plan?: PlanDay[];
  inventory?: Inventory;
}

// --- INVENTORY & PLANNING ---
export interface Inventory {
  boxes: number;
  pillsPerBox: number;
  loosePills: number;
  totalPills: number;
}

export interface ManualPhase {
  dose: number;
  days: number;
  interval?: number; 
}

export interface DailyLog {
  date: string; 
  doseTaken: number;
  mood: 'bad' | 'normal' | 'good' | null;
  sleepHours?: number; 
  symptoms?: string[]; 
  notes?: string;
}

export interface PlanDay {
  date: string;
  plannedDose: number;
  isPast: boolean;
  log?: DailyLog;
}

// --- CONTENT & CMS ---
export type ArticleCategory = 'medical' | 'motivation' | 'tip' | 'news' | 'announcement';

export interface Article {
  id?: string;
  title: string;
  content: string;
  category: ArticleCategory; 
  isPublished: boolean;
  createdAt: number;
  authorName: string;
  authorId: string;
  authorRole: 'admin' | 'doctor'; 
}

// --- CHAT & COMMUNITY ---
export interface ChatRoom {
  id: string;
  name: string;
  createdBy: string; 
  creatorName: string;
  createdAt: number;
  language?: string;
  isDoctorRoom?: boolean; 
  doctorId?: string;      
}

export interface ChatMessage {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  role: UserRole; 
  isDoctor?: boolean;
  isAdmin?: boolean;
}

// --- SUPPORT TICKETS ---
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';

export interface Ticket {
  id?: string;
  userId: string;
  userEmail: string;
  subject: string;
  status: TicketStatus;
  createdAt: number;
  lastUpdate: number;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  senderId: string; 
  senderName: string;
  text: string;
  timestamp: number;
  isAdmin: boolean;
}

// --- AUDIT LOGS ---
export interface AuditLog {
  id?: string;
  adminId: string;
  adminName: string;
  action: string; 
  targetId?: string; 
  details: string;
  timestamp: number;
}

// --- APP NAVIGATION VIEWS ---
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS',
  ARTICLES = 'ARTICLES',
  
  CALENDAR = 'CALENDAR',
  STATS = 'STATS',
  COMMUNITY = 'COMMUNITY',
  SUPPORT = 'SUPPORT',
  
  DOCTOR_DASHBOARD = 'DOCTOR_DASHBOARD', 
  DOCTOR_PATIENTS = 'DOCTOR_PATIENTS',   
  DOCTOR_MESSAGES = 'DOCTOR_MESSAGES',   
  
  ADMIN = 'ADMIN',
  
  WAITING_APPROVAL = 'WAITING_APPROVAL', 
  WAITING_PLAN = 'WAITING_PLAN'          
}
```
---

### File: `vite.config.ts`
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true // يسمح بالوصول من الشبكة المحلية (مفيد للاختبار على الموبايل)
  }
})
```
---

## 📊 Stats
- Total Files: 56
- Total Characters: 387309
- Estimated Tokens: ~96.828 (GPT-4 Context)
