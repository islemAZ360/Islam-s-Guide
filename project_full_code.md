# Project Code Dump
Generated: 13/1/2026, 04:52:21

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
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, ShieldCheck, Eye, Snowflake, Wind, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BreathingModal = ({ isOpen, onClose }: BreathingModalProps) => {
  const { t, dir } = useLanguage();
  const [step, setStep] = useState(0); 
  const [breathePhase, setBreathePhase] = useState<'in' | 'hold' | 'out'>('in');
  
  // Refs for focus management and timer cleanup
  const modalRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // 1. Reset on Open & Focus Management
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setBreathePhase('in');
      // Trap focus or at least move it to the modal
      setTimeout(() => modalRef.current?.focus(), 100);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      clearAllTimers();
    }
    return () => { 
        document.body.style.overflow = 'unset'; 
        clearAllTimers();
    };
  }, [isOpen]);

  // 2. Handle Escape Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 3. Timer Cleanup Helper
  const clearAllTimers = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
  };

  const addTimer = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timersRef.current.push(id);
      return id;
  };

  // 4. Breathing Cycle Logic (Safer)
  useEffect(() => {
    if (step === 3 && isOpen) {
        const runCycle = () => {
            setBreathePhase('in');
            
            // Inhale for 4s
            addTimer(() => {
                setBreathePhase('hold');
                
                // Hold for 4s (Box Breathing variation or 4-7-8, here adapted to 4-2-4 for ease)
                addTimer(() => {
                    setBreathePhase('out');
                    
                    // Exhale for 4s then loop
                    addTimer(runCycle, 4000); 
                }, 2000); // Hold 2s
            }, 4000); // Inhale 4s
        };

        runCycle();
        return () => clearAllTimers();
    }
  }, [step, isOpen]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sos-title"
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-lg mx-auto bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl overflow-hidden min-h-[500px] flex flex-col justify-center outline-none ring-1 ring-white/10"
      >
        <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={dir === 'rtl' ? "إغلاق" : "Close"}
        >
            <X size={24} />
        </button>

        {step === 0 && (
            <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-8" role="tabpanel">
                <div className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse border border-rose-500/30">
                    <ShieldCheck size={48} className="text-rose-500" />
                </div>
                <h2 id="sos-title" className="text-4xl font-black text-white tracking-tight">{t('sos_phase_1_title')}</h2>
                <p className="text-lg text-slate-300 leading-relaxed font-medium px-4">{t('sos_phase_1_text')}</p>
                <Button variant="primary" onClick={() => setStep(1)} className="w-full text-lg py-6 shadow-indigo-500/30 rounded-2xl">
                    {t('sos_btn_ground')} <ArrowRight className={dir === 'rtl' ? 'rotate-180 mr-2' : 'ml-2'} />
                </Button>
            </div>
        )}

        {step === 1 && (
            <div className="animate-in slide-in-from-right-8 duration-500 space-y-8" role="tabpanel">
                <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                    <Eye size={48} className="text-blue-500" />
                </div>
                <h2 className="text-3xl font-bold text-white">{t('sos_phase_2_title')}</h2>
                <p className="text-xl text-white font-bold bg-slate-800/80 p-6 rounded-3xl border border-white/10 shadow-inner">
                    {t('sos_phase_2_text')}
                </p>
                <div className="flex gap-3 justify-center" aria-hidden="true">
                    <span className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"></span>
                    <span className="w-3 h-3 rounded-full bg-blue-500/60 animate-bounce delay-100"></span>
                    <span className="w-3 h-3 rounded-full bg-blue-500/30 animate-bounce delay-200"></span>
                </div>
                <Button variant="secondary" onClick={() => setStep(2)} className="w-full text-lg py-6 rounded-2xl">
                    {t('sos_btn_next')}
                </Button>
            </div>
        )}

        {step === 2 && (
            <div className="animate-in slide-in-from-right-8 duration-500 space-y-8" role="tabpanel">
                <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                    <Snowflake size={48} className="text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">{t('sos_phase_3_title')}</h2>
                <p className="text-lg text-slate-300 leading-relaxed px-4">{t('sos_phase_3_text')}</p>
                <Button variant="primary" onClick={() => setStep(3)} className="w-full text-lg py-6 shadow-cyan-500/20 border-cyan-500/20 rounded-2xl">
                    {t('sos_btn_breathe')}
                </Button>
            </div>
        )}

        {step === 3 && (
            <div className="animate-in fade-in duration-1000" role="tabpanel">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                    <Wind className="text-indigo-400" /> {t('sos_phase_4_title')}
                </h2>
                <p className="text-slate-400 text-sm mb-12">{t('sos_phase_4_subtitle')}</p>
                
                {/* Breathing Animation Container */}
                <div className="relative h-72 w-72 mx-auto mb-8 flex items-center justify-center">
                    {/* Live Region for Screen Readers */}
                    <div className="sr-only" aria-live="assertive" aria-atomic="true">
                        {breathePhase === 'in' && t('breathe_in')}
                        {breathePhase === 'hold' && t('breathe_hold')}
                        {breathePhase === 'out' && t('breathe_out')}
                    </div>

                    {/* Outer Glow - Respects Reduced Motion */}
                    <div className={`absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl transition-all duration-[4000ms] ease-in-out motion-reduce:transition-none motion-reduce:animate-pulse ${
                        breathePhase === 'in' || breathePhase === 'hold' ? 'scale-100 opacity-60' : 'scale-50 opacity-20'
                    }`}></div>
                    
                    {/* Main Circle - Respects Reduced Motion */}
                    <div className={`absolute w-full h-full bg-indigo-500/10 rounded-full border-4 border-indigo-500/30 transition-all duration-[4000ms] ease-in-out motion-reduce:transition-none ${
                        breathePhase === 'in' ? 'scale-100 border-indigo-400' : 
                        breathePhase === 'hold' ? 'scale-100 border-white' : 
                        'scale-50 border-indigo-900'
                    }`}></div>
                    
                    {/* Text Indicator */}
                    <div className="relative z-10 text-4xl font-black text-indigo-100 transition-all duration-500 drop-shadow-lg">
                        {breathePhase === 'in' && t('breathe_in')}
                        {breathePhase === 'hold' && t('breathe_hold')}
                        {breathePhase === 'out' && t('breathe_out')}
                    </div>
                </div>
                
                <Button variant="secondary" onClick={onClose} className="w-full rounded-2xl">
                    {t('close')}
                </Button>
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
import React, { useEffect, useRef } from 'react';
import { FileText, Printer, X, Activity, Calendar, User, Ruler, Weight, ShieldCheck } from 'lucide-react';
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
  const { t, language } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Focus Management
  useEffect(() => {
    if (isOpen) {
        setTimeout(() => modalRef.current?.focus(), 100);
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape' && isOpen) onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Report Calculations
  const unitLabel = userProfile?.medUnit || 'mg';
  const validPlan = plan.filter(p => p.date <= new Date().toISOString().split('T')[0]);
  const adherenceRate = validPlan.length > 0 ? Math.round((logs.length / validPlan.length) * 100) : 0;
  
  const startDose = plan.length > 0 ? plan[0].plannedDose : 0;
  const currentPlanDay = plan.find(p => p.date === new Date().toISOString().split('T')[0]);
  const currentDose = currentPlanDay?.plannedDose || 0;
  
  const planTypeLabel = userProfile?.planType === 'manual' 
    ? `Managed by Dr. ${userProfile.patientData?.assignedDoctorName || 'Unknown'}` 
    : 'Automated Smart Algorithm';

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300 p-4 print:p-0 print:bg-white print:static print:block"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
    >
      
      {/* Modal Container */}
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-4xl bg-white text-slate-900 rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col print:max-h-none print:rounded-none print:shadow-none print:w-full print:overflow-visible outline-none"
      >
        
        {/* Screen Header (Hidden in Print) */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 print:hidden">
            <h2 id="report-title" className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <FileText className="text-indigo-600" aria-hidden="true" /> {t('export_report')}
            </h2>
            <div className="flex gap-3">
                <Button 
                    onClick={() => window.print()} 
                    className="!py-2 !px-4 !bg-indigo-600 !text-white !rounded-xl !shadow-none hover:!bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                    aria-label={t('print')}
                >
                    <Printer size={18} className="mr-2" aria-hidden="true"/> {t('print')}
                </Button>
                <button 
                    onClick={onClose} 
                    className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label={t('close')}
                >
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* Content Area (Scrollable on Screen, Full on Print) */}
        <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible custom-scrollbar bg-white">
            
            {/* Report Header */}
            <header className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight flex items-center gap-2">
                        Islam's Guide <span className="text-white bg-indigo-600 px-2 py-0.5 rounded text-sm align-top print:text-indigo-600 print:bg-transparent print:border print:border-indigo-600">PRO</span>
                    </h1>
                    <p className="text-slate-500 font-medium print:text-black">Recovery Progress & Neuro-Adaptation Report</p>
                </div>
                <div className="text-right">
                    <p className="text-slate-400 text-sm mb-1 print:text-slate-600">Generated on</p>
                    <p className="font-bold text-slate-900 font-mono">{new Date().toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>

            {/* Patient Info Grid */}
            <section aria-labelledby="patient-info" className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8 print:bg-transparent print:border print:border-slate-300 print:rounded-none">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">
                    <User size={14} aria-hidden="true" /> <span id="patient-info">Patient Information</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <span className="block text-xs text-slate-500 mb-1 print:text-slate-600">Full Name</span>
                        <span className="block font-bold text-slate-900 text-lg">{userProfile?.name}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-slate-500 mb-1 print:text-slate-600">Age</span>
                        <span className="block font-bold text-slate-900 text-lg">{userProfile?.age ? `${userProfile.age} Years` : '-'}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-slate-500 mb-1 print:text-slate-600">Weight</span>
                        <span className="block font-bold text-slate-900 text-lg">{userProfile?.weight ? `${userProfile.weight} kg` : '-'}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-slate-500 mb-1 print:text-slate-600">Height</span>
                        <span className="block font-bold text-slate-900 text-lg">{userProfile?.height ? `${userProfile.height} cm` : '-'}</span>
                    </div>
                </div>
            </section>

            {/* Clinical Summary */}
            <section aria-label="Clinical Summary" className="grid grid-cols-3 gap-4 mb-8 print:grid-cols-3 print:gap-6">
                 <div className="p-4 rounded-xl border border-slate-200 bg-white print:border-slate-400">
                     <span className="block text-xs text-slate-400 uppercase font-bold mb-2 print:text-slate-600">Medication</span>
                     <div className="font-black text-xl text-slate-800 capitalize">{userProfile?.medType || 'Standard'}</div>
                     <div className="text-xs text-slate-500 mt-1 print:text-black">{userProfile?.medForm} ({unitLabel})</div>
                 </div>
                 <div className="p-4 rounded-xl border border-slate-200 bg-white print:border-slate-400">
                     <span className="block text-xs text-slate-400 uppercase font-bold mb-2 print:text-slate-600">Dose Reduction</span>
                     <div className="flex items-baseline gap-2">
                         <span className="font-black text-xl text-slate-800">{startDose}</span>
                         <span className="text-slate-400 text-sm">➔</span>
                         <span className="font-black text-xl text-indigo-600 print:text-black">{currentDose}</span>
                         <span className="text-xs text-slate-500">{unitLabel}</span>
                     </div>
                 </div>
                 <div className="p-4 rounded-xl border border-slate-200 bg-white print:border-slate-400">
                     <span className="block text-xs text-slate-400 uppercase font-bold mb-2 print:text-slate-600">Adherence</span>
                     <div className="font-black text-xl text-emerald-600 print:text-black">{adherenceRate}%</div>
                     <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden print:border print:border-slate-300">
                         <div className="bg-emerald-500 h-full rounded-full print:bg-black" style={{ width: `${adherenceRate}%` }}></div>
                     </div>
                 </div>
            </section>

            {/* Detailed Log Table */}
            <section aria-labelledby="log-title" className="mb-8">
                <h3 id="log-title" className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={16} className="text-slate-400 print:text-black" aria-hidden="true"/> Daily Vitals Log
                </h3>
                <table className="w-full text-sm text-left border-collapse border border-slate-200 rounded-lg overflow-hidden print:border-slate-400">
                    <thead className="bg-slate-100 text-slate-600 print:bg-slate-200 print:text-black">
                        <tr>
                            <th className="p-3 font-bold border-b border-slate-200 print:border-slate-400" scope="col">Date</th>
                            <th className="p-3 font-bold border-b border-slate-200 print:border-slate-400" scope="col">Planned</th>
                            <th className="p-3 font-bold border-b border-slate-200 print:border-slate-400" scope="col">Taken</th>
                            <th className="p-3 font-bold border-b border-slate-200 print:border-slate-400" scope="col">Sleep (Prev)</th>
                            <th className="p-3 font-bold border-b border-slate-200 print:border-slate-400" scope="col">Mood</th>
                            <th className="p-3 font-bold border-b border-slate-200 w-1/3 print:border-slate-400" scope="col">Symptoms / Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-slate-500 italic">No logs recorded yet.</td>
                            </tr>
                        )}
                        {logs.slice().reverse().map((log, i) => {
                            const planned = plan.find(p => p.date === log.date)?.plannedDose;
                            return (
                                <tr key={i} className="hover:bg-slate-50 break-inside-avoid print:break-inside-avoid">
                                    <td className="p-3 font-mono text-slate-500 print:text-black">{log.date}</td>
                                    <td className="p-3 font-medium text-slate-400 print:text-slate-600">{planned !== undefined ? `${planned}${unitLabel}` : '-'}</td>
                                    <td className="p-3 font-bold text-indigo-600 print:text-black">{log.doseTaken}{unitLabel}</td>
                                    <td className="p-3 text-slate-700 print:text-black">{log.sleepHours ? `${log.sleepHours} hrs` : '-'}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase print:border print:border-black print:bg-transparent print:text-black ${
                                            log.mood === 'good' ? 'bg-emerald-100 text-emerald-700' : 
                                            log.mood === 'bad' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {log.mood}
                                        </span>
                                    </td>
                                    <td className="p-3 text-slate-500 text-xs italic print:text-black">
                                        {log.symptoms && log.symptoms.length > 0 ? log.symptoms.join(', ') : 'None'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>

            {/* Footer / Disclaimer */}
            <footer className="border-t border-slate-200 pt-6 mt-12 flex justify-between items-end text-xs text-slate-400 print:fixed print:bottom-0 print:left-0 print:w-full print:p-8 print:bg-white print:text-slate-600 print:border-t-2 print:border-black">
                <div>
                    <p className="font-bold text-slate-500 mb-1 print:text-black flex items-center gap-2">
                        <ShieldCheck size={12} /> Plan Strategy: {planTypeLabel}
                    </p>
                    <p>This report is computer-generated by Islam's Guide Algorithm v2.0.</p>
                    <p>It acts as a supplementary record and does not replace official medical advice.</p>
                </div>
                <div className="text-center">
                    <div className="h-10 w-32 border-b border-slate-300 mb-1 print:border-black"></div>
                    <p>Doctor's Signature</p>
                </div>
            </footer>
        </div>
      </div>
      
      {/* Print CSS Rules (Ensure cleaner output) */}
      <style>{`
        @media print {
            @page { margin: 1cm; size: A4 portrait; }
            body * { visibility: hidden; }
            .fixed { position: static !important; }
            [role="dialog"] { 
                position: absolute; 
                left: 0; top: 0; 
                width: 100%; 
                margin: 0; 
                padding: 0;
                background: white !important;
                visibility: visible;
            }
            [role="dialog"] * { visibility: visible; }
            /* Hide scrollbars & buttons in print */
            ::-webkit-scrollbar { display: none; }
            button { display: none !important; }
        }
      `}</style>
    </div>
  );
};
```
---

### File: `components\modals\ScientificPlanModal.tsx`
```tsx
import React, { useEffect, useRef } from 'react';
import { X, BrainCircuit, Activity, Pill, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';

interface ScientificPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ScientificPlanModal = ({ isOpen, onClose, onConfirm }: ScientificPlanModalProps) => {
  const { t, dir } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus Management & Escape Key
  useEffect(() => {
    if (isOpen) {
        // Move focus to modal
        setTimeout(() => modalRef.current?.focus(), 100);
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300 p-4" 
        dir={dir}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sci-modal-title"
        aria-describedby="sci-modal-desc"
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/30 rounded-[2.5rem] p-6 md:p-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] outline-none"
      >
        
        {/* Aesthetic Background Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        {/* Close Button */}
        <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={t('close')}
        >
            <X size={24} />
        </button>

        <div className="relative z-10 overflow-y-auto custom-scrollbar pr-2">
            {/* Header */}
            <header className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6 border border-white/10 animate-in zoom-in duration-500">
                    <BrainCircuit size={40} className="text-white" aria-hidden="true" />
                </div>
                <h2 id="sci-modal-title" className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
                    {t('sci_title')}
                </h2>
                <p id="sci-modal-desc" className="text-slate-400 text-lg max-w-md">
                    {t('sci_subtitle')}
                </p>
            </header>

            {/* Principles List */}
            <ul className="space-y-6 mb-8">
                {/* Principle 1 */}
                <li className="flex gap-5 bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                        <Activity size={24} className="text-indigo-400" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg mb-1">{t('sci_principle_1_title')}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{t('sci_principle_1_desc')}</p>
                    </div>
                </li>
                
                {/* Principle 2 */}
                <li className="flex gap-5 bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                        <ShieldCheck size={24} className="text-emerald-400" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg mb-1">{t('sci_principle_2_title')}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{t('sci_principle_2_desc')}</p>
                    </div>
                </li>

                {/* Principle 3 */}
                <li className="flex gap-5 bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                        <Pill size={24} className="text-amber-400" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg mb-1">{t('sci_principle_3_title')}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{t('sci_principle_3_desc')}</p>
                    </div>
                </li>
            </ul>

            {/* Sources */}
            <aside className="bg-slate-800/30 p-5 rounded-2xl border border-dashed border-slate-700 mb-8" aria-label="Scientific References">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <BookOpen size={14} aria-hidden="true" /> {t('sci_sources_title')}
                </h4>
                <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside font-medium font-mono opacity-80">
                    <li>{t('sci_source_1')}</li>
                    <li>{t('sci_source_2')}</li>
                    <li>{t('sci_source_3')}</li>
                </ul>
            </aside>

            {/* Footer Action */}
            <div className="flex flex-col md:flex-row gap-4 items-center pt-4 border-t border-white/5">
                <p className="text-xs text-slate-500 text-center md:text-start flex-1 px-2 leading-relaxed">
                    {t('sci_trust_msg')}
                </p>
                <Button 
                    onClick={onConfirm} 
                    variant="success" 
                    className="w-full md:w-auto px-8 py-4 text-lg shadow-lg shadow-emerald-500/20 rounded-xl"
                    rightIcon={<ArrowRight size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />}
                >
                    {t('sci_btn_understood')}
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
  // تعريف الألوان مع تأثيرات الظل والإطار المتوهج
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.15)]',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    red: 'bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]',
  };

  const selectedColor = colors[color] || colors.indigo;

  return (
    <span className={`
      inline-flex items-center justify-center gap-1.5 
      px-2.5 py-0.5 rounded-full 
      text-[10px] md:text-xs font-bold uppercase tracking-wider 
      border backdrop-blur-md 
      transition-all duration-300 hover:brightness-125
      ${selectedColor} ${className}
    `}>
      {children}
    </span>
  );
};
```
---

### File: `components\ui\Button.tsx`
```tsx
import React, { memo, forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'panic';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(({ 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false, 
  isLoading = false,
  type = 'button', // Default to 'button' to prevent accidental form submission
  leftIcon,
  rightIcon,
  ...props 
}, ref) => {
  
  // Base styles focusing on Accessibility (Focus rings) and Touch Targets
  const baseStyle = `
    relative overflow-hidden px-6 py-4 rounded-2xl font-bold tracking-wide select-none 
    transition-all duration-300 ease-out
    flex items-center justify-center gap-3
    focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
    disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
    active:scale-[0.98] group
  `;
  
  // Variants with high contrast and distinct states
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/20 hover:shadow-indigo-500/40 hover:border-indigo-400/40 focus-visible:ring-indigo-500",
    
    secondary: "bg-slate-800/50 backdrop-blur-sm border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-white/20 focus-visible:ring-slate-500",
    
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/20 focus-visible:ring-rose-500",
    
    success: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/20 hover:shadow-emerald-500/40 focus-visible:ring-emerald-500",
    
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border border-transparent focus-visible:ring-indigo-400",
    
    panic: "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/40 animate-pulse-glow border border-rose-400/30 focus-visible:ring-rose-500"
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button 
      ref={ref}
      type={type}
      disabled={disabled || isLoading} 
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      className={`${baseStyle} ${selectedVariant} ${className}`}
      {...props}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}

      {/* Content */}
      <span className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </span>

      {/* Shine Effect for Primary/Success variants */}
      {(variant === 'primary' || variant === 'success' || variant === 'panic') && !disabled && !isLoading && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 ease-in-out pointer-events-none"></div>
      )}
    </button>
  );
}));

Button.displayName = 'Button';
```
---

### File: `components\ui\Card.tsx`
```tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  hoverEffect?: boolean; // خاصية جديدة لتفعيل تأثير التحويم
}

export const Card = ({ 
  children, 
  className = '', 
  noPadding = false,
  hoverEffect = false 
}: CardProps) => {
  return (
    <div 
      className={`
        glass rounded-3xl relative overflow-hidden 
        transition-transform duration-300 ease-out
        ${hoverEffect ? 'hover:scale-[1.02] cursor-pointer hover:border-indigo-500/30' : 'hover:border-white/20'}
        ${!noPadding ? 'p-6 md:p-8' : ''} 
        ${className}
      `}
    >
      {/* طبقة إضاءة خفيفة جداً من الأعلى لليسار لإعطاء عمق */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
      
      {/* المحتوى */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
```
---

### File: `components\ui\LanguageSwitcher.tsx`
```tsx
import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'ar', label: 'العربية', accessibleLabel: 'تغيير اللغة إلى العربية' },
    { code: 'en', label: 'English', accessibleLabel: 'Switch to English' },
    { code: 'ru', label: 'Русский', accessibleLabel: 'Переключиться на русский' }
  ] as const;
  
  return (
    <div 
      className="flex items-center gap-1 p-1 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:border-white/20 transition-colors group"
      role="group"
      aria-label={language === 'ar' ? 'اختيار اللغة' : 'Language Selection'}
    >
      
      {/* Icon Indicator */}
      <div className="px-2 text-slate-400 group-hover:text-indigo-400 transition-colors" aria-hidden="true">
        <Globe size={14} />
      </div>

      {languages.map((lang) => {
        const isActive = language === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            aria-pressed={isActive}
            aria-label={lang.accessibleLabel}
            title={lang.label}
            className={`
              relative px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
              ${isActive 
                ? 'text-white shadow-lg shadow-indigo-500/30' 
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}
            `}
          >
            {/* Active Background Gradient */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl -z-10 animate-in zoom-in"></div>
            )}
            
            {lang.code}
          </button>
        );
      })}
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
  totalSteps?: number;
  label?: string;
}

export const ProgressRing = ({ radius, stroke, progress, totalSteps, label }: ProgressRingProps) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Ensure progress is clamped 0-100 for safety
  const safeProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (safeProgress / 100) * circumference;
  
  const { t, language } = useLanguage();

  return (
    <div 
      className="relative flex items-center justify-center group cursor-default"
      role="progressbar"
      aria-valuenow={Math.round(safeProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || (language === 'ar' ? 'نسبة التعافي' : 'Recovery Progress')}
      aria-valuetext={`${Math.round(safeProgress)}%`}
    >
      {/* خلفية متوهجة خلف الحلقة - تحترم إعدادات تقليل الحركة */}
      <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-700 animate-pulse-glow motion-reduce:animate-none"></div>
      
      <svg 
        height={radius * 2} 
        width={radius * 2} 
        className="rotate-[-90deg] transform transition-transform duration-700 group-hover:scale-105 relative z-10 motion-reduce:transition-none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            {/* فلتر التوهج */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        
        {/* الحلقة الخلفية (المسار) */}
        <circle 
            stroke="#1e293b" 
            strokeWidth={stroke} 
            fill="transparent" 
            r={normalizedRadius} 
            cx={radius} 
            cy={radius} 
            className="opacity-50" 
        />
        
        {/* الحلقة الأمامية (التقدم) مع التوهج والتدرج */}
        <circle 
            stroke="url(#gradient)" 
            strokeWidth={stroke} 
            strokeDasharray={circumference + ' ' + circumference} 
            style={{ strokeDashoffset }} 
            className="transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1) motion-reduce:transition-none"
            strokeLinecap="round" 
            fill="transparent" 
            r={normalizedRadius} 
            cx={radius} 
            cy={radius} 
            filter="url(#glow)"
        />
      </svg>
      
      {/* النص في المنتصف - مخفي عن قارئات الشاشة لأن الحاوية توفر المعلومات */}
      <div className="absolute flex flex-col items-center text-center animate-in zoom-in pointer-events-none z-20" aria-hidden="true">
        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white tracking-tighter drop-shadow-2xl">
            {Math.round(safeProgress)}%
        </span>
        <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">
            {language === 'ar' ? 'تعافي' : 'Recovered'}
        </span>
        
        {totalSteps !== undefined && (
            <div className="mt-2 bg-slate-900/80 px-3 py-1 rounded-full border border-white/10 shadow-lg backdrop-blur-md">
                <span className="text-[9px] text-slate-300 font-mono">
                    {totalSteps} {t('days_left').split(' ')[0]}
                </span>
            </div>
        )}
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
  LifeBuoy, ShieldAlert, MessageSquare, BookOpen
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
        { id: AppView.COMMUNITY, icon: MessageSquare, label: language === 'ar' ? 'المجتمع' : 'Chat' },
        { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
       );
    } 
    // 2. DOCTOR MENU
    else if (role === 'doctor') {
        items.push(
            { id: AppView.DOCTOR_DASHBOARD, icon: LayoutDashboard, label: 'Dash' },
            { id: AppView.DOCTOR_PATIENTS, icon: Users, label: 'Patients' },
            { id: AppView.ARTICLES, icon: BookOpen, label: 'Articles' }, // Added for Doctors
            { id: AppView.COMMUNITY, icon: MessageSquare, label: 'Chat' },
        );
    } 
    // 3. PATIENT / NORMAL USER MENU
    else {
        if (role === 'patient' && !userProfile?.patientData?.isPlanAssigned) {
             items.push(
                { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
                { id: AppView.ARTICLES, icon: BookOpen, label: t('nav_articles') }, // Added for new Patients
                { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
             );
        } else {
             items.push(
                { id: AppView.DASHBOARD, icon: LayoutDashboard, label: t('nav_dashboard') },
                { id: AppView.CALENDAR, icon: CalendarIcon, label: t('nav_calendar') },
                { id: AppView.STATS, icon: Activity, label: t('nav_stats') },
                { id: AppView.ARTICLES, icon: BookOpen, label: t('nav_articles') }, // Added for Active Users
                // Community is still accessible but maybe deprioritized if space is tight, 
                // but let's keep it if we can fit 5 items + Settings = 6.
                // If 6 is too many, we might swap Community/Articles or Stats/Articles.
                // Given labels hide on inactive, 6 items fits on modern phones.
                { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
             );
        }
    }
    
    // Settings always available
    items.push({ id: AppView.SETTINGS, icon: Settings, label: t('nav_settings') });
    
    return items;
  };

  const menuItems = getMenuItems();

  return (
    <nav 
      className="md:hidden fixed bottom-5 left-4 right-4 h-[70px] glass rounded-[2rem] z-50 animate-in slide-in-from-bottom-8 shadow-2xl shadow-black/50 overflow-hidden"
      aria-label={language === 'ar' ? 'القائمة الرئيسية للجوال' : 'Mobile Main Navigation'}
    >
      <ul className="flex items-center justify-between h-full px-1 m-0 list-none w-full">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <li key={item.id} className="flex-1 h-full min-w-0">
              <button
                onClick={() => setCurrentView(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className={`
                  w-full h-full flex flex-col items-center justify-center gap-1 relative group transition-all duration-500 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                  ${isActive ? '-translate-y-1' : ''}
                `}
              >
                {/* Active Glow Background */}
                <div className={`
                  absolute top-2 w-10 h-10 rounded-full blur-lg transition-all duration-500 pointer-events-none
                  ${isActive ? 'bg-indigo-500/40 opacity-100' : 'opacity-0'}
                `}></div>

                {/* Icon Container */}
                <div className={`
                  relative z-10 p-2.5 rounded-full transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-[#020617]' 
                    : 'text-slate-500 hover:text-slate-300'}
                `}>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                </div>
                
                {/* Label (Visible when active) */}
                <span className={`
                  text-[9px] font-bold tracking-wide transition-all duration-300 absolute bottom-1 whitespace-nowrap
                  ${isActive ? 'opacity-100 text-white translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
                `}>
                    {item.label}
                </span>
                
                {/* Inactive Dot Indicator */}
                {!isActive && (
                     <span className="w-1 h-1 rounded-full bg-slate-700 absolute bottom-2 transition-all duration-300 group-hover:bg-slate-500" aria-hidden="true"></span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
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
import { LanguageSwitcher } from './ui/LanguageSwitcher';

interface SidebarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  handleLogout: () => void;
  userProfile?: UserProfile | null;
}

export const Sidebar = ({ currentView, setCurrentView, handleLogout, userProfile }: SidebarProps) => {
  const { t, language } = useLanguage();

  const getMenuItems = () => {
    const role = userProfile?.role;
    const items = [];

    // 1. ADMIN MENU
    if (role === 'admin') {
      items.push(
        { id: AppView.ADMIN, icon: ShieldAlert, label: t('nav_admin') }, 
        { id: AppView.COMMUNITY, icon: MessageSquare, label: t('nav_community') },
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
      if (role === 'patient' && !userProfile?.patientData?.isPlanAssigned) {
         items.push(
            { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
            { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
         );
      } else {
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
    <aside 
      className="hidden md:flex flex-col w-80 h-screen fixed right-0 top-0 overflow-y-auto z-50 border-l border-white/5 bg-slate-950/80 backdrop-blur-2xl shadow-2xl"
      aria-label={language === 'ar' ? 'القائمة الجانبية' : 'Sidebar Navigation'}
    >
      
      {/* Header */}
      <div className="p-8 pb-4 relative shrink-0">
        {/* Ambient Glow behind Logo */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none"></div>
        
        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 relative z-10 mb-1">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          Islam's Guide
        </h2>
        
        <div className="pr-[3.25rem]">
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
                    Smart Edition <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
                </span>
            )}
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button 
                  onClick={() => setCurrentView(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                    ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}
                  `}
                >
                  {/* Active Background Gradient */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-indigo-600/5 to-transparent border-r-[3px] border-indigo-500 opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
                  )}

                  <item.icon 
                    className={`
                      w-5 h-5 relative z-10 transition-transform duration-300 
                      ${isActive ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'group-hover:scale-110'}
                    `} 
                    aria-hidden="true"
                  />
                  
                  <span className={`font-bold text-lg tracking-wide truncate relative z-10 ${isActive ? 'text-indigo-50' : ''}`}>
                    {item.label}
                  </span>
                  
                  {/* Admin Notification Dot */}
                  {item.id === AppView.ADMIN && (
                      <span className="mr-auto w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)] relative z-10" aria-label="New Notifications"></span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer / User Profile */}
      <div className="p-6 shrink-0 space-y-4 relative z-10">
        <LanguageSwitcher />
        
        {/* User Card */}
        <div className="glass p-4 rounded-2xl flex items-center gap-3 group hover:border-indigo-500/30 transition-all cursor-default" role="group" aria-label="User Profile">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold border border-white/5 group-hover:scale-105 transition-transform" aria-hidden="true">
                {userProfile?.role === 'doctor' ? <Stethoscope size={18} /> : (userProfile?.name?.charAt(0).toUpperCase() || <UserIcon size={18} />)}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{userProfile?.name || 'Guest'}</p>
                <p className="text-[10px] text-slate-500 truncate">{userProfile?.role?.toUpperCase()}</p>
            </div>
            <button 
                onClick={handleLogout} 
                className="p-2 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                title={t('logout')}
                aria-label={t('logout')}
            >
                <LogOut size={18} aria-hidden="true" />
            </button>
        </div>
      </div>
    </aside>
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
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; 
import { auth, googleProvider, db } from '../services/firebase';
import { useLanguage } from './LanguageContext';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  signupWithEmail: (e: string, p: string, name: string, data: { age: number, weight: number, height: number }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  enableDemoMode: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage(); // Access language for error localization
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Helper to translate Firebase errors
  const getLocalizedError = (errorCode: string) => {
    const isAr = language === 'ar';
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return isAr ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "Invalid email or password.";
      case 'auth/email-already-in-use':
        return isAr ? "البريد الإلكتروني مستخدم بالفعل." : "Email is already in use.";
      case 'auth/weak-password':
        return isAr ? "كلمة المرور ضعيفة (يجب أن تكون 6 أحرف على الأقل)." : "Password is too weak (min 6 chars).";
      case 'auth/invalid-email':
        return isAr ? "صيغة البريد الإلكتروني غير صحيحة." : "Invalid email format.";
      case 'auth/too-many-requests':
        return isAr ? "محاولات كثيرة جداً. يرجى المحاولة لاحقاً." : "Too many attempts. Try again later.";
      case 'auth/network-request-failed':
        return isAr ? "خطأ في الاتصال. تحقق من الإنترنت." : "Network error. Check your connection.";
      default:
        return isAr ? "حدث خطأ غير متوقع. حاول مرة أخرى." : "An unexpected error occurred.";
    }
  };

  // Monitor Auth State
  useEffect(() => {
    if (!auth) {
        setLoading(false);
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

  // Login
  const loginWithEmail = async (email: string, password: string) => {
    if (!auth) return;
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Login Error:", err.code);
      setError(getLocalizedError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Signup with Profile Creation
  const signupWithEmail = async (email: string, password: string, name: string, data: { age: number, weight: number, height: number }) => {
    if (!auth) return;
    setLoading(true);
    setError(null);

    try {
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update Display Name
        await updateProfile(user, { displayName: name });

        // 3. Create Firestore Profile
        // Note: If this fails, we have an orphaned auth user. 
        // In a production app, we might want to delete the user or use a Cloud Function.
        try {
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: email,
                name: name,
                role: 'normal_user',
                age: data.age,
                weight: data.weight,
                height: data.height,
                setupComplete: false,
                createdAt: new Date().toISOString(),
                plan: [],
                logs: [],
                inventory: { boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 }
            });
        } catch (firestoreErr) {
            console.error("Firestore Profile Error:", firestoreErr);
            // Attempt cleanup (optional, careful with this in production)
            // await user.delete(); 
            throw new Error(language === 'ar' ? 'فشل إنشاء الملف الشخصي. تحقق من الاتصال.' : 'Failed to create user profile. Check connection.');
        }

    } catch (err: any) {
        console.error("Signup Error:", err.code || err.message);
        setError(err.code ? getLocalizedError(err.code) : err.message);
    } finally {
        setLoading(false);
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // Profile check/creation should happen in a separate step or via Cloud Functions triggers
    } catch (err: any) {
      console.error("Google Login Error:", err.code);
      setError(getLocalizedError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const resetPassword = async (email: string) => {
      if (!auth) return;
      if (!email) {
          setError(language === 'ar' ? "يرجى إدخال البريد الإلكتروني." : "Please enter your email.");
          return;
      }
      setLoading(true);
      setError(null);
      try {
          await sendPasswordResetEmail(auth, email);
          alert(language === 'ar' ? "تم إرسال رابط إعادة التعيين إلى بريدك." : "Password reset link sent to your email.");
      } catch (err: any) {
          console.error("Reset Password Error:", err.code);
          setError(getLocalizedError(err.code));
      } finally {
          setLoading(false);
      }
  };

  // Logout
  const logout = async () => {
    try {
      if (!isDemoMode && auth) {
        await signOut(auth);
      }
      setIsDemoMode(false);
      setCurrentUser(null);
      // Clear sensitive data from local storage
      localStorage.removeItem('taper_profile');
      localStorage.removeItem('taper_plan');
      // Force reload to clear memory states
      window.location.reload();
    } catch (err: any) {
      console.error("Logout Error:", err);
    }
  };

  // Demo Mode
  const enableDemoMode = () => {
    setIsDemoMode(true);
    // Create a realistic-looking fake user object
    setCurrentUser({ 
      uid: 'demo-user', 
      email: 'demo@islamguide.com', 
      displayName: 'Demo User',
      emailVerified: true,
      isAnonymous: true,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'demo-token',
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
      signupWithEmail, 
      loginWithGoogle, 
      resetPassword,
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
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'; 
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

// Dummy Data for Demo Mode
const DEMO_PROFILE: UserProfile = {
    uid: 'demo-user',
    email: 'demo@islamguide.com',
    name: 'Demo User',
    role: 'normal_user',
    setupComplete: true,
    planType: 'algorithm',
    medType: 'normal',
    medForm: 'tablet',
    medUnit: 'mg',
    durationMonths: 1,
    speedModifier: 1.0,
    progress: 45
};

const DEMO_INVENTORY: Inventory = { boxes: 2, pillsPerBox: 30, loosePills: 15, totalPills: 75 };
const DEMO_PLAN: PlanDay[] = Array.from({ length: 30 }).map((_, i) => ({
    date: new Date(Date.now() + (i - 5) * 86400000).toISOString().split('T')[0],
    plannedDose: Math.max(0, 10 - i * 0.5),
    isPast: i < 5
}));
const DEMO_LOGS: DailyLog[] = Array.from({ length: 5 }).map((_, i) => ({
    date: new Date(Date.now() + (i - 5) * 86400000).toISOString().split('T')[0],
    doseTaken: 10 - i * 0.5,
    mood: i % 2 === 0 ? 'good' : 'normal',
    sleepHours: 7 + (i % 2),
    symptoms: []
}));

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
    // A. Handle Logout State
    if (!currentUser && !isDemoMode) {
        setUserProfile(null);
        setPlan([]);
        setLogs([]);
        setInventory({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
        setDataLoading(false);
        return;
    }

    // B. Handle Demo Mode (Local Data Only)
    if (isDemoMode) {
        setDataLoading(true);
        // Simulate network delay for realism
        setTimeout(() => {
            setUserProfile(DEMO_PROFILE);
            setInventory(DEMO_INVENTORY);
            setPlan(DEMO_PLAN);
            setLogs(DEMO_LOGS);
            setSpeedModifier(1.0);
            setDataLoading(false);
        }, 800);
        return;
    }

    // C. Handle Authenticated User (Firestore Sync)
    if (currentUser) {
        // Load pending syncs from local storage in case of previous crash
        const savedLogs = localStorage.getItem('pending_sync_logs');
        if (savedLogs) {
            try {
                const parsedLogs = JSON.parse(savedLogs);
                if (parsedLogs.length > 0) setLogs(parsedLogs);
                localStorage.removeItem('pending_sync_logs'); 
            } catch (e) { console.error("Error loading pending logs", e); }
        }

        setDataLoading(true);
        const docRef = doc(db, "users", currentUser.uid);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const fetchedProfile = { ...data, uid: currentUser.uid } as UserProfile;
                
                // Merge nested profile data if structured that way
                if (data.userProfile) Object.assign(fetchedProfile, data.userProfile);

                setUserProfile(fetchedProfile);

                // Only update local state from cloud if we are not currently "dirty" (editing)
                if (!isDirty.current) {
                    if (data.plan) setPlan(data.plan);
                    if (data.logs) setLogs(data.logs);
                    if (data.inventory) setInventory(data.inventory);
                    if (data.speedModifier) setSpeedModifier(data.speedModifier);
                }

                if (data.isBanned) {
                   alert(t('banned_msg'));
                   logout();
                }
            } else {
                // D. Profile Initialization (The Fix)
                // Ensure boolean value using null coalescing operator
                const isAdminEmail = currentUser.email?.toLowerCase().endsWith('@islamguide.com') ?? false;
                
                const newProfile: UserProfile = {
                    uid: currentUser.uid,
                    email: currentUser.email || '',
                    name: currentUser.displayName || (isAdminEmail ? 'Administrator' : 'New User'),
                    role: isAdminEmail ? 'admin' : 'normal_user',
                    setupComplete: isAdminEmail, // Admins skip onboarding
                    durationMonths: 0
                };

                setUserProfile(newProfile);

                // Persist the new profile immediately so next load finds it
                setDoc(docRef, newProfile).catch(e => 
                    console.error("Failed to auto-create profile:", e)
                );
            }
            setDataLoading(false);
        }, (error) => {
            console.error("Error fetching user data:", error);
            // Don't block UI on error, just stop loading
            setDataLoading(false);
        });

        return () => unsubscribe();
    }
  }, [currentUser, isDemoMode]);

  // 2. Sync Logic (Debounced Write)
  useEffect(() => {
    // Mark as dirty when data changes locally
    if (userProfile?.setupComplete) {
        isDirty.current = true;
    }

    // Local Storage Backup (Always active)
    if (userProfile) localStorage.setItem('taper_profile', JSON.stringify(userProfile));
    if (plan.length > 0) localStorage.setItem('taper_plan', JSON.stringify(plan));
    
    // Cloud Sync (Only for real users)
    if (currentUser && !isDemoMode && userProfile?.setupComplete) {
        
        // Skip sync for doctors who don't have doctor data set up yet
        if (userProfile.role === 'doctor' && !userProfile.doctorData) return;

        const timeoutId = setTimeout(async () => {
            try {
                const totalDays = plan.length;
                const daysCompleted = logs.length;
                const progressPercentage = totalDays > 0 ? (daysCompleted / totalDays) * 100 : 0;

                const updateData: any = {
                    lastActive: new Date().toISOString(),
                    ...(userProfile.name ? { name: userProfile.name } : {})
                };

                if (userProfile.role === 'patient' || userProfile.role === 'normal_user') {
                    updateData.plan = plan;
                    updateData.logs = logs;
                    updateData.inventory = inventory;
                    updateData.speedModifier = speedModifier;
                    updateData.progress = progressPercentage;
                }
                
                if (userProfile.role === 'doctor' && userProfile.doctorData) {
                    updateData.doctorData = userProfile.doctorData;
                }

                await setDoc(doc(db, "users", currentUser.uid), updateData, { merge: true });
                
                isDirty.current = false;

            } catch(e) {
                console.error("Cloud sync failed (offline or permission)", e);
            }
        }, 3000); // 3 seconds debounce

        // Safety net for closing tab
        const handleBeforeUnload = () => {
            if (isDirty.current) {
                localStorage.setItem('pending_sync_logs', JSON.stringify(logs));
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
      setTimeout(() => setDataLoading(false), 800);
  };

  const resetAllData = async () => {
      if (!window.confirm(t('delete_confirm_msg'))) {
          return;
      }

      try {
          setDataLoading(true);
          
          if (currentUser && !isDemoMode) {
              // Delete from Firestore
              await deleteDoc(doc(db, "users", currentUser.uid));
          }
          
          // Clear Local Storage
          localStorage.clear();
          setUserProfile(null);
          setPlan([]);
          setLogs([]);
          setInventory({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
          
          // Logout
          await logout();
          
      } catch (e) {
          console.error("Error resetting data:", e);
          alert("Error deleting data. Check connection.");
          setDataLoading(false);
      }
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
    subtitle: "Neuro-Scientific Recovery Support",
    email: "Email",
    password: "Password",
    login_email: "Login",
    login_google: "Google Login",
    demo_account: "Demo Access",
    error_prefix: "Error: ",
    or: "OR",
    banned_msg: "Account suspended. Please contact support.",
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
    safety_desc: "Biometric instability detected. Doses stabilized temporarily. Please consult your doctor.",
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
    algo_desc: "Safety-first draft generation system.",
    recovery_path: "Projected Path",
    sos_button: "SOS",
    export_report: "Doctor Report",
    print: "Print Report",
    inv_status_ok: "Inventory Sufficient",
    inv_status_low: "Low Inventory",
    inv_alert_desc: "Current pace may deplete inventory before tapering ends. Consult your provider.",
    inventory_title: "Inventory Check",
    boxes: "Full Boxes",
    pills_per_box: "Qty per Box",
    loose_pills: "Loose Qty",
    total_balance: "Total Balance",
    current_habit: "Current Dose",
    analyze_plan: "Generate Draft Plan",
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
    sos_phase_1_text: "You are safe. If this is a medical emergency, call 911 immediately.",
    sos_btn_ground: "Next",
    sos_phase_2_title: "Grounding",
    sos_phase_2_text: "Name 5 blue objects around you.",
    sos_btn_next: "Done",
    sos_phase_3_title: "Thermal Shock",
    sos_phase_3_text: "Splash ice water on your face to reset the vagus nerve.",
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
    pace_desc: "Adjusting speed will recalculate inventory needs. Consult your doctor before changing pace.",
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
    onboard_desc: "This platform is a support tool, not a medical service. Select your role.",
    role_patient: "User / Patient",
    role_patient_desc: "I am managing my medication under medical supervision.",
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
    path_algo_desc: "Generate a draft schedule based on inventory math (Requires Doctor Approval).",
    path_doctor: "Follow with a Doctor",
    path_doctor_desc: "I will choose a doctor from the platform and wait for them to assign a plan.",
    doc_select_title: "Select Your Doctor",
    doc_search_placeholder: "Search by doctor name...",
    doc_select_btn: "Request to Join", 

    med_type_title: "Medication Type",
    med_type_narcotic: "Narcotics (Schedule I)",
    med_type_narcotic_desc: "Requires In-Patient Rehab",
    med_type_psych: "Psychiatric Meds",
    med_type_psych_desc: "Strict Medical Supervision",
    med_type_normal: "General Meds",
    med_type_normal_desc: "Requires Clinical Oversight",
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

    // Scientific Modal
    sci_title: "Your Plan is Scientifically Grounded",
    sci_subtitle: "This algorithm is based on global medical protocols. Review with your doctor.",
    sci_principle_1_title: "Hyperbolic Tapering",
    sci_principle_1_desc: "Reduces the cut rate as the dose gets lower to prevent receptor shock.",
    sci_principle_2_title: "Neuro-Adaptation",
    sci_principle_2_desc: "The plan adapts to your daily logs. If you feel unwell, the system suggests holding the dose.",
    sci_principle_3_title: "Inventory Optimization",
    sci_principle_3_desc: "Calculates the safest path ensuring you don't run out of medication mid-process.",
    sci_sources_title: "Scientific Sources & References:",
    sci_source_1: "The Maudsley Deprescribing Guidelines (Horowitz & Taylor, 2024)",
    sci_source_2: "The Ashton Manual (Benzodiazepines)",
    sci_source_3: "Lancet Psychiatry: Tapering of SSRIs",
    sci_trust_msg: "This system is a calculation tool. It does NOT replace your personal doctor's advice.",
    sci_btn_understood: "I Understand, Proceed to Draft",

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
    collection, doc, writeBatch, getDocs, query, orderBy, Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Article, Ticket, UserProfile } from '../types';

// نتيجة العملية الموحدة
interface ServiceResult {
    success: boolean;
    error?: string;
}

/**
 * Helper to create an audit log reference and data
 */
const createAuditLog = (batch: any, adminUid: string, adminName: string, action: string, details: string, targetId?: string) => {
    const logRef = doc(collection(db, 'audit_logs'));
    batch.set(logRef, {
        adminId: adminUid,
        adminName: adminName,
        action: action,
        details: details,
        targetId: targetId || null,
        timestamp: Date.now()
    });
};

// --- Atomic Admin Actions (Batch Write) ---

/**
 * Approve a doctor and log the action atomically.
 */
export const approveDoctorService = async (
    admin: UserProfile, 
    doctorUid: string, 
    doctorName: string
): Promise<ServiceResult> => {
    if (!admin.uid) return { success: false, error: "Admin ID missing" };

    try {
        const batch = writeBatch(db);
        
        // 1. Update Doctor Status
        const doctorRef = doc(db, 'users', doctorUid);
        batch.update(doctorRef, {
            "doctorData.accountStatus": "approved",
            "doctorData.rejectionReason": null
        });

        // 2. Create Audit Log
        createAuditLog(batch, admin.uid, admin.name, 'APPROVE_DOCTOR', `Approved doctor account for ${doctorName}`, doctorUid);

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        console.error("Approve Doctor Error:", e);
        return { success: false, error: e.message };
    }
};

/**
 * Reject a doctor and log the action atomically.
 */
export const rejectDoctorService = async (
    admin: UserProfile, 
    doctorUid: string, 
    doctorName: string, 
    reason: string
): Promise<ServiceResult> => {
    if (!admin.uid) return { success: false, error: "Admin ID missing" };

    try {
        const batch = writeBatch(db);
        
        const doctorRef = doc(db, 'users', doctorUid);
        batch.update(doctorRef, {
            "doctorData.accountStatus": "rejected",
            "doctorData.rejectionReason": reason
        });

        createAuditLog(batch, admin.uid, admin.name, 'REJECT_DOCTOR', `Rejected doctor ${doctorName}. Reason: ${reason}`, doctorUid);

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

/**
 * Ban/Unban a user and log atomically.
 */
export const toggleBanService = async (
    admin: UserProfile, 
    targetUid: string, 
    targetName: string, 
    newBanStatus: boolean
): Promise<ServiceResult> => {
    if (!admin.uid) return { success: false, error: "Admin ID missing" };

    try {
        const batch = writeBatch(db);
        
        const userRef = doc(db, 'users', targetUid);
        batch.update(userRef, { isBanned: newBanStatus });

        createAuditLog(
            batch, 
            admin.uid, 
            admin.name, 
            newBanStatus ? 'BAN_USER' : 'UNBAN_USER', 
            `${newBanStatus ? 'Banned' : 'Unbanned'} user ${targetName}`, 
            targetUid
        );

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

/**
 * Delete a user and log atomically.
 */
export const deleteUserService = async (
    admin: UserProfile, 
    targetUid: string
): Promise<ServiceResult> => {
    if (!admin.uid) return { success: false, error: "Admin ID missing" };

    try {
        const batch = writeBatch(db);
        
        const userRef = doc(db, 'users', targetUid);
        batch.delete(userRef);

        createAuditLog(batch, admin.uid, admin.name, 'DELETE_USER', `Permanently deleted user ID ${targetUid}`, targetUid);

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

/**
 * Publish article and log atomically.
 */
export const publishArticleService = async (
    admin: UserProfile, 
    article: Omit<Article, 'id' | 'createdAt' | 'authorName' | 'authorId' | 'authorRole'>
): Promise<ServiceResult> => {
    if (!admin.uid) return { success: false, error: "Admin ID missing" };

    try {
        const batch = writeBatch(db);
        
        // Need to create ref first to get ID
        const articleRef = doc(collection(db, 'articles'));
        batch.set(articleRef, {
            ...article,
            createdAt: Date.now(),
            authorName: admin.name,
            authorId: admin.uid,
            authorRole: 'admin',
            isPublished: true
        });

        createAuditLog(batch, admin.uid, admin.name, 'PUBLISH_ARTICLE', `Published article: ${article.title}`, articleRef.id);

        await batch.commit();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

// --- Read Operations (Direct Queries) ---

export const fetchArticles = async () => {
    try {
        const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Article));
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const fetchAllTickets = async () => {
    try {
        const q = query(collection(db, 'tickets'), orderBy('lastUpdate', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Ticket));
    } catch (e) {
        console.error(e);
        return [];
    }
};
```
---

### File: `services\firebase.ts`
```ts
/// <reference types="vite/client" />
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { 
  initializeFirestore, 
  Firestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

// Helper to safely read env variables with fallback
const getEnv = (key: string): string => {
  // @ts-ignore - Vite specific env access
  return import.meta.env[key] || "";
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID")
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore; 
const googleProvider = new GoogleAuthProvider();

try {
  // Validate critical configuration to provide helpful dev feedback
  if (!firebaseConfig.apiKey) {
    console.warn("⚠️ Firebase Configuration is missing. Please check your .env file.");
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Initialize Firestore with Offline Persistence (Multi-tab support)
  // This allows the app to work seamlessly when network is flaky or offline
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
  
  console.log("✅ Firebase initialized with offline persistence enabled.");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  // In a real scenario, you might want to initialize a mock DB or redirect to an error page
}

export { auth, db, googleProvider };
```
---

### File: `services\taperingEngine.ts`
```ts
import { Inventory, PlanDay, DailyLog, ManualPhase, MedForm } from '../types';

// ============================================================================
// 1. CONFIGANTS & UTILS (ثوابت وأدوات)
// ============================================================================

// أقصى نسبة تخفيض مسموحة في الخطوة الواحدة (للسلامة)
const MAX_DROP_PERCENTAGE = 0.5; // 50%

// إضافة أيام للتاريخ بأمان
const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0]; // Fallback to today
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0];
};

// تقريب الأرقام لتجنب مشاكل الفاصلة العائمة (مثلاً 0.1 + 0.2)
const safeRound = (num: number): number => {
    return Math.round(num * 100) / 100;
};

// حساب المخزون الكلي
export const calculateTotalInventory = (inv: Inventory): number => {
    if (!inv) return 0;
    const total = (inv.boxes * (inv.pillsPerBox || 1)) + inv.loosePills;
    return Math.max(0, total); // منع القيم السالبة
};

// ============================================================================
// 2. ENGINE CORE (المحرك المنطقي الآمن)
// ============================================================================

/**
 * المولد اليدوي (للأطباء)
 */
export const generateManualPlan = (phases: ManualPhase[], startDateStr: string): PlanDay[] => {
    if (!phases || !Array.isArray(phases) || phases.length === 0) return [];
    
    const plan: PlanDay[] = [];
    let currentDate = startDateStr.split('T')[0];
    
    phases.forEach(phase => {
        // التحقق من صحة المرحلة
        const safeDose = Math.max(0, safeRound(phase.dose));
        const safeDays = Math.max(1, Math.floor(phase.days)); // يوم واحد على الأقل

        for (let i = 0; i < safeDays; i++) {
            plan.push({ date: currentDate, plannedDose: safeDose, isPast: false });
            currentDate = addDays(currentDate, 1);
        }
    });
    return plan;
};

/**
 * المولد الذكي (الخوارزمية العملية)
 * يتضمن الآن حدوداً للسلامة وتحققاً من المدخلات
 */
export const generatePlan = (
    totalPills: number, 
    startDose: number, 
    startDateStr: string,
    speedModifier: number = 1.0, 
    recentLogs: DailyLog[] = [],
    medForm: MedForm = 'tablet'
): PlanDay[] => {
    
    // 1. Safety Checks (فحوصات السلامة الأولية)
    if (totalPills <= 0 || startDose <= 0) return [];
    if (isNaN(totalPills) || isNaN(startDose)) return [];

    const plan: PlanDay[] = [];
    let currentDate = startDateStr.split('T')[0];
    let remainingInventory = safeRound(totalPills);
    
    // تحديد أقل وحدة كسر (للأقراص 0.5 للنص، وللسائل 0.1)
    const MIN_STEP = medForm === 'liquid' ? 0.1 : 0.5;
    
    // الجرعة الحالية التي سنبدأ التخفيض منها
    let currentDose = safeRound(startDose);

    // --- المرحلة الأولى: التخفيض المباشر (Hyperbolic-like) ---
    // نتوقف عند 0.5 أو عند نفاد المخزون
    // حد الأمان: لا تستمر الحلقة لأكثر من 365 يوماً لتجنب التجميد (Infinite Loop Guard)
    let safetyCounter = 0;
    const MAX_LOOPS = 1000; 

    while (currentDose > 0.5 && remainingInventory >= currentDose && safetyCounter < MAX_LOOPS) {
        safetyCounter++;

        // تحديد مدة الثبات على الجرعة
        // السرعة العادية: 7-14 أيام. كلما قلت الجرعة، زادت المدة (Hyperbolic logic simplified)
        let baseDays = currentDose > (startDose / 2) ? 7 : 10;
        
        // تعديل السرعة بناءً على تفضيل المستخدم
        let daysOnDose = Math.round(baseDays * (1 / speedModifier));
        if (daysOnDose < 3) daysOnDose = 3; // حد أدنى للسلامة: 3 أيام

        // إضافة الأيام للخطة
        for (let i = 0; i < daysOnDose; i++) {
            if (remainingInventory < currentDose) break; 

            plan.push({
                date: currentDate,
                plannedDose: currentDose,
                isPast: false
            });
            remainingInventory = safeRound(remainingInventory - currentDose);
            currentDate = addDays(currentDate, 1);
        }

        // حساب الجرعة التالية
        // القاعدة: لا تخفض أكثر من 50% دفعة واحدة إلا إذا كانت الجرعة صغيرة جداً
        let nextDose = currentDose - 0.5;
        
        // Safety Clamp: إذا كان التخفيض حاداً جداً، نجعله أبطأ (للجرعات العالية)
        if (currentDose > 5 && nextDose < currentDose * (1 - MAX_DROP_PERCENTAGE)) {
            nextDose = currentDose * 0.75; // تخفيض 25% فقط
            // تقريب لأقرب 0.5
            nextDose = Math.round(nextDose * 2) / 2;
        }

        nextDose = safeRound(nextDose);
        
        if (nextDose < 0.5) nextDose = 0.5;
        currentDose = nextDose;
    }

    // --- المرحلة الثانية: نظام تباعد الأيام (Micro-Tapering / Skipping) ---
    if (currentDose === 0.5 && remainingInventory >= 0.5) {
        
        const patterns = [
            { doseSeq: [0.5, 0], cycles: 4 },           // Day ON, Day OFF
            { doseSeq: [0.5, 0, 0], cycles: 3 },        // Day ON, 2 Days OFF
            { doseSeq: [0.5, 0, 0, 0], cycles: 2 },     // Day ON, 3 Days OFF
            { doseSeq: [0.5, 0, 0, 0, 0], cycles: 2 }   // Day ON, 4 Days OFF
        ];

        for (const pattern of patterns) {
            const adjustedCycles = Math.max(1, Math.round(pattern.cycles * (1 / speedModifier)));

            for (let c = 0; c < adjustedCycles; c++) {
                for (const dose of pattern.doseSeq) {
                    if (dose > 0 && remainingInventory < dose) break; 

                    plan.push({
                        date: currentDate,
                        plannedDose: dose,
                        isPast: false
                    });

                    if (dose > 0) remainingInventory = safeRound(remainingInventory - dose);
                    currentDate = addDays(currentDate, 1);
                }
                if (remainingInventory < 0.5) break;
            }
            if (remainingInventory < 0.5) break;
        }
    }

    return plan;
};

// --- إعادة الحساب الديناميكي ---
export const adjustPlan = (
    originalPlan: PlanDay[],
    logs: DailyLog[],
    totalInitialInventory: number, 
    speedModifier: number = 1.0,
    medForm: MedForm = 'tablet'
): PlanDay[] => {
    
    // ترتيب السجلات
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedLogs.length === 0) {
        return originalPlan.length > 0 
            ? generatePlan(totalInitialInventory, originalPlan[0].plannedDose, originalPlan[0].date, speedModifier, [], medForm)
            : [];
    }

    const lastLog = sortedLogs[sortedLogs.length - 1];
    const totalUsed = sortedLogs.reduce((acc, log) => acc + log.doseTaken, 0);
    const remainingInventory = Math.max(0, safeRound(totalInitialInventory - totalUsed));

    // الاحتفاظ بالتاريخ
    const historyDays = originalPlan.filter(day => day.date <= lastLog.date).map(day => {
        const log = sortedLogs.find(l => l.date === day.date);
        return { ...day, isPast: true, log: log || undefined };
    });

    // نقطة الانطلاق الجديدة
    let startPoint = lastLog.doseTaken;
    if (startPoint === 0) {
        const lastActive = [...sortedLogs].reverse().find(l => l.doseTaken > 0);
        startPoint = lastActive ? lastActive.doseTaken : (originalPlan[0]?.plannedDose || 0.5);
    }

    // توليد المستقبل
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
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, FileText, Image, Tag, AlignLeft, X, Clock, AlertCircle } from 'lucide-react';
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
    const { t, language } = useLanguage();
    const [showArticleModal, setShowArticleModal] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'tip' as ArticleCategory });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Focus management refs
    const modalRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (showArticleModal) {
            setTimeout(() => titleInputRef.current?.focus(), 100);
        }
        setErrorMsg(null);
    }, [showArticleModal]);

    const handlePublish = () => {
        if (!newArticle.title.trim() || newArticle.title.length < 5) {
            setErrorMsg(language === 'ar' ? "العنوان قصير جداً (5 أحرف على الأقل)." : "Title too short (min 5 chars).");
            return;
        }
        if (!newArticle.content.trim() || newArticle.content.length < 20) {
            setErrorMsg(language === 'ar' ? "المحتوى قصير جداً." : "Content too short.");
            return;
        }

        publishArticle(newArticle);
        setShowArticleModal(false);
        setNewArticle({ title: '', content: '', category: 'tip' });
    };

    const getCategoryColor = (cat: string) => {
        switch(cat) {
            case 'medical': return 'indigo';
            case 'motivation': return 'rose';
            case 'news': return 'blue';
            default: return 'amber';
        }
    };

    return (
        <section aria-labelledby="cms-heading" className="animate-in fade-in space-y-8">
            {/* Header Action */}
            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <h2 id="cms-heading" className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                        <FileText size={20} className="text-indigo-400" aria-hidden="true"/>
                    </div>
                    {t('tab_cms')}
                </h2>
                <Button onClick={() => setShowArticleModal(true)} variant="primary" className="!py-2.5 !px-5 !text-sm !rounded-xl shadow-lg shadow-indigo-500/20" aria-label={t('new_article_btn')}>
                    <Plus size={18} className="mr-2" aria-hidden="true"/> {t('new_article_btn')}
                </Button>
            </div>

            {/* Create Article Modal */}
            {showArticleModal && (
                 <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-in zoom-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                 >
                     {/* Wrapper div for ref to avoid functional component issue */}
                     <div className="w-full max-w-2xl relative outline-none" tabIndex={-1} ref={modalRef}>
                         <Card className="!bg-slate-900 border-white/10 shadow-2xl rounded-[2rem] overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                             
                             <div className="p-8">
                                 <div className="flex justify-between items-start mb-8">
                                    <h3 id="modal-title" className="text-2xl font-black text-white">{t('new_article_btn')}</h3>
                                    <button 
                                        onClick={() => setShowArticleModal(false)} 
                                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        aria-label={t('close')}
                                    >
                                        <X size={24} />
                                    </button>
                                 </div>

                                 {errorMsg && (
                                     <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-300 text-sm font-bold" role="alert">
                                         <AlertCircle size={20} />
                                         {errorMsg}
                                     </div>
                                 )}

                                 <div className="space-y-6">
                                     <div className="group">
                                         <label htmlFor="art-title" className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{t('article_title_label')}</label>
                                         <div className="relative">
                                             <FileText className="absolute top-4 right-4 text-slate-600 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={18} />
                                             <input 
                                                 id="art-title"
                                                 ref={titleInputRef}
                                                 className="w-full bg-slate-950/50 p-4 pr-12 rounded-xl text-white border border-white/10 outline-none focus:border-indigo-500 transition-all placeholder-slate-700 font-bold text-lg focus:ring-1 focus:ring-indigo-500" 
                                                 placeholder="Article Title..."
                                                 value={newArticle.title} 
                                                 onChange={e => setNewArticle({...newArticle, title: e.target.value})} 
                                                 maxLength={100}
                                             />
                                         </div>
                                     </div>
                                     
                                     <div role="group" aria-labelledby="cat-label">
                                         <label id="cat-label" className="text-xs font-bold text-slate-500 uppercase mb-3 block ml-1">{t('article_cat_label')}</label>
                                         <div className="flex gap-3 flex-wrap">
                                             {(['medical', 'motivation', 'tip', 'news'] as const).map(cat => (
                                                 <button 
                                                    key={cat}
                                                    onClick={() => setNewArticle({...newArticle, category: cat})}
                                                    aria-pressed={newArticle.category === cat}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                        newArticle.category === cat 
                                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                                                        : 'bg-slate-950 border-white/10 text-slate-500 hover:bg-slate-800 hover:text-white'
                                                    }`}
                                                 >
                                                     {cat.toUpperCase()}
                                                 </button>
                                             ))}
                                         </div>
                                     </div>

                                     <div className="group">
                                         <label htmlFor="art-content" className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{t('article_content_label')}</label>
                                         <textarea 
                                             id="art-content"
                                             className="w-full bg-slate-950/50 p-4 rounded-xl text-white border border-white/10 h-40 outline-none focus:border-indigo-500 transition-all resize-none placeholder-slate-700 custom-scrollbar focus:ring-1 focus:ring-indigo-500" 
                                             placeholder="Write something amazing..."
                                             value={newArticle.content} 
                                             onChange={e => setNewArticle({...newArticle, content: e.target.value})} 
                                             maxLength={5000}
                                         />
                                         <p className="text-right text-[10px] text-slate-600 mt-1">{newArticle.content.length}/5000</p>
                                     </div>
                                     
                                     <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                         <Button variant="secondary" onClick={() => setShowArticleModal(false)}>{t('cancel_btn')}</Button>
                                         <Button variant="success" onClick={handlePublish}>
                                             {t('publish_now')}
                                         </Button>
                                     </div>
                                 </div>
                             </div>
                         </Card>
                     </div>
                 </div>
            )}

            {/* Articles Grid */}
            {articles.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
                    <Image size={48} className="mx-auto mb-4 opacity-20" aria-hidden="true"/>
                    <p>No articles published yet.</p>
                </div>
            ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                    {articles.map(art => (
                        <li key={art.id} className="group relative bg-slate-900/60 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/10 flex flex-col h-full focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-950">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none"></div>
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <Badge color={getCategoryColor(art.category) as any} className="shadow-none bg-slate-950/50 border-white/10">
                                    {art.category.toUpperCase()}
                                </Badge>
                                <button 
                                    onClick={() => art.id && deleteArticle(art.id)}
                                    className="text-slate-600 hover:text-rose-500 p-2 hover:bg-rose-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none focus:ring-2 focus:ring-rose-500"
                                    title="Delete Article"
                                    aria-label={`Delete article: ${art.title}`}
                                >
                                    <Trash2 size={16} aria-hidden="true"/>
                                </button>
                            </div>

                            <h3 className="font-bold text-white text-lg mb-3 line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
                                {art.title}
                            </h3>
                            
                            <div className="flex-1 mb-4">
                                <p className="text-xs text-slate-400 line-clamp-4 leading-relaxed bg-slate-950/30 p-3 rounded-xl border border-white/5">
                                    {art.content}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-auto pt-4 border-t border-white/5">
                                <Clock size={12} aria-hidden="true"/>
                                {new Date(art.createdAt).toLocaleDateString()}
                                <span className="mx-1" aria-hidden="true">•</span>
                                <span className="text-slate-400 font-bold">{art.authorName}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};
```
---

### File: `views\admin\AdminDoctors.tsx`
```tsx
import React, { useMemo } from 'react';
import { Lock, Stethoscope, Eye, Ban, Trash2, ShieldCheck, MapPin } from 'lucide-react';
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
    const { t, language } = useLanguage();
    
    // Performance: Memoize filtering to prevent re-calculation on every render
    const { pendingDoctors, approvedDoctors } = useMemo(() => {
        const doctors = users.filter(u => u.role === 'doctor');
        return {
            pendingDoctors: doctors.filter(d => d.doctorData?.accountStatus === 'pending'),
            approvedDoctors: doctors.filter(d => d.doctorData?.accountStatus === 'approved')
        };
    }, [users]);

    return (
        <div className="space-y-10 animate-in fade-in">
             {/* 1. Pending Approvals Section */}
             <section aria-labelledby="pending-heading" className="space-y-6">
                 <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                     <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <Lock className="text-amber-500" size={20} aria-hidden="true" />
                     </div>
                     <h2 id="pending-heading" className="text-xl font-bold text-white">
                         {t('pending_approvals')}
                         <span className="ml-3 text-sm bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-white/5" aria-label={`${pendingDoctors.length} requests`}>{pendingDoctors.length}</span>
                     </h2>
                 </div>
                 
                 {pendingDoctors.length === 0 ? (
                     <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-500 flex flex-col items-center justify-center">
                         <ShieldCheck className="mb-4 opacity-20" size={48} aria-hidden="true" />
                         <p>{language === 'ar' ? 'لا توجد طلبات معلقة.' : 'No pending requests. All clear.'}</p>
                     </div>
                 ) : (
                     <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                        {pendingDoctors.map(doc => (
                            <li key={doc.uid} className="group relative bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:border-amber-500/30 transition-all duration-300 shadow-lg hover:shadow-amber-900/10 list-none">
                                <div className="absolute top-0 right-0 p-6 opacity-50">
                                    <Badge color="amber" className="shadow-none bg-amber-500/10 border-amber-500/20">Pending</Badge>
                                </div>
                                
                                <div className="flex flex-col items-center text-center mb-6 pt-4">
                                    <div className="w-20 h-20 mb-4 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 text-2xl font-bold border border-white/5 shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                                        {doc.doctorData?.photoUrl ? (
                                            <img src={doc.doctorData.photoUrl} alt={`Photo of Dr. ${doc.name}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <span aria-hidden="true">{doc.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-white text-xl mb-1">{doc.name}</h3>
                                    <p className="text-sm text-slate-400 flex items-center gap-1">
                                        <Stethoscope size={12} aria-hidden="true"/> {doc.doctorData?.specialty}
                                    </p>
                                </div>
                                
                                <div className="space-y-2 mb-6">
                                    <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-xs text-slate-400 flex justify-between">
                                        <span>License:</span>
                                        <span className="text-white font-mono">{doc.doctorData?.licenseNumber}</span>
                                    </div>
                                    <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-xs text-slate-400 flex justify-between">
                                        <span>Location:</span>
                                        <span className="text-white truncate max-w-[120px]">{doc.doctorData?.clinicLocation}</span>
                                    </div>
                                </div>
                                
                                <Button 
                                    onClick={() => setSelectedDoctor(doc)} 
                                    variant="secondary" 
                                    className="w-full !py-3 border-white/5 hover:border-white/20 hover:bg-white/5"
                                    aria-label={`${t('view_details')} ${doc.name}`}
                                >
                                    <Eye size={16} className="mr-2" aria-hidden="true"/> {t('view_details')}
                                </Button>
                            </li>
                        ))}
                     </ul>
                 )}
             </section>

             {/* 2. Active Doctors List */}
             <section aria-labelledby="approved-heading" className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                     <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <Stethoscope className="text-emerald-500" size={20} aria-hidden="true" />
                     </div>
                     <h2 id="approved-heading" className="text-xl font-bold text-white">
                         {t('approved_docs_list')}
                         <span className="ml-3 text-sm bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-white/5" aria-label={`${approvedDoctors.length} doctors`}>{approvedDoctors.length}</span>
                     </h2>
                </div>

                <Card className="bg-slate-900/60 border-white/10 overflow-hidden !p-0 backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <caption className="sr-only">Table of approved doctors</caption>
                            <thead className="bg-slate-950/80 text-slate-500 uppercase font-bold text-xs tracking-wider">
                                <tr>
                                    <th className="p-5" scope="col">Doctor</th>
                                    <th className="p-5" scope="col">Specialty</th>
                                    <th className="p-5 text-center" scope="col">Patients</th>
                                    <th className="p-5 text-center" scope="col">Level</th>
                                    <th className="p-5 text-center" scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {approvedDoctors.length === 0 && (
                                    <tr><td colSpan={5} className="p-12 text-center text-slate-600">No approved doctors registered yet.</td></tr>
                                )}
                                {approvedDoctors.map(doc => {
                                    const patientCount = users.filter(u => u.patientData?.assignedDoctorId === doc.uid && !u.patientData?.isRecovered).length;
                                    const level = Math.floor((doc.doctorData?.recoveredCount || 0) / 5) + 1;

                                    return (
                                        <tr key={doc.uid} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-5 font-bold text-white flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 group-hover:scale-110 transition-transform overflow-hidden">
                                                    {doc.doctorData?.photoUrl ? (
                                                        <img src={doc.doctorData.photoUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span aria-hidden="true">{doc.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-base">{doc.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono font-normal flex items-center gap-1 mt-0.5">
                                                        <MapPin size={10} aria-hidden="true"/> {doc.doctorData?.clinicLocation || 'Online'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <Badge color="blue" className="bg-blue-500/10 border-blue-500/20 text-blue-300 shadow-none">
                                                    {doc.doctorData?.specialty}
                                                </Badge>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className="font-mono font-bold text-white bg-slate-800 px-3 py-1 rounded-lg border border-white/5" title="Active Patients">
                                                    {patientCount}
                                                </span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                                                    LVL {level}
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => setSelectedDoctor(doc)} 
                                                        className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors border border-blue-500/20 outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
                                                        title={t('view_details')}
                                                        aria-label={`${t('view_details')} ${doc.name}`}
                                                    >
                                                        <Eye size={16} aria-hidden="true"/>
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleBan(doc)} 
                                                        className="p-2 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500 hover:text-white transition-colors border border-amber-500/20 outline-none focus-visible:ring-2 focus-visible:ring-amber-500" 
                                                        title={doc.isBanned ? t('unban_user') : t('ban_user')}
                                                        aria-label={doc.isBanned ? `${t('unban_user')} ${doc.name}` : `${t('ban_user')} ${doc.name}`}
                                                    >
                                                        <Ban size={16} aria-hidden="true"/>
                                                    </button>
                                                    <button 
                                                        onClick={() => doc.uid && deleteUser(doc.uid)} 
                                                        className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-colors border border-rose-500/20 outline-none focus-visible:ring-2 focus-visible:ring-rose-500" 
                                                        title={t('delete_user')}
                                                        aria-label={`${t('delete_user')} ${doc.name}`}
                                                    >
                                                        <Trash2 size={16} aria-hidden="true"/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
             </section>
        </div>
    );
};
```
---

### File: `views\admin\AdminOverview.tsx`
```tsx
import React, { useMemo } from 'react';
import { Lock, CheckCircle, Users, Activity, AlertCircle, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { UserProfile } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminOverviewProps {
    users: UserProfile[];
    setActiveTab: (tab: any) => void;
}

export const AdminOverview = ({ users, setActiveTab }: AdminOverviewProps) => {
    const { t, language } = useLanguage();

    const doctorsList = users.filter(u => u.role === 'doctor');
    const pendingDoctors = doctorsList.filter(d => d.doctorData?.accountStatus === 'pending');
    const approvedDoctors = doctorsList.filter(d => d.doctorData?.accountStatus === 'approved');
    const normalUsers = users.filter(u => u.role === 'normal_user' || u.role === 'patient');
    const recoveredUsers = users.filter(u => u.patientData?.isRecovered);

    const stats = useMemo(() => {
        return [
            { name: t('stat_total_patients'), value: normalUsers.length, color: '#6366f1', icon: Users },
            { name: t('stat_approved_docs'), value: approvedDoctors.length, color: '#10b981', icon: CheckCircle },
            { name: t('stat_recovered'), value: recoveredUsers.length, color: '#f59e0b', icon: Activity },
            { name: t('pending_approvals'), value: pendingDoctors.length, color: '#f43f5e', icon: Lock },
        ];
    }, [users, t, normalUsers.length, approvedDoctors.length, recoveredUsers.length, pendingDoctors.length]);

    const pieData = [
        { name: 'Active', value: Math.max(0, normalUsers.length - recoveredUsers.length), color: '#6366f1' },
        { name: 'Recovered', value: recoveredUsers.length, color: '#10b981' },
    ];

    const recoveryRate = normalUsers.length > 0 ? Math.round((recoveredUsers.length / normalUsers.length) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Stats Grid */}
            <section aria-label={language === 'ar' ? 'الإحصائيات العامة' : 'General Statistics'}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            <Card className="relative bg-slate-900/80 border-white/5 p-6 flex flex-col justify-between h-32 overflow-hidden group-hover:border-white/10 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" aria-hidden="true">
                                    <stat.icon size={64} color={stat.color} />
                                </div>
                                <div>
                                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{stat.name}</h3>
                                    <div className="text-4xl font-black text-white" style={{ textShadow: `0 0 20px ${stat.color}40` }}>
                                        {stat.value}
                                    </div>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full mt-4 overflow-hidden" role="progressbar" aria-valuenow={70} aria-valuemin={0} aria-valuemax={100} aria-label="Indicator">
                                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '70%', backgroundColor: stat.color }}></div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <section className="lg:col-span-2" aria-labelledby="overview-chart-title">
                    <Card className="bg-slate-900/80 border-white/5 min-h-[350px] flex flex-col relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        <h3 id="overview-chart-title" className="text-white font-bold mb-6 flex items-center gap-2 z-10">
                            <Activity size={20} className="text-indigo-400" aria-hidden="true"/> {t('stat_overview')}
                        </h3>
                        
                        <div className="flex-1 w-full min-h-[250px] z-10" aria-hidden="true">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <defs>
                                        {stats.map((entry, index) => (
                                            <linearGradient key={`grad-${index}`} id={`color-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={entry.color} stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor={entry.color} stopOpacity={0.1}/>
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <XAxis dataKey="name" stroke="#475569" fontSize={12} tick={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'}} 
                                        cursor={{fill: 'rgba(255,255,255,0.05)', radius: 8}}
                                        itemStyle={{color: '#fff', fontWeight: 'bold'}}
                                    />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50} animationDuration={1500}>
                                        {stats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={`url(#color-${index})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Hidden Table for Screen Readers */}
                        <div className="sr-only">
                            <table>
                                <caption>{language === 'ar' ? 'جدول نظرة عامة على الإحصائيات' : 'Overview Statistics Table'}</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">{language === 'ar' ? 'الفئة' : 'Category'}</th>
                                        <th scope="col">{language === 'ar' ? 'العدد' : 'Count'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.map((stat, i) => (
                                        <tr key={i}>
                                            <td>{stat.name}</td>
                                            <td>{stat.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </section>
                
                {/* Pending Requests & Ratio */}
                <div className="flex flex-col gap-6">
                    <section aria-labelledby="pending-title" className="flex-1">
                        <Card className="bg-slate-900/80 border-white/5 h-full relative overflow-hidden flex flex-col">
                            <h3 id="pending-title" className="text-white font-bold mb-4 flex items-center gap-2">
                                <Lock size={18} className="text-amber-500" aria-hidden="true"/> {t('pending_approvals')}
                            </h3>
                            {pendingDoctors.length === 0 ? (
                                <div className="text-center text-slate-500 py-8 flex flex-col items-center justify-center h-full flex-1">
                                    <CheckCircle size={40} className="mb-3 text-emerald-500/20" aria-hidden="true"/>
                                    <p className="text-sm">All clear! No pending requests.</p>
                                </div>
                            ) : (
                                <ul className="space-y-3 flex-1">
                                    {pendingDoctors.slice(0, 3).map(doc => (
                                        <li key={doc.uid} className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all group">
                                            <div>
                                                <div className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">{doc.name}</div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{doc.doctorData?.specialty}</div>
                                            </div>
                                            <Button 
                                                onClick={() => setActiveTab('doctors')} 
                                                variant="secondary" 
                                                className="!py-1.5 !px-3 !text-xs !rounded-lg"
                                                aria-label={`${t('review_btn')} ${doc.name}`}
                                            >
                                                {t('review_btn')}
                                            </Button>
                                        </li>
                                    ))}
                                    {pendingDoctors.length > 3 && (
                                        <li className="text-center pt-2">
                                            <button 
                                                onClick={() => setActiveTab('doctors')} 
                                                className="text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                                            >
                                                + {pendingDoctors.length - 3} more <ArrowRight size={12} />
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </Card>
                    </section>

                    <section aria-labelledby="recovery-rate-title" className="h-48">
                        <Card className="bg-slate-900/80 border-white/5 h-full relative overflow-hidden flex items-center justify-center">
                             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>
                             <h3 id="recovery-rate-title" className="sr-only">Recovery Rate</h3>
                             
                             <div className="w-full h-full" aria-hidden="true">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px'}} itemStyle={{color: '#fff'}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                             </div>
                             
                             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-white">{recoveryRate}%</span>
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest">Recovery Rate</span>
                             </div>

                             {/* Hidden Description for Recovery Rate */}
                             <div className="sr-only">
                                 {language === 'ar' ? `معدل التعافي: ${recoveryRate} بالمائة.` : `Recovery Rate: ${recoveryRate} percent.`}
                             </div>
                        </Card>
                    </section>
                </div>
            </div>
        </div>
    );
};
```
---

### File: `views\admin\AdminUsers.tsx`
```tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Ban, Trash2, User, Shield, Stethoscope, Mail, CheckCircle, Smartphone, Calendar, Eye, X, Activity, Ruler, Weight, Send, MessageSquare, Loader2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { UserProfile } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/Button'; 
import { Card } from '../../components/ui/Card';     

interface AdminUsersProps {
    users: UserProfile[];
    toggleBan: (user: UserProfile) => void;
    deleteUser: (uid: string) => void;
}

export const AdminUsers = ({ users, toggleBan, deleteUser }: AdminUsersProps) => {
    const { t, language, dir } = useLanguage();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Message State
    const [showMsgForm, setShowMsgForm] = useState(false);
    const [msgSubject, setMsgSubject] = useState("");
    const [msgContent, setMsgContent] = useState("");
    const [isSending, setIsSending] = useState(false);

    // Focus management for accessibility
    useEffect(() => {
        if (selectedUser) {
            setTimeout(() => modalRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setShowMsgForm(false);
            setMsgSubject("");
            setMsgContent("");
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedUser]);

    // Performance: Memoize filtering
    const filteredUsers = useMemo(() => {
        const lowerTerm = searchTerm.toLowerCase();
        return users.filter(u => 
            (u.role === 'normal_user' || u.role === 'patient') &&
            (u.name.toLowerCase().includes(lowerTerm) || u.email.toLowerCase().includes(lowerTerm))
        );
    }, [users, searchTerm]);

    const handleCloseModal = () => setSelectedUser(null);

    const handleSendMessage = async () => {
        if (!selectedUser?.uid || !msgSubject.trim() || !msgContent.trim()) return;
        
        setIsSending(true);
        try {
            // FIX: Safe access to auth using optional chaining
            const adminUser = auth?.currentUser;
            
            await addDoc(collection(db, "tickets"), {
                userId: selectedUser.uid,
                userEmail: selectedUser.email,
                subject: `[Admin] ${msgSubject}`,
                status: 'open',
                createdAt: Date.now(),
                lastUpdate: Date.now(),
                messages: [{
                    senderId: adminUser?.uid || 'admin',
                    senderName: 'Administrator',
                    text: msgContent,
                    timestamp: Date.now(),
                    isAdmin: true
                }]
            });
            alert(language === 'ar' ? "تم إرسال الرسالة بنجاح" : "Message sent successfully");
            setShowMsgForm(false);
            setMsgSubject("");
            setMsgContent("");
        } catch (e) {
            console.error("Failed to send message", e);
            alert("Error sending message");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <section aria-labelledby="users-section-title" className="space-y-8 animate-in fade-in">
            <h2 id="users-section-title" className="sr-only">{language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}</h2>

            {/* Search Bar */}
            <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                    <div className="p-3 bg-slate-800 rounded-xl text-slate-400">
                        <Search size={20} aria-hidden="true" />
                    </div>
                    <label htmlFor="user-search" className="sr-only">{t('search_user_placeholder')}</label>
                    <input 
                        id="user-search"
                        className="w-full bg-transparent border-none text-white px-4 py-2 outline-none placeholder-slate-500 font-medium"
                        placeholder={t('search_user_placeholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="px-4 text-xs text-slate-500 font-bold uppercase tracking-wider hidden md:block" aria-live="polite">
                        {filteredUsers.length} {language === 'ar' ? 'مستخدم' : 'Users'}
                    </div>
                </div>
            </div>

            {/* Users Grid */}
            {filteredUsers.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600 bg-slate-900/20" role="status">
                    <User size={48} className="mx-auto mb-4 opacity-20" aria-hidden="true"/>
                    <p>{language === 'ar' ? `لا توجد نتائج بحث مطابقة لـ "${searchTerm}"` : `No users found matching "${searchTerm}"`}</p>
                </div>
            ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
                    {filteredUsers.map(user => (
                        <li key={user.uid} className="group relative bg-slate-900/60 border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 hover:bg-slate-900/90 transition-all duration-300 overflow-hidden shadow-lg list-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-950">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
                            
                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div 
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl border shadow-inner transition-transform group-hover:scale-105 ${user.isBanned ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-slate-800 text-slate-300 border-white/5'}`}
                                        aria-hidden="true"
                                    >
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                            {user.name}
                                            {user.isBanned && <Badge color="red" className="!py-0 !px-1.5 text-[9px]">BANNED</Badge>}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge color={user.role === 'patient' ? 'indigo' : 'blue'} className="bg-slate-950/50 border-white/5 shadow-none">
                                                {user.role === 'patient' ? 'Patient' : 'User'}
                                            </Badge>
                                            {user.planType && (
                                                <span className="text-[10px] text-slate-500 bg-slate-950/30 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wider">
                                                    {user.planType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 relative z-10">
                                <div className="flex items-center gap-3 text-sm text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                                    <Mail size={14} className="text-slate-500" aria-hidden="true"/> 
                                    <span className="truncate">{user.email}</span>
                                </div>
                                {user.patientData?.assignedDoctorName ? (
                                    <div className="flex items-center gap-3 text-sm text-indigo-300 bg-indigo-900/10 p-3 rounded-xl border border-indigo-500/10">
                                        <Stethoscope size={14} aria-hidden="true"/> 
                                        <span>Dr. {user.patientData.assignedDoctorName}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-950/40 p-3 rounded-xl border border-white/5 border-dashed">
                                        <Shield size={14} aria-hidden="true"/> 
                                        <span>{language === 'ar' ? 'لا يوجد طبيب مشرف' : 'No Doctor Assigned'}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-[10px] text-slate-600 px-1 font-mono">
                                    <span className="flex items-center gap-1"><Smartphone size={10}/> ID: {user.uid?.slice(0,6)}</span>
                                    <span className="flex items-center gap-1"><Calendar size={10}/> {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 relative z-10 pt-2 border-t border-white/5">
                                <button 
                                    onClick={() => setSelectedUser(user)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    aria-label={language === 'ar' ? 'عرض الملف' : 'View Profile'}
                                >
                                    <Eye size={14} aria-hidden="true" />
                                    {language === 'ar' ? 'عرض الملف' : 'View Profile'}
                                </button>

                                <button 
                                    onClick={() => toggleBan(user)} 
                                    className={`p-2.5 rounded-xl text-xs font-bold transition-all border outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                                        user.isBanned 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white focus-visible:ring-emerald-500' 
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500 hover:text-white focus-visible:ring-amber-500'
                                    }`}
                                    title={user.isBanned ? t('unban_user') : t('ban_user')}
                                    aria-label={user.isBanned ? t('unban_user') : t('ban_user')}
                                >
                                    {user.isBanned ? <CheckCircle size={16} aria-hidden="true"/> : <Ban size={16} aria-hidden="true"/>}
                                </button>
                                
                                <button 
                                    onClick={() => user.uid && deleteUser(user.uid)} 
                                    className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-rose-500"
                                    title={t('delete_user')}
                                    aria-label={`${t('delete_user')} ${user.name}`}
                                >
                                    <Trash2 size={16} aria-hidden="true"/>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* USER DETAILS MODAL */}
            {selectedUser && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in duration-300"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="user-modal-title"
                >
                    <div 
                        ref={modalRef}
                        tabIndex={-1}
                        className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden outline-none flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-600/20 to-transparent pointer-events-none"></div>
                        <button 
                            onClick={handleCloseModal}
                            className="absolute top-6 right-6 p-2 bg-slate-800/50 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label={t('close')}
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 pt-10 relative z-10 overflow-y-auto custom-scrollbar">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-400 border-4 border-slate-950 shadow-xl">
                                    {selectedUser.name.charAt(0).toUpperCase()}
                                </div>
                                <h2 id="user-modal-title" className="text-2xl font-black text-white">{selectedUser.name}</h2>
                                <p className="text-slate-500 font-mono text-xs mt-1">{selectedUser.email}</p>
                                {selectedUser.isBanned && (
                                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                                        ACCOUNT BANNED
                                    </span>
                                )}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-center">
                                    <Activity size={18} className="mx-auto mb-2 text-indigo-400" />
                                    <span className="block text-xs text-slate-500 uppercase font-bold">Progress</span>
                                    <span className="block text-lg font-black text-white">{Math.round(selectedUser.progress || 0)}%</span>
                                </div>
                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-center">
                                    <Weight size={18} className="mx-auto mb-2 text-emerald-400" />
                                    <span className="block text-xs text-slate-500 uppercase font-bold">Weight</span>
                                    <span className="block text-lg font-black text-white">{selectedUser.weight || '-'} <span className="text-xs text-slate-600">kg</span></span>
                                </div>
                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-center">
                                    <Ruler size={18} className="mx-auto mb-2 text-amber-400" />
                                    <span className="block text-xs text-slate-500 uppercase font-bold">Age</span>
                                    <span className="block text-lg font-black text-white">{selectedUser.age || '-'}</span>
                                </div>
                            </div>

                            {/* Actions / Message Toggle */}
                            <div className="mb-6">
                                {!showMsgForm ? (
                                    <Button 
                                        onClick={() => setShowMsgForm(true)} 
                                        variant="secondary" 
                                        className="w-full !py-3 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500 hover:text-white"
                                    >
                                        <MessageSquare size={18} className="mr-2" /> {language === 'ar' ? 'إرسال رسالة خاصة' : 'Send Direct Message'}
                                    </Button>
                                ) : (
                                    <div className="bg-slate-950/80 p-5 rounded-2xl border border-indigo-500/30 animate-in slide-in-from-top-2">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-bold text-white flex items-center gap-2"><Send size={14} className="text-indigo-400"/> New Message</h4>
                                            <button onClick={() => setShowMsgForm(false)} className="text-slate-500 hover:text-white text-xs">Cancel</button>
                                        </div>
                                        <input 
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white text-sm focus:border-indigo-500 outline-none"
                                            placeholder="Subject"
                                            value={msgSubject}
                                            onChange={(e) => setMsgSubject(e.target.value)}
                                        />
                                        <textarea 
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 mb-4 text-white text-sm focus:border-indigo-500 outline-none h-24 resize-none"
                                            placeholder="Message content..."
                                            value={msgContent}
                                            onChange={(e) => setMsgContent(e.target.value)}
                                        />
                                        <Button 
                                            onClick={handleSendMessage} 
                                            variant="primary" 
                                            className="w-full !py-2" 
                                            disabled={!msgSubject.trim() || !msgContent.trim() || isSending}
                                        >
                                            {isSending ? <Loader2 className="animate-spin" size={18} /> : "Send Ticket"}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Medical Info */}
                            <div className="space-y-4 bg-slate-950/30 p-5 rounded-3xl border border-white/5">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                    <Activity size={14} /> Clinical Profile
                                </h3>
                                <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                                    <span className="text-slate-500">Medication</span>
                                    <span className="text-white font-bold">{selectedUser.medType || 'Not Set'}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                                    <span className="text-slate-500">Form</span>
                                    <span className="text-white font-bold">{selectedUser.medForm || '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                                    <span className="text-slate-500">Plan Type</span>
                                    <span className="text-indigo-400 font-bold uppercase">{selectedUser.planType || 'None'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Last Active</span>
                                    <span className="text-white font-mono">{selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleDateString() : 'Never'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-white/5 bg-slate-900/50 backdrop-blur-md">
                            <Button onClick={handleCloseModal} variant="secondary" className="w-full rounded-xl">
                                {t('close')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
```
---

### File: `views\dashboard\DailyCheckIn.tsx`
```tsx
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
    
    // Logic to generate sensible dose options around the target
    const doseOptions = Array.from({ length: 5 }, (_, i) => {
        const val = target - (2 * baseStep) + (i * baseStep);
        return Math.max(0, parseFloat(val.toFixed(2)));
    }).filter((v, i, a) => a.indexOf(v) === i && v >= 0);

    if (!doseOptions.includes(target)) doseOptions.push(target);
    doseOptions.sort((a,b) => a - b);

    return (
        <div className="space-y-10 animate-in fade-in" role="form" aria-label={t('daily_report')}>
            {/* Step 1: Dose Selector */}
            <section aria-labelledby="dose-label">
                <p id="dose-label" className="text-indigo-200/60 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 font-black ${selectedDose !== null ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'bg-white/10 text-slate-400'}`}>1</span>
                    {t('step_1')}
                </p>
                
                <div 
                    className="flex flex-wrap gap-3" 
                    role="radiogroup" 
                    aria-labelledby="dose-label"
                >
                    {!isCustomDose && doseOptions.map(val => {
                        const isSelected = selectedDose === val;
                        return (
                            <button
                                key={val}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => setSelectedDose(val)}
                                className={`
                                    relative min-w-[4.5rem] h-16 rounded-2xl font-mono font-bold text-lg transition-all duration-300 border
                                    flex items-center justify-center overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                                    ${isSelected
                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-110 z-10'
                                    : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800 hover:border-white/20 hover:text-white'}
                                `}
                            >
                                <span className="relative z-10">{val}</span>
                                {val === todayPlan?.plannedDose && (
                                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" aria-label="Target Dose"></span>
                                )}
                                {isSelected && <div className="absolute inset-0 bg-white/20 blur-md"></div>}
                            </button>
                        );
                    })}

                    <button
                         type="button"
                         onClick={() => setIsCustomDose(!isCustomDose)}
                         aria-label={isCustomDose ? "Cancel custom dose" : "Enter custom dose"}
                         className={`
                             min-w-[4.5rem] h-16 rounded-2xl border border-dashed transition-all flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                             ${isCustomDose
                             ? 'bg-slate-800 border-indigo-500 text-indigo-400'
                             : 'bg-transparent border-slate-700 text-slate-600 hover:border-slate-500 hover:text-slate-400'}
                         `}
                    >
                        <Edit3 size={20} aria-hidden="true" />
                    </button>

                    {isCustomDose && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
                            <label htmlFor="custom-dose-input" className="sr-only">Custom Dose Value</label>
                            <input
                                id="custom-dose-input"
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
            </section>

            {/* Step 2: Mood & Details */}
            <section 
                aria-labelledby="mood-label"
                className={`transition-all duration-700 ${selectedDose !== null ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4 grayscale pointer-events-none'}`}
            >
                <p id="mood-label" className="text-indigo-200/60 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 font-black ${selectedMood ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'bg-white/10 text-slate-400'}`}>2</span>
                    {t('step_2')}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6" role="radiogroup" aria-labelledby="mood-label">
                    {[
                        { id: 'bad', label: t('bad'), icon: Frown, color: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/30' },
                        { id: 'normal', label: t('stable'), icon: Meh, color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/30' },
                        { id: 'good', label: t('excellent'), icon: Smile, color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/30' }
                    ].map((m: any) => {
                        const isSelected = selectedMood === m.id;
                        return (
                            <button
                                key={m.id}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => setSelectedMood(m.id)}
                                className={`
                                    py-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-500
                                    ${isSelected
                                    ? `bg-gradient-to-br ${m.color} border-transparent text-white shadow-xl ${m.shadow} scale-105`
                                    : 'bg-slate-900/40 border-white/5 text-slate-500 hover:bg-slate-800 hover:border-white/10'}
                                `}
                            >
                                <m.icon className={`w-8 h-8 transition-transform duration-300 ${isSelected ? 'scale-110 rotate-6' : 'group-hover:scale-110'}`} strokeWidth={2.5} aria-hidden="true" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                            </button>
                        );
                    })}
                </div>

                {selectedMood && (
                    <div className="bg-slate-950/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-6 animate-in slide-in-from-bottom-4 shadow-inner">
                        {/* Sleep Slider */}
                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <label htmlFor="sleep-slider" className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                                    <BedDouble size={16} className="text-indigo-400" aria-hidden="true" />
                                    {language === 'ar' ? 'ساعات النوم' : 'Sleep Hours'}
                                </label>
                                <output htmlFor="sleep-slider" className="text-2xl font-mono font-black text-white">
                                    {sleepHours}<span className="text-sm text-slate-600 font-bold ml-1">h</span>
                                </output>
                            </div>
                            <input
                                id="sleep-slider"
                                type="range" 
                                min="0" 
                                max="12" 
                                step="0.5"
                                value={sleepHours}
                                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                aria-valuemin={0}
                                aria-valuemax={12}
                                aria-valuenow={sleepHours}
                                aria-valuetext={`${sleepHours} hours`}
                            />
                            <div className="flex justify-between text-[10px] text-slate-600 mt-2 font-bold px-1" aria-hidden="true">
                                <span>0h</span>
                                <span>6h</span>
                                <span>12h</span>
                            </div>
                        </div>

                        {/* Symptoms Tags */}
                        <div role="group" aria-labelledby="symptoms-label">
                            <label id="symptoms-label" className="text-xs font-bold text-slate-400 uppercase mb-3 block">{t('symptoms_label')}</label>
                            <div className="flex flex-wrap gap-2">
                                {symptomOptions.map(sym => {
                                    const isSelected = selectedSymptoms.includes(sym.label);
                                    return (
                                        <button
                                            key={sym.id}
                                            type="button"
                                            role="checkbox"
                                            aria-checked={isSelected}
                                            onClick={() => toggleSymptom(sym.label)}
                                            className={`
                                                px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                                                ${isSelected
                                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-900/20'
                                                : 'bg-slate-900/60 text-slate-500 border-transparent hover:bg-slate-800 hover:text-slate-300'}
                                            `}
                                        >
                                            {isSelected && <Check size={12} aria-hidden="true" />}
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
            <div className={`transition-all duration-700 ${selectedDose !== null && selectedMood ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                 <Button
                    variant="success"
                    className="w-full py-5 text-lg rounded-2xl shadow-xl shadow-emerald-500/20 animate-pulse-glow"
                    onClick={() => submitDailyLog(sleepHours, selectedSymptoms)}
                    aria-label={t('confirm_log')}
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
import React, { useMemo } from 'react';
import { FlaskConical, Clock, Info, ShieldCheck, BrainCircuit, Activity } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserProfile, PlanDay } from '../../types';

interface DashboardChartsProps {
    userProfile: UserProfile | null;
    plan: PlanDay[];
}

export const DashboardCharts = ({ userProfile, plan }: DashboardChartsProps) => {
    const { t, language } = useLanguage();
    
    const isLiquid = userProfile?.medForm === 'liquid';
    const isPatient = userProfile?.role === 'patient';
    const doctorName = userProfile?.patientData?.assignedDoctorName;
    const unitLabel = userProfile?.medUnit || 'mg';

    // Prepare chart data (First 30 days)
    // FIX: Sort plan by date to prevent "zigzag" lines if plan array is unsorted
    const chartData = useMemo(() => {
        return [...plan]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 30)
            .map(p => ({
                fullDate: p.date,
                displayDate: p.date.slice(5), // MM-DD
                dose: p.plannedDose
            }));
    }, [plan]);

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            
            {/* Status Card */}
            <Card className="flex flex-col items-center justify-center text-center py-10 border-white/10 relative overflow-hidden group">
                 {/* Decorative Background */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors duration-500" aria-hidden="true"></div>
                 
                 <div className="w-20 h-20 rounded-3xl bg-slate-900/80 border border-white/5 flex items-center justify-center mb-6 relative shadow-2xl shadow-black/50 group-hover:scale-110 transition-transform duration-500" aria-hidden="true">
                     <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     {isLiquid ? (
                        <FlaskConical className="w-8 h-8 text-indigo-400 relative z-10" />
                     ) : (
                        <Clock className="w-8 h-8 text-indigo-400 relative z-10" />
                     )}
                 </div>
                 
                 <section aria-label={language === 'ar' ? 'حالة الخطة' : 'Plan Status'}>
                     {isPatient ? (
                         <div className="relative z-10 px-6">
                            <h2 className="text-white font-bold text-lg mb-2">
                                {language === 'ar' ? 'خطة طبية معتمدة' : 'Verified Medical Plan'}
                            </h2>
                            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-4 bg-slate-900/50 py-2 px-4 rounded-xl border border-white/5">
                                <ShieldCheck size={16} className="text-emerald-500" aria-hidden="true"/>
                                <span>{language === 'ar' ? `إشراف د. ${doctorName}` : `Dr. ${doctorName}`}</span>
                            </div>
                            <Badge color="indigo" className="mx-auto">Fixed Plan</Badge>
                         </div>
                     ) : (
                         <div className="relative z-10 px-6">
                            <h2 className="text-white font-bold text-lg mb-2 flex items-center justify-center gap-2">
                                {t('algo_active')} <BrainCircuit size={18} className="text-amber-400" aria-hidden="true"/>
                            </h2>
                            <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto mb-4">
                              {t('algo_desc')}
                            </p>
                            <Badge color="emerald">Smart Engine v2.0</Badge>
                         </div>
                     )}
                 </section>
            </Card>

            {/* Projection Chart */}
            <Card className="min-h-[280px] relative overflow-hidden border-white/10" noPadding>
                <section aria-labelledby="chart-title" className="h-full flex flex-col">
                    <header className="p-6 pb-0 relative z-10 flex justify-between items-start">
                       <div>
                           <h2 id="chart-title" className="text-base font-bold text-white mb-1 flex items-center gap-2">
                               {t('recovery_path')} 
                               <div className="group/tooltip relative">
                                   <Info size={14} className="text-slate-500 hover:text-white transition-colors cursor-help" aria-hidden="true"/>
                                   <span className="sr-only">{language === 'ar' ? 'معلومات التوقع' : 'Projection Info'}</span>
                               </div>
                           </h2>
                           <p className="text-[10px] text-indigo-300/60 uppercase tracking-widest font-bold">
                               {language === 'ar' ? 'توقعات 30 يوم' : '30 Days Projection'}
                           </p>
                       </div>
                    </header>
                    
                    <div className="absolute inset-x-0 bottom-0 top-16" aria-hidden="true">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorDose" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                        itemStyle={{color: '#fff', fontSize: '12px', fontWeight: 'bold'}}
                                        labelStyle={{display: 'none'}}
                                        formatter={(val) => [`${val} ${unitLabel}`, t('dose')]}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="dose" 
                                        stroke="#818cf8" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorDose)" 
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                                <Activity className="mr-2 opacity-50" /> 
                                {language === 'ar' ? 'لا توجد بيانات للعرض' : 'No data to display'}
                            </div>
                        )}
                    </div>

                    {/* Hidden Table for Screen Readers */}
                    <div className="sr-only">
                        <table>
                            <caption>{language === 'ar' ? 'جدول توقعات الجرعة لمدة 30 يوم' : '30-day Dose Projection Table'}</caption>
                            <thead>
                                <tr>
                                    <th scope="col">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                    <th scope="col">{t('dose')} ({unitLabel})</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((row, i) => (
                                    <tr key={i}>
                                        <td>{row.fullDate}</td>
                                        <td>{row.dose}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </Card>
        </div>
    );
};
```
---

### File: `views\dashboard\DashboardHeader.tsx`
```tsx
import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, Activity, Edit3 } from 'lucide-react';
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
    children?: React.ReactNode; 
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
    const { t, language } = useLanguage();
    const unitLabel = userProfile?.medUnit || 'mg';
    const doseValue = todayPlan ? todayPlan.plannedDose : 0;
    
    // Local state to toggle between "Success Banner" and "Edit Form"
    const [isEditing, setIsEditing] = useState(false);

    return (
        // تم نقل role و aria-label و col-span إلى عنصر section قياسي لتجنب أخطاء TypeScript
        <section 
            className="lg:col-span-8"
            aria-label={language === 'ar' ? 'ملخص اليوم' : 'Daily Summary'}
        >
            <Card 
                className="min-h-[550px] h-full flex flex-col relative overflow-hidden group border-white/10 shadow-2xl shadow-indigo-900/10" 
                noPadding
            >
                
                {/* 1. خلفية متدرجة داكنة وهادئة */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b] opacity-90" aria-hidden="true"></div>
                
                {/* 2. تأثير إضاءة محيطية (Ambient Light) */}
                <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse-glow pointer-events-none" aria-hidden="true"></div>

                <div className="relative z-10 p-8 md:p-12 flex flex-col h-full justify-between">
                    {/* القسم العلوي: الجرعة والعداد */}
                    <header className="flex justify-between items-start">
                        <div className="space-y-4">
                            <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-[0.2em] flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" aria-hidden="true" /> {t('target_dose')}
                            </h2>
                            
                            <div 
                                className="flex items-baseline gap-2 cursor-default select-none"
                                aria-label={`${language === 'ar' ? 'الجرعة المستهدفة' : 'Target Dose'}: ${doseValue} ${unitLabel}`}
                            >
                                {/* رقم الجرعة بتدرج لوني */}
                                <span 
                                    className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter drop-shadow-xl transition-all duration-500 hover:to-indigo-200"
                                    aria-hidden="true" 
                                >
                                    {doseValue}
                                </span>
                                <span className="text-2xl text-slate-500 font-bold" aria-hidden="true">{unitLabel}</span>
                            </div>
                        </div>

                        {/* عداد التقدم الدائري */}
                        <div className="hidden md:block scale-110 relative" aria-hidden="true">
                            {/* توهج خلف العداد */}
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                            <ProgressRing 
                                radius={70} 
                                stroke={8} 
                                progress={progressPercentage} 
                                totalSteps={totalDays - daysCompleted}
                                label={language === 'ar' ? 'التقدم العام' : 'Overall Progress'}
                            />
                        </div>
                    </header>

                    {/* القسم السفلي: إما رسالة النجاح أو نموذج التسجيل */}
                    <div aria-live="polite" className="mt-8">
                        {todayLog && !isEditing ? (
                            // حالة النجاح (تم التوثيق) - بطاقة زجاجية خضراء
                            <div 
                                className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl flex items-center justify-between backdrop-blur-md animate-in slide-in-from-bottom-4 shadow-lg shadow-emerald-900/10"
                                role="status"
                            >
                                <div>
                                    <p className="text-emerald-400 font-bold text-2xl mb-2 flex items-center gap-2">
                                        {t('documented')} <span className="text-2xl" aria-hidden="true">🎉</span>
                                    </p>
                                    <div className="space-y-1 text-sm text-slate-300">
                                        <p className="flex items-center gap-2">
                                            <Activity size={14} className="text-emerald-500" aria-hidden="true"/>
                                            <span className="text-slate-400">{t('dose')}:</span> 
                                            <span className="text-white font-mono font-bold">{todayLog.doseTaken}{unitLabel}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="w-3.5 h-3.5 rounded-full border border-emerald-500/50 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                            </span>
                                            <span className="text-slate-400">{t('mood')}:</span> 
                                            <span className="text-white">{todayLog.mood === 'good' ? t('excellent') : todayLog.mood === 'normal' ? t('stable') : t('bad')}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-full flex items-center justify-center ring-1 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-pulse-glow">
                                        <CheckCircle className="text-emerald-500 w-8 h-8" aria-hidden="true" />
                                    </div>
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="text-xs text-emerald-400/60 hover:text-emerald-300 flex items-center gap-1 transition-colors mt-1 hover:underline"
                                    >
                                        <Edit3 size={12} /> {language === 'ar' ? 'تعديل' : 'Edit'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // نموذج التسجيل (يتم تمريره كـ children)
                            <div className="animate-in slide-in-from-bottom-2 relative">
                                {isEditing && (
                                    <button 
                                        onClick={() => setIsEditing(false)}
                                        className="absolute -top-10 right-0 text-slate-500 text-xs hover:text-white transition-colors"
                                    >
                                        {language === 'ar' ? 'إلغاء التعديل' : 'Cancel Edit'}
                                    </button>
                                )}
                                {children}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </section>
    );
};
```
---

### File: `views\AdminView.tsx`
```tsx
import React, { useEffect, useState, useRef } from 'react';
import { 
    collection, query, orderBy, deleteDoc, onSnapshot, doc 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Article } from '../types';
import { Activity, Users, FileText, Stethoscope, X, Trash2, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

// Services
import { 
    approveDoctorService, 
    rejectDoctorService, 
    toggleBanService, 
    deleteUserService, 
    publishArticleService 
} from '../services/adminServices';

// Contexts
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';

// Components
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// Sub-views
import { AdminOverview } from './admin/AdminOverview';
import { AdminDoctors } from './admin/AdminDoctors';
import { AdminUsers } from './admin/AdminUsers';
import { AdminCMS } from './admin/AdminCMS';

export const AdminView = () => {
    const { t, language } = useLanguage();
    const { userProfile } = useData(); // Get current admin profile for logging

    // -- Global State --
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'users' | 'cms'>('overview');
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // -- Data Stores --
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);

    // -- Modals State --
    const [selectedDoctor, setSelectedDoctor] = useState<UserProfile | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    // Refs
    const modalRef = useRef<HTMLDivElement>(null);
    const rejectInputRef = useRef<HTMLTextAreaElement>(null);

    // -- 1. REAL-TIME DATA FETCHING (Keep direct listeners for live UI) --
    useEffect(() => {
        setLoading(true);
        // Listen to Users
        const qUsers = query(collection(db, "users"));
        const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
            const fetchedUsers: UserProfile[] = [];
            snapshot.forEach(d => fetchedUsers.push({ uid: d.id, ...d.data() } as UserProfile));
            setUsers(fetchedUsers);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            showStatus('error', "Failed to sync users data");
            setLoading(false);
        });

        // Listen to Articles
        const qArticles = query(collection(db, "articles"), orderBy("createdAt", "desc"));
        const unsubscribeArticles = onSnapshot(qArticles, (snapshot) => {
            setArticles(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Article)));
        });

        return () => {
            unsubscribeUsers();
            unsubscribeArticles();
        };
    }, []);

    // Focus management
    useEffect(() => {
        if (selectedDoctor || showRejectModal) {
            setTimeout(() => {
                if (showRejectModal) rejectInputRef.current?.focus();
                else modalRef.current?.focus();
            }, 100);
        }
    }, [selectedDoctor, showRejectModal]);

    // -- HELPERS --
    const showStatus = (type: 'success' | 'error', text: string) => {
        setStatusMsg({ type, text });
        setTimeout(() => setStatusMsg(null), 4000);
    };

    // -- ACTIONS (Using Atomic Services) --
    
    const approveDoctor = async (docUid: string) => {
        if (!userProfile) return;
        if (!window.confirm(language === 'ar' ? "هل تؤكد اعتماد هذا الطبيب؟" : "Confirm doctor approval?")) return;
        
        const doctorName = users.find(u => u.uid === docUid)?.name || "Unknown";
        const result = await approveDoctorService(userProfile, docUid, doctorName);

        if (result.success) {
            showStatus('success', language === 'ar' ? "تم اعتماد الطبيب بنجاح." : "Doctor approved successfully.");
            if (selectedDoctor?.uid === docUid) setSelectedDoctor(null);
        } else {
            showStatus('error', result.error || "Failed to approve doctor.");
        }
    };

    const handleRejectClick = (doctor: UserProfile) => {
        setSelectedDoctor(doctor);
        setShowRejectModal(true);
        setRejectionReason("");
    };

    const confirmReject = async () => {
        if (!userProfile || !selectedDoctor?.uid) return;
        if (!rejectionReason.trim()) {
            showStatus('error', language === 'ar' ? "يرجى ذكر سبب الرفض." : "Rejection reason is required.");
            return;
        }

        const result = await rejectDoctorService(userProfile, selectedDoctor.uid, selectedDoctor.name, rejectionReason);

        if (result.success) {
            showStatus('success', language === 'ar' ? "تم رفض الطلب." : "Doctor request rejected.");
            setShowRejectModal(false);
            setSelectedDoctor(null);
            setRejectionReason("");
        } else {
            showStatus('error', result.error || "Failed to reject request.");
        }
    };

    const toggleBan = async (targetUser: UserProfile) => {
        if (!userProfile || !targetUser.uid) return;
        const newVal = !targetUser.isBanned;
        
        if(window.confirm(newVal ? 
            (language === 'ar' ? "حظر هذا المستخدم؟" : "Ban this user?") : 
            (language === 'ar' ? "فك الحظر عن المستخدم؟" : "Unban this user?")
        )) {
            const result = await toggleBanService(userProfile, targetUser.uid, targetUser.name, newVal);
            
            if (result.success) {
                showStatus('success', language === 'ar' ? `تم ${newVal ? 'حظر' : 'فك حظر'} المستخدم.` : `User ${newVal ? 'banned' : 'unbanned'}.`);
            } else {
                showStatus('error', result.error || "Action failed.");
            }
        }
    };

    const deleteUser = async (targetUid: string) => {
        if (!userProfile) return;
        if (!window.confirm(language === 'ar' ? "تحذير: هذا الإجراء سيحذف المستخدم نهائياً. هل أنت متأكد؟" : "Warning: This will permanently delete the user. Continue?")) return;
        
        const result = await deleteUserService(userProfile, targetUid);

        if (result.success) {
            showStatus('success', language === 'ar' ? "تم حذف المستخدم." : "User deleted.");
            if (selectedDoctor?.uid === targetUid) setSelectedDoctor(null);
        } else {
            showStatus('error', result.error || "Failed to delete user.");
        }
    };

    const publishArticle = async (articleData: Omit<Article, 'id' | 'createdAt' | 'authorName' | 'authorId' | 'authorRole'>) => {
        if (!userProfile) return;
        if (!articleData.title || !articleData.content) {
            showStatus('error', language === 'ar' ? "العنوان والمحتوى مطلوبان." : "Title and content are required.");
            return;
        }
        
        const result = await publishArticleService(userProfile, articleData);

        if (result.success) {
            showStatus('success', language === 'ar' ? "تم نشر المقال." : "Article published.");
        } else {
            showStatus('error', result.error || "Failed to publish article.");
        }
    };

    // Direct delete for articles (less critical, can be moved to service later if needed)
    const deleteArticle = async (id: string) => {
        if(window.confirm(language === 'ar' ? "حذف هذا المقال؟" : "Delete this article?")) {
            try {
                await deleteDoc(doc(db, "articles", id));
                showStatus('success', language === 'ar' ? "تم الحذف." : "Article deleted.");
            } catch (e) {
                showStatus('error', "Failed to delete article.");
            }
        }
    }

    const pendingDoctorsCount = users.filter(u => u.role === 'doctor' && u.doctorData?.accountStatus === 'pending').length;

    return (
        <LayoutContainer>
            <div className="relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                <PageHeader title={t('admin_title')} subtitle={t('admin_subtitle')} />
            </div>

            {/* Status Toast */}
            {statusMsg && (
                <div 
                    className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] px-6 py-3 rounded-full shadow-2xl font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-3 border ${
                        statusMsg.type === 'success' 
                        ? 'bg-emerald-500/90 text-white border-emerald-400/50' 
                        : 'bg-rose-500/90 text-white border-rose-400/50'
                    }`}
                    role="alert"
                >
                    {statusMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    {statusMsg.text}
                </div>
            )}

            {/* Navigation Tabs */}
            <div 
                className="flex p-1.5 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 mb-8 w-full overflow-x-auto scrollbar-hide shadow-2xl relative z-10"
                role="tablist"
                aria-label="Admin Sections"
            >
                {[
                    { id: 'overview', icon: Activity, label: t('tab_overview') },
                    { id: 'doctors', icon: Stethoscope, label: t('tab_doctors') },
                    { id: 'users', icon: Users, label: t('tab_users') },
                    { id: 'cms', icon: FileText, label: t('tab_cms') },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        id={`tab-${tab.id}`}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap min-w-[120px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                            activeTab === tab.id 
                            ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/20' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={16} aria-hidden="true" />
                        {tab.label}
                        {tab.id === 'doctors' && pendingDoctorsCount > 0 && (
                             <span className="ml-2 bg-white text-rose-600 text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse" aria-label={`${pendingDoctorsCount} pending`}>{pendingDoctorsCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <main 
                id={`panel-${activeTab}`} 
                role="tabpanel" 
                aria-labelledby={`tab-${activeTab}`}
                className="animate-in slide-in-from-bottom-4 relative z-10 focus:outline-none"
                tabIndex={-1}
            >
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
            </main>

            {/* --- SHARED MODALS --- */}

            {/* DOCTOR DETAILS MODAL */}
            {selectedDoctor && !showRejectModal && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-doc-name"
                >
                    <div 
                        ref={modalRef} 
                        tabIndex={-1}
                        className="w-full max-w-lg relative outline-none"
                    >
                        <Card className="!bg-slate-900 border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
                            {/* Modal Header */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-600/20 to-transparent"></div>
                            <button 
                                onClick={() => setSelectedDoctor(null)} 
                                className="absolute top-4 right-4 p-2 bg-slate-800/50 rounded-full text-slate-400 hover:text-white z-20 backdrop-blur-md hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                aria-label={t('close')}
                            >
                                <X size={20}/>
                            </button>
                            
                            <div className="text-center pt-8 pb-6 relative z-10">
                                <div className="w-28 h-28 mx-auto mb-4 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl">
                                    {selectedDoctor.doctorData?.photoUrl ? (
                                        <img src={selectedDoctor.doctorData.photoUrl} alt="" className="w-full h-full rounded-full object-cover border-4 border-slate-900" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500 border-4 border-slate-900" aria-hidden="true">Dr</div>
                                    )}
                                </div>
                                <h2 id="modal-doc-name" className="text-2xl font-black text-white">{selectedDoctor.name}</h2>
                                <p className="text-indigo-400 font-bold uppercase text-xs tracking-widest mt-1">{selectedDoctor.doctorData?.specialty}</p>
                            </div>

                            <div className="px-8 pb-8 space-y-4">
                                <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-slate-500 font-bold">License ID</span>
                                        <span className="text-white font-mono">{selectedDoctor.doctorData?.licenseNumber}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-slate-500 font-bold">Email</span>
                                        <span className="text-white">{selectedDoctor.email}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-slate-500 font-bold">Phone</span>
                                        <span className="text-white font-mono">{selectedDoctor.doctorData?.phoneNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-bold">Location</span>
                                        <span className="text-white">{selectedDoctor.doctorData?.clinicLocation}</span>
                                    </div>
                                </div>

                                {selectedDoctor.doctorData?.accountStatus === 'pending' && (
                                    <div className="flex gap-3 pt-2">
                                        <Button onClick={() => selectedDoctor.uid && approveDoctor(selectedDoctor.uid)} variant="success" className="flex-1 shadow-lg shadow-emerald-500/20">
                                            Approve
                                        </Button>
                                        <Button onClick={() => handleRejectClick(selectedDoctor)} variant="danger" className="flex-1 shadow-lg shadow-rose-500/20">
                                            Reject
                                        </Button>
                                    </div>
                                )}
                                
                                {selectedDoctor.doctorData?.accountStatus === 'approved' && (
                                     <div className="pt-2">
                                         <Button 
                                             onClick={() => selectedDoctor.uid && deleteUser(selectedDoctor.uid)} 
                                             variant="danger" 
                                             className="w-full shadow-lg shadow-rose-900/20"
                                         >
                                             <Trash2 size={18} className="mr-2" aria-hidden="true"/> Terminate Account
                                         </Button>
                                     </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* REJECTION REASON MODAL */}
            {showRejectModal && (
                <div 
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="reject-title"
                >
                    <div className="w-full max-w-md outline-none">
                        <Card className="!bg-slate-900 border-rose-500/30 shadow-2xl rounded-[2rem] overflow-hidden">
                            <div className="p-6">
                                <h3 id="reject-title" className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <ShieldAlert className="text-rose-500" aria-hidden="true" /> {language === 'ar' ? 'سبب الرفض' : 'Rejection Reason'}
                                </h3>
                                <p className="text-slate-400 text-sm mb-4">
                                    {language === 'ar' ? 'يرجى توضيح سبب رفض طلب الطبيب.' : 'Please provide a reason for rejection.'}
                                </p>
                                
                                <label htmlFor="reason-text" className="sr-only">Reason</label>
                                <textarea 
                                    id="reason-text"
                                    ref={rejectInputRef}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none h-32 resize-none transition-all placeholder-slate-700 focus:ring-1 focus:ring-rose-500"
                                    placeholder={language === 'ar' ? "مثال: نقص في البيانات..." : "E.g. Missing info..."}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                                
                                <div className="flex gap-3 mt-6">
                                    <Button onClick={() => setShowRejectModal(false)} variant="secondary" className="flex-1">{t('cancel_btn')}</Button>
                                    <Button onClick={confirmReject} variant="danger" className="flex-1 shadow-lg shadow-rose-500/20">{t('reject_btn')}</Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `views\ArticlesView.tsx`
```tsx
import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Article, UserProfile, ArticleCategory } from '../types';
import { BookOpen, Lightbulb, Heart, Stethoscope, X, ArrowRight, PenTool, Sparkles, Clock, CheckCircle, Trash2 } from 'lucide-react';

// المكونات
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

import { useLanguage } from '../contexts/LanguageContext';

interface ArticlesViewProps {
    userProfile?: UserProfile | null;
}

// Internal Component: Article Skeleton Loader
const ArticleSkeleton = () => (
    <div className="rounded-[2rem] p-6 border border-white/5 bg-slate-900/40 animate-pulse h-full flex flex-col">
        <div className="w-24 h-6 bg-slate-800 rounded-full mb-4"></div>
        <div className="w-3/4 h-8 bg-slate-800 rounded-lg mb-2"></div>
        <div className="w-1/2 h-8 bg-slate-800 rounded-lg mb-6"></div>
        <div className="space-y-2 flex-1">
            <div className="w-full h-4 bg-slate-800/50 rounded"></div>
            <div className="w-full h-4 bg-slate-800/50 rounded"></div>
            <div className="w-2/3 h-4 bg-slate-800/50 rounded"></div>
        </div>
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
            <div className="w-20 h-4 bg-slate-800 rounded"></div>
            <div className="w-8 h-8 bg-slate-800 rounded-full"></div>
        </div>
    </div>
);

export const ArticlesView = ({ userProfile }: ArticlesViewProps) => {
    const { t, language, dir } = useLanguage();
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<'all' | ArticleCategory>('all');
    const [readingArticle, setReadingArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    // -- Create Mode State --
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'tip' as ArticleCategory });

    // Focus Management Refs
    const modalRef = useRef<HTMLDivElement>(null);

    // -- Helpers --
    const calculateReadingTime = (text: string) => {
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    };

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

    // Manage Focus for Reading Modal
    useEffect(() => {
        if (readingArticle) {
            setTimeout(() => modalRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [readingArticle]);

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

    // -- Delete Action --
    const handleDelete = async (e: React.MouseEvent, article: Article) => {
        e.stopPropagation(); // Prevent opening the article
        if (!article.id) return;
        
        const confirmMsg = language === 'ar' 
            ? "هل أنت متأكد من حذف هذا المقال؟" 
            : "Are you sure you want to delete this article?";

        if (window.confirm(confirmMsg)) {
            try {
                await deleteDoc(doc(db, "articles", article.id));
                setArticles(prev => prev.filter(a => a.id !== article.id));
            } catch (err) {
                console.error("Failed to delete article", err);
                alert("Error deleting article");
            }
        }
    };

    // -- UI Helpers --
    const filteredArticles = selectedCategory === 'all' 
        ? articles 
        : articles.filter(a => a.category === selectedCategory);

    const getCategoryIcon = (cat: string) => {
        switch(cat) {
            case 'medical': return <Stethoscope size={14} aria-hidden="true" />;
            case 'motivation': return <Heart size={14} aria-hidden="true" />;
            default: return <Lightbulb size={14} aria-hidden="true" />;
        }
    };

    const getCategoryColor = (cat: string) => {
        switch(cat) {
            case 'medical': return 'indigo';
            case 'motivation': return 'rose';
            default: return 'amber';
        }
    };

    const getCategoryGradient = (cat: string) => {
        switch(cat) {
            case 'medical': return 'from-indigo-500/20 to-blue-500/20 hover:from-indigo-500/30 hover:to-blue-500/30 border-indigo-500/20';
            case 'motivation': return 'from-rose-500/20 to-pink-500/20 hover:from-rose-500/30 hover:to-pink-500/30 border-rose-500/20';
            default: return 'from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border-amber-500/20';
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
                        <Button onClick={() => setShowCreateModal(true)} variant="primary" className="!rounded-xl shadow-indigo-500/20" aria-label={t('new_article_btn')}>
                            <PenTool size={18} aria-hidden="true" /> {t('new_article_btn')}
                        </Button>
                    )
                }
            />

            {/* Category Filters */}
            <div className="flex gap-3 overflow-x-auto pb-6 mb-2 scrollbar-hide" role="tablist" aria-label="Article Categories">
                {[
                    { id: 'all', label: t('cat_all'), icon: BookOpen },
                    { id: 'medical', label: t('cat_medical'), icon: Stethoscope },
                    { id: 'motivation', label: t('cat_motivation'), icon: Heart },
                    { id: 'tip', label: t('cat_tip'), icon: Lightbulb },
                ].map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as any)}
                        role="tab"
                        aria-selected={selectedCategory === cat.id}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            selectedCategory === cat.id 
                            ? 'bg-white text-slate-900 border-white shadow-lg shadow-white/20 scale-105' 
                            : 'bg-slate-900/40 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                        }`}
                    >
                        <cat.icon size={18} aria-hidden="true" />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    // Show 3 Skeletons while loading
                    Array.from({ length: 3 }).map((_, i) => <ArticleSkeleton key={i} />)
                ) : filteredArticles.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-slate-900/40 rounded-[2.5rem] border border-dashed border-slate-800 backdrop-blur-sm">
                        <BookOpen size={48} className="mx-auto text-slate-700 mb-4" aria-hidden="true"/>
                        <p className="text-slate-500">{language === 'ar' ? 'لا توجد مقالات في هذا القسم حالياً.' : 'No articles found in this category.'}</p>
                    </div>
                ) : (
                    filteredArticles.map(article => {
                        const canDelete = userProfile?.role === 'admin' || (userProfile?.uid && userProfile.uid === article.authorId);
                        
                        return (
                            <article 
                                key={article.id}
                                className={`group rounded-[2rem] p-6 flex flex-col h-full relative overflow-hidden transition-all duration-300 hover:-translate-y-2 border bg-gradient-to-br ${getCategoryGradient(article.category)}`}
                            >
                                <button 
                                    onClick={() => setReadingArticle(article)}
                                    className="absolute inset-0 z-10 w-full h-full focus:outline-none focus:ring-4 focus:ring-indigo-500/50 rounded-[2rem]"
                                    aria-label={`Read article: ${article.title}`}
                                ></button>

                                <div className="mb-4 relative z-20 pointer-events-none">
                                    <div className="flex justify-between items-start mb-4 pointer-events-auto">
                                        <Badge color={getCategoryColor(article.category) as any} className="flex items-center gap-1.5 !text-[10px] !py-1 !px-2.5 shadow-none bg-black/20 border-transparent backdrop-blur-md">
                                            {getCategoryIcon(article.category)} {article.category.toUpperCase()}
                                        </Badge>
                                        
                                        <div className="flex gap-2">
                                            <span className="text-[10px] font-bold text-white/40 flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full">
                                                <Clock size={10} /> {calculateReadingTime(article.content)} min
                                            </span>
                                            {canDelete && (
                                                <button 
                                                    onClick={(e) => handleDelete(e, article)}
                                                    className="bg-black/20 hover:bg-rose-500 text-white/60 hover:text-white p-1.5 rounded-full transition-all"
                                                    aria-label="Delete Article"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white leading-snug group-hover:text-white/90 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                </div>
                                
                                <p className="text-white/60 text-sm line-clamp-3 mb-6 flex-1 font-medium leading-relaxed relative z-0 pointer-events-none">
                                    {article.content}
                                </p>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10 relative z-0 pointer-events-none">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider flex items-center gap-1">
                                            {article.authorRole === 'doctor' && <CheckCircle size={10} className="text-blue-400" />}
                                            {article.authorName}
                                        </span>
                                        <span className="text-[10px] text-white/40 font-mono">
                                            {new Date(article.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-all">
                                        <ArrowRight size={14} className={dir === 'rtl' ? 'rotate-180' : ''}/>
                                    </div>
                                </div>
                            </article>
                        );
                    })
                )}
            </div>

            {/* Create Article Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in" role="dialog" aria-modal="true" aria-labelledby="create-title">
                    <Card className="w-full max-w-2xl bg-slate-900 border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label={t('close')}><X size={20}/></button>
                        
                        <h2 id="create-title" className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400"><PenTool size={20} aria-hidden="true"/></div>
                            {t('new_article_btn')}
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="art-title" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('article_title_label')}</label>
                                <input 
                                    id="art-title"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-all placeholder-slate-700"
                                    value={newArticle.title}
                                    onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                                    placeholder="عنوان جذاب..."
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label id="art-cat-label" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('article_cat_label')}</label>
                                <div className="flex gap-2" role="radiogroup" aria-labelledby="art-cat-label">
                                    {[
                                        { id: 'medical', label: t('cat_medical'), color: 'indigo' },
                                        { id: 'motivation', label: t('cat_motivation'), color: 'rose' },
                                        { id: 'tip', label: t('cat_tip'), color: 'amber' },
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            role="radio"
                                            aria-checked={newArticle.category === cat.id}
                                            onClick={() => setNewArticle({...newArticle, category: cat.id as ArticleCategory})}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-${cat.color}-500 ${
                                                newArticle.category === cat.id 
                                                ? `bg-${cat.color}-600 border-${cat.color}-500 text-white shadow-lg` 
                                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="art-content" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('article_content_label')}</label>
                                <textarea 
                                    id="art-content"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-indigo-500 h-48 resize-none transition-all placeholder-slate-700 custom-scrollbar"
                                    value={newArticle.content}
                                    onChange={e => setNewArticle({...newArticle, content: e.target.value})}
                                    placeholder="اكتب محتوى المقال هنا..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
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
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="read-title"
                >
                    <div 
                        ref={modalRef}
                        tabIndex={-1}
                        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-white/10 shadow-2xl relative overflow-hidden rounded-[2.5rem] outline-none"
                    >
                        {/* Modal Header */}
                        <div className={`p-8 md:p-10 border-b border-white/5 relative bg-gradient-to-br ${getCategoryGradient(readingArticle.category)}`}>
                            <button 
                                onClick={() => setReadingArticle(null)}
                                className="absolute top-6 left-6 p-2 bg-black/20 rounded-full text-white/70 hover:text-white transition-colors backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white"
                                aria-label={t('close')}
                            >
                                <X size={20} />
                            </button>
                            
                            <div className="flex gap-2 mb-4">
                                <Badge color={getCategoryColor(readingArticle.category) as any} className="bg-black/20 border-transparent text-white shadow-none">
                                    {readingArticle.category.toUpperCase()}
                                </Badge>
                                {readingArticle.authorRole === 'doctor' && (
                                    <Badge color="blue" className="bg-blue-500/20 border-blue-500/30 text-blue-100 shadow-none">
                                        <CheckCircle size={12} className="mr-1" /> VERIFIED DOCTOR
                                    </Badge>
                                )}
                            </div>

                            <h2 id="read-title" className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 drop-shadow-lg">
                                {readingArticle.title}
                            </h2>
                            <div className="flex items-center gap-4 text-xs text-white/60 font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                                        {readingArticle.authorName.charAt(0)}
                                    </div>
                                    <span>{readingArticle.authorName}</span>
                                </div>
                                <span aria-hidden="true">•</span>
                                <span className="flex items-center gap-1"><Clock size={12}/> {calculateReadingTime(readingArticle.content)} min read</span>
                                <span aria-hidden="true">•</span>
                                <span>{new Date(readingArticle.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-slate-950/50">
                            <article className="prose prose-invert prose-lg max-w-none">
                                <p className="text-slate-300 leading-loose whitespace-pre-wrap text-lg">
                                    {readingArticle.content}
                                </p>
                            </article>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-white/5 bg-slate-950/80 backdrop-blur-md flex justify-between items-center">
                            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Islam's Guide Knowledge Center</p>
                            <Button variant="secondary" onClick={() => setReadingArticle(null)} className="!py-2 !px-6 !text-xs !rounded-xl">
                                {t('close')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `views\CalendarView.tsx`
```tsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Check, X, Stethoscope, BrainCircuit, Calendar as CalendarIcon, Target, Crosshair, ChevronLeft, ChevronRight } from 'lucide-react';

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
    const { t, language, dir } = useLanguage();
    const todayRef = useRef<HTMLDivElement>(null);

    const unitLabel = userProfile?.medUnit || 'mg';
    const isDoctorPlan = userProfile?.planType === 'manual';

    // State for Month Navigation
    // Default to current month or the first month of the plan if current date is far off
    const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

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
        
        // Generate all days for this month (even if not in plan, to show complete calendar)
        // or just map the plan days that fall in this month?
        // Better approach: Create a grid for the month, fill with plan data if exists.
        
        const monthDays: Array<{ date: string, planDay?: PlanDay }> = [];
        for(let d = 1; d <= daysInMonth; d++) {
            // Construct YYYY-MM-DD
            // Note: Month is 0-indexed in JS Date, but we need 1-indexed for string
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const planItem = plan.find(p => p.date === dateStr);
            monthDays.push({ date: dateStr, planDay: planItem });
        }

        // Calculate padding blanks for the first row (based on 1st of month)
        const firstDayOfMonth = new Date(year, month, 1);
        // Adjust getDay() to match Saturday start (0=Sat in this logic)
        // Standard getDay(): 0=Sun, 1=Mon... 6=Sat
        // We want Sat=0, Sun=1... Fri=6
        // (day + 1) % 7 gives: Sat(6)->0, Sun(0)->1 ... Fri(5)->6
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
                  
                  {/* Dose Info */}
                  {hasPlan ? (
                      <>
                        <div className="text-center my-1 md:my-2">
                            <span className={`text-lg md:text-3xl font-black tracking-tight ${isToday ? 'text-white' : ''}`}>
                            {item.planDay!.plannedDose}
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
```
---

### File: `views\CommunityView.tsx`
```tsx
import React, { useEffect, useState, useRef } from 'react';
import { 
    collection, query, orderBy, limit, onSnapshot, addDoc, doc, deleteDoc, getDocs, writeBatch 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, ChatRoom, ChatMessage } from '../types';
import { 
    Trophy, Users, MessageCircle, Plus, Trash2, Send, Globe, Crown, 
    ShieldCheck, Pill, FlaskConical, Zap, Stethoscope, Lock, ChevronLeft, Medal, Sparkles, ArrowDown, AlertTriangle, Loader2
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
    const { t, dir, language } = useLanguage();
    
    // -- State --
    const [tab, setTab] = useState<'rooms' | 'leaderboard'>('rooms');
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
    const [showScrollButton, setShowScrollButton] = useState(false);
    
    // Create/Delete Room State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState<ChatRoom | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Rooms
    useEffect(() => {
        if (!currentUser.uid) return;
        const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allRooms: ChatRoom[] = [];
            snapshot.forEach((doc) => allRooms.push({ id: doc.id, ...doc.data() } as ChatRoom));
            
            const filteredRooms = allRooms.filter(room => {
                if (currentUser.role === 'admin') return true;
                if (currentUser.role === 'patient') return room.isDoctorRoom && room.doctorId === currentUser.patientData?.assignedDoctorId;
                if (currentUser.role === 'doctor') return room.doctorId === currentUser.uid;
                if (currentUser.role === 'normal_user') return !room.isDoctorRoom;
                return false;
            });
            setRooms(filteredRooms);
        });
        return () => unsubscribe();
    }, [currentUser]);

    // 2. Fetch Leaderboard
    useEffect(() => {
        if (tab === 'leaderboard') {
            const q = query(collection(db, "users"), orderBy("progress", "desc"), limit(50));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const u: UserProfile[] = [];
                snapshot.forEach((doc) => u.push({ ...doc.data(), uid: doc.id } as UserProfile));
                setLeaderboard(u);
            });
            return () => unsubscribe();
        }
    }, [tab]);

    // 3. Fetch Messages & Handle Scroll
    useEffect(() => {
        if (!activeRoom) return;
        const q = query(collection(db, "rooms", activeRoom.id, "messages"), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const m: ChatMessage[] = [];
            snapshot.forEach((doc) => m.push({ id: doc.id, ...doc.data() } as ChatMessage));
            setMessages(m);
            
            // Auto-scroll only if user is already near bottom
            if (chatContainerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
                if (isNearBottom) {
                    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                } else {
                    setShowScrollButton(true);
                }
            }
        });
        return () => unsubscribe();
    }, [activeRoom]);

    // 4. Scroll Event Listener
    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShowScrollButton(!isNearBottom);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowScrollButton(false);
    };

    // --- Actions ---
    const createRoom = async () => {
        if (!newRoomName.trim() || !currentUser.uid) return;
        setIsProcessing(true);
        const isDoctor = currentUser.role === 'doctor';
        try {
            await addDoc(collection(db, "rooms"), {
                name: newRoomName.trim().slice(0, 30),
                createdBy: currentUser.uid,
                creatorName: currentUser.name || "Unknown",
                language: 'mixed',
                createdAt: Date.now(),
                isDoctorRoom: isDoctor,
                doctorId: isDoctor ? currentUser.uid : null
            });
            setNewRoomName("");
            setShowCreateModal(false);
        } catch (e) {
            console.error("Failed to create room", e);
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmDeleteRoom = (room: ChatRoom) => {
        setRoomToDelete(room);
        setShowDeleteModal(true);
    };

    const handleDeleteRoom = async () => {
        if (!roomToDelete) return;
        setIsProcessing(true);
        try {
            // 1. Delete Messages Subcollection (Batch)
            const msgsRef = collection(db, "rooms", roomToDelete.id, "messages");
            const msgsSnapshot = await getDocs(msgsRef);
            
            const batch = writeBatch(db);
            msgsSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            // Commit message deletion
            await batch.commit();

            // 2. Delete Room Document
            await deleteDoc(doc(db, "rooms", roomToDelete.id));
            
            if (activeRoom?.id === roomToDelete.id) setActiveRoom(null);
            setShowDeleteModal(false);
            setRoomToDelete(null);
        } catch (e) {
            console.error("Error deleting room:", e);
            alert(language === 'ar' ? "حدث خطأ أثناء الحذف." : "Error deleting room.");
        } finally {
            setIsProcessing(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeRoom || !currentUser.uid) return;
        
        const cleanMessage = newMessage.trim().slice(0, 300);
        
        await addDoc(collection(db, "rooms", activeRoom.id, "messages"), {
            text: cleanMessage,
            senderId: currentUser.uid,
            senderName: currentUser.name || "Anonymous",
            timestamp: Date.now(),
            role: currentUser.role,
            isDoctor: currentUser.role === 'doctor',
            isAdmin: currentUser.role === 'admin'
        });
        setNewMessage("");
        scrollToBottom();
    };

    const canCreateRoom = currentUser.role !== 'patient';

    return (
        <LayoutContainer className="h-[calc(100vh-140px)] flex flex-col relative">
            
            {/* Tabs Navigation */}
            {!activeRoom && (
                <nav className="flex p-1.5 bg-slate-900/80 rounded-full border border-white/10 mb-8 shrink-0 backdrop-blur-xl shadow-2xl w-fit mx-auto relative z-10" role="tablist">
                    <button 
                        onClick={() => setTab('rooms')} 
                        role="tab"
                        aria-selected={tab === 'rooms'}
                        className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${tab === 'rooms' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/40 scale-105' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <MessageCircle size={18} aria-hidden="true" /> {t('comm_rooms')}
                    </button>
                    <button 
                        onClick={() => setTab('leaderboard')} 
                        role="tab"
                        aria-selected={tab === 'leaderboard'}
                        className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-amber-500 ${tab === 'leaderboard' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/40 scale-105' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Trophy size={18} aria-hidden="true" /> {t('comm_leaderboard')}
                    </button>
                </nav>
            )}

            {/* LEADERBOARD TAB */}
            {tab === 'leaderboard' && !activeRoom && (
                <ul className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 space-y-4 animate-in slide-in-from-bottom-8" role="list">
                    {leaderboard.map((user, idx) => {
                        let rankStyle = 'bg-slate-900/60 border-white/5';
                        let rankBadge = null;
                        let progressColor = 'bg-slate-700';
                        let nameColor = 'text-white';
                        
                        if (idx === 0) { 
                            rankStyle = 'bg-gradient-to-r from-yellow-900/40 to-amber-900/10 border-amber-500/30 shadow-lg shadow-amber-500/10'; 
                            rankBadge = <div className="p-2 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg shadow-amber-500/40"><Crown size={20} className="text-white" fill="white"/></div>;
                            progressColor = 'bg-amber-500';
                            nameColor = 'text-amber-200';
                        }
                        else if (idx === 1) { 
                            rankStyle = 'bg-gradient-to-r from-slate-700/40 to-slate-800/10 border-slate-400/30 shadow-lg shadow-slate-500/10'; 
                            rankBadge = <div className="p-2 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 shadow-lg shadow-slate-500/40"><Medal size={20} className="text-white" fill="white"/></div>;
                            progressColor = 'bg-slate-400';
                            nameColor = 'text-slate-200';
                        }
                        else if (idx === 2) { 
                            rankStyle = 'bg-gradient-to-r from-orange-900/40 to-red-900/10 border-orange-500/30 shadow-lg shadow-orange-500/10'; 
                            rankBadge = <div className="p-2 rounded-full bg-gradient-to-br from-orange-400 to-red-600 shadow-lg shadow-orange-500/40"><Medal size={20} className="text-white" fill="white"/></div>;
                            progressColor = 'bg-orange-500';
                            nameColor = 'text-orange-200';
                        } else {
                            rankBadge = <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-500 border border-white/5">{idx + 1}</div>;
                        }

                        const MedIcon = user.medForm === 'liquid' ? FlaskConical : Pill;

                        return (
                            <li key={idx} className={`flex items-center justify-between p-4 rounded-3xl border backdrop-blur-md transition-all hover:scale-[1.01] hover:bg-white/5 ${rankStyle}`}>
                                <div className="flex items-center gap-5">
                                    <div className="shrink-0">{rankBadge}</div>
                                    <div>
                                        <p className={`font-bold text-lg flex items-center gap-2 ${nameColor}`}>
                                            {user.name || t('guest')}
                                            {user.role === 'admin' && <ShieldCheck size={16} className="text-rose-500" aria-label="Admin" />}
                                            {user.role === 'doctor' && <Stethoscope size={16} className="text-blue-400" aria-label="Doctor" />}
                                            {idx === 0 && <Sparkles size={14} className="text-yellow-400 animate-pulse" aria-hidden="true"/>}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={user.progress || 0} aria-valuemin={0} aria-valuemax={100} aria-label="Recovery Progress">
                                                <div className={`h-full rounded-full ${progressColor}`} style={{width: `${user.progress || 0}%`}}></div>
                                            </div>
                                            <div className="flex gap-2">
                                                {user.medType && (
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md">
                                                        <MedIcon size={10} aria-hidden="true" /> {user.medType}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-white">{Math.round(user.progress || 0)}<span className="text-sm text-slate-500 ml-0.5">%</span></span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* ROOMS TAB */}
            {tab === 'rooms' && !activeRoom && (
                <div className="flex-1 flex flex-col h-full overflow-hidden animate-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-6 shrink-0 px-1">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Globe size={20} className="text-indigo-400"/> 
                            {currentUser.role === 'patient' ? "Your Clinic" : t('comm_rooms')}
                        </h2>
                        {canCreateRoom && (
                            <Button variant="success" onClick={() => setShowCreateModal(true)} className="!py-2 !px-4 !text-xs !rounded-xl shadow-emerald-500/20" aria-label={t('create_room')}>
                                <Plus size={16} aria-hidden="true" /> {t('create_room')}
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-20 custom-scrollbar pr-1">
                        {rooms.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-slate-900/30 rounded-[2.5rem] border border-dashed border-slate-800 text-slate-500 flex flex-col items-center">
                                <MessageCircle size={48} className="mb-4 opacity-20"/>
                                <p>No rooms available.</p>
                            </div>
                        )}
                        {rooms.map(room => (
                            <Card 
                                key={room.id} 
                                hoverEffect={true}
                                className={`!p-0 cursor-pointer flex flex-col justify-between min-h-[140px] border-white/5 relative group ${room.isDoctorRoom ? 'bg-gradient-to-br from-indigo-900/40 to-slate-900/80' : 'bg-slate-900/60'}`}
                            >
                                <button 
                                    onClick={() => setActiveRoom(room)} 
                                    className="absolute inset-0 z-20 w-full h-full focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-3xl"
                                    aria-label={`Open room: ${room.name}`}
                                ></button>
                                
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>

                                <div className="p-6 flex flex-col h-full justify-between relative z-10 pointer-events-none">
                                    <div className="flex justify-between items-start pointer-events-auto">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${room.isDoctorRoom ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-400 border border-white/5'}`}>
                                            {room.isDoctorRoom ? <Stethoscope size={24} /> : <MessageCircle size={24} />}
                                        </div>
                                        
                                        {(currentUser.uid === room.createdBy || currentUser.role === 'admin') && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); confirmDeleteRoom(room); }}
                                                className="p-2 hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 rounded-lg transition-colors z-30 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                                aria-label="Delete Room"
                                                title="Delete Room"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white truncate flex items-center gap-2 group-hover:text-indigo-300 transition-colors">
                                            {room.name}
                                            {room.isDoctorRoom && <Lock size={14} className="text-indigo-400"/>}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">
                                            {room.isDoctorRoom ? "Private Clinic" : `Host: ${room.creatorName || 'Unknown'}`}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Create Room Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in" role="dialog" aria-modal="true">
                            <Card className="w-full max-w-sm bg-slate-900 border-white/10 shadow-2xl relative">
                                <h3 className="text-lg font-bold text-white mb-6">
                                    {currentUser.role === 'doctor' ? t('community_clinic') : t('create_room')}
                                </h3>
                                <input 
                                    className="w-full bg-slate-950 p-4 rounded-xl border border-white/10 text-white mb-6 outline-none focus:border-indigo-500 transition-all placeholder-slate-700 focus:ring-2 focus:ring-indigo-500"
                                    placeholder={t('room_name')}
                                    value={newRoomName}
                                    maxLength={30}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    autoFocus
                                    disabled={isProcessing}
                                />
                                {currentUser.role === 'doctor' ? (
                                    <p className="text-xs text-indigo-300 mb-6 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                                        {t('community_doctor_room_hint')}
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-500 mb-6">
                                        {t('community_public_room_hint')}
                                    </p>
                                )}
                                <div className="flex gap-3 justify-end">
                                    <Button variant="secondary" onClick={() => setShowCreateModal(false)} disabled={isProcessing}>{t('close')}</Button>
                                    <Button variant="primary" onClick={createRoom} disabled={!newRoomName.trim() || isProcessing}>
                                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : t('create_room')}
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in" role="dialog" aria-modal="true">
                            <Card className="w-full max-w-sm bg-slate-900 border-rose-500/30 shadow-2xl relative border-2">
                                <div className="flex flex-col items-center text-center p-4">
                                    <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/20">
                                        <AlertTriangle size={32} className="text-rose-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {language === 'ar' ? 'حذف الغرفة؟' : 'Delete Room?'}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-6">
                                        {language === 'ar' 
                                            ? 'سيتم حذف هذه الغرفة وجميع الرسائل بداخلها نهائياً. لا يمكن التراجع عن هذا الإجراء.' 
                                            : 'This will permanently delete the room and all its messages. This action cannot be undone.'}
                                    </p>
                                    <div className="flex gap-3 w-full">
                                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="flex-1" disabled={isProcessing}>
                                            {t('cancel_btn')}
                                        </Button>
                                        <Button variant="danger" onClick={handleDeleteRoom} className="flex-1 shadow-lg shadow-rose-900/20" disabled={isProcessing}>
                                            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : (language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete')}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* CHAT INTERFACE */}
            {tab === 'rooms' && activeRoom && (
                <div className="flex-1 flex flex-col h-full bg-slate-900/80 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative animate-in zoom-in backdrop-blur-xl">
                    
                    {/* Chat Header */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/50 backdrop-blur-md absolute top-0 left-0 right-0 z-20">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setActiveRoom(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors md:hidden" aria-label="Back">
                                <ChevronLeft size={24} />
                            </button>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg ${activeRoom.isDoctorRoom ? 'bg-gradient-to-br from-indigo-600 to-blue-600' : 'bg-slate-800'}`}>
                                {activeRoom.isDoctorRoom ? <Stethoscope size={18}/> : <MessageCircle size={18} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-base">{activeRoom.name}</h3>
                                <span className="text-[10px] text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live</span>
                            </div>
                        </div>
                        <Button variant="secondary" className="!py-2 !px-4 !text-xs !rounded-xl hidden md:flex" onClick={() => setActiveRoom(null)}>
                            {t('close')}
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <div 
                        className="flex-1 overflow-y-auto p-4 pt-24 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-black/20"
                        ref={chatContainerRef}
                        onScroll={handleScroll}
                        role="log"
                        aria-live="polite"
                        aria-relevant="additions"
                        aria-label="Chat messages"
                    >
                        {messages.map((msg, i) => {
                            const isMe = msg.senderId === currentUser.uid;
                            const showAvatar = i === 0 || messages[i-1].senderId !== msg.senderId;
                            
                            let bubbleStyle = 'bg-slate-800/80 text-slate-200 border-white/5';
                            if (isMe) bubbleStyle = 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border-indigo-500';
                            else if (msg.isDoctor || msg.role === 'doctor') bubbleStyle = 'bg-gradient-to-br from-blue-900/90 to-blue-800/90 border-blue-500/30 text-blue-100 shadow-lg';
                            else if (msg.isAdmin || msg.role === 'admin') bubbleStyle = 'bg-gradient-to-br from-rose-900/90 to-rose-800/90 border-rose-500/30 text-rose-100 shadow-lg';

                            return (
                                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2`}>
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border border-white/10 shadow-md ${showAvatar ? (isMe ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400') : 'opacity-0'}`} aria-hidden="true">
                                        {msg.senderName.charAt(0).toUpperCase()}
                                    </div>

                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                        {showAvatar && !isMe && (
                                            <span className="text-[10px] text-slate-500 mb-1 ml-1 flex items-center gap-1 font-bold">
                                                {msg.senderName}
                                                {msg.role === 'doctor' && <Badge color="blue" className="!text-[8px] !px-1.5 !py-0 shadow-none">DR</Badge>}
                                                {msg.role === 'admin' && <Badge color="rose" className="!text-[8px] !px-1.5 !py-0 shadow-none">ADMIN</Badge>}
                                            </span>
                                        )}
                                        
                                        <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed border backdrop-blur-sm ${bubbleStyle} ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[9px] text-slate-600 mt-1 px-1 opacity-70 font-mono">
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Scroll To Bottom Button */}
                    {showScrollButton && (
                        <button 
                            onClick={scrollToBottom}
                            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 p-2 rounded-full bg-slate-800 border border-white/10 shadow-xl text-indigo-400 animate-bounce hover:bg-slate-700 transition-colors"
                            aria-label="Scroll to bottom"
                        >
                            <ArrowDown size={20} />
                        </button>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-slate-950/80 border-t border-white/5 flex gap-3 backdrop-blur-xl relative z-20">
                        <input 
                            className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all placeholder-slate-600 shadow-inner focus:ring-1 focus:ring-indigo-500"
                            placeholder={t('type_msg')}
                            value={newMessage}
                            maxLength={300}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            aria-label="Message input"
                        />
                        <button 
                            onClick={sendMessage} 
                            disabled={!newMessage.trim()}
                            className="p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label="Send message"
                        >
                            <Send size={20} />
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
import { AlertTriangle, HeartPulse, FileText, PauseCircle, Stethoscope, Shield, Package, Info } from 'lucide-react';

// المكونات الأساسية
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

// النوافذ المنبثقة
import { BreathingModal } from '../components/modals/BreathingModal';
import { DoctorReportModal } from '../components/modals/DoctorReportModal';

// المكونات الفرعية للوحة التحكم
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DailyCheckIn } from './dashboard/DailyCheckIn';
import { DashboardCharts } from './dashboard/DashboardCharts';

import { UserProfile, PlanDay, DailyLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { calculateTotalInventory } from '../services/taperingEngine';

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
  const { t, language } = useLanguage();
  const { inventory } = useData(); // Get inventory directly from context
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // هل المستخدم يتبع طبيباً؟
  const isPatient = userProfile?.role === 'patient';
  const isManualPlan = userProfile?.planType === 'manual';
  const doctorName = userProfile?.patientData?.assignedDoctorName;

  // Inventory Calculation
  const totalStock = calculateTotalInventory(inventory);
  const currentDailyDose = todayPlan?.plannedDose || 0;
  // Estimate days left (safeguard against divide by zero)
  const daysSupply = currentDailyDose > 0 ? totalStock / currentDailyDose : 999;
  const isLowStock = daysSupply < 7 && totalStock > 0;

  return (
    <LayoutContainer>
      <main id="dashboard-content" className="relative space-y-8">
        {/* النوافذ المنبثقة */}
        <BreathingModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
        <DoctorReportModal 
          isOpen={isReportOpen} 
          onClose={() => setIsReportOpen(false)} 
          userProfile={userProfile} 
          logs={logs} 
          plan={plan} 
        />
        
        {/* ترويسة الصفحة مع الأزرار العلوية */}
        <PageHeader 
          title={t('daily_report')}
          subtitle={`${t('welcome')}, ${userProfile?.name || ''}`}
          action={
              <div className="flex flex-wrap gap-3 items-center" role="toolbar" aria-label="Dashboard Actions">
                  <div className="hidden md:block"><LanguageSwitcher /></div>
                  
                  <Button 
                    onClick={() => setIsReportOpen(true)} 
                    variant="secondary" 
                    className="!py-2.5 !px-5 !text-xs !rounded-xl shadow-lg hover:shadow-white/5 border-white/10 focus:ring-slate-500"
                    aria-label={t('export_report')}
                  >
                      <FileText size={16} className="mr-2" aria-hidden="true" /> {t('export_report')}
                  </Button>
                  
                  <Button 
                    variant="panic" 
                    onClick={() => setIsSosOpen(true)} 
                    className="!py-2.5 !px-5 !text-xs !rounded-xl shadow-rose-500/20 focus:ring-rose-500"
                    aria-label={t('sos_button')}
                  >
                      <HeartPulse size={16} className="mr-2 animate-pulse" aria-hidden="true" /> {t('sos_button')}
                  </Button>
              </div>
          }
        />

        {/* 1. لافتة المريض (تظهر فقط للمرضى المرتبطين بأطباء) */}
        {isPatient && (
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-indigo-500/20 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl shadow-lg animate-in slide-in-from-top-2 group">
                <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-colors duration-500 pointer-events-none"></div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
                        <Stethoscope size={28} aria-hidden="true" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">تحت إشراف طبي</p>
                            <Badge color="blue" className="!py-0 !px-1.5 !text-[9px] border-blue-400/30 bg-blue-500/10">VERIFIED</Badge>
                        </div>
                        <p className="text-white font-bold text-lg">د. {doctorName}</p>
                    </div>
                </div>
                <div className="hidden md:block text-right relative z-10 opacity-70">
                    <span className="text-[10px] text-slate-300 block font-mono mb-1">PLAN ID</span>
                    <span className="text-xs font-bold text-white tracking-widest">#{userProfile?.uid?.slice(0,8).toUpperCase()}</span>
                </div>
            </div>
        )}

        {/* 2. تحذيرات النظام (Doctor Notes & Safety Guard & Inventory) */}
        <div className="space-y-4">
            
            {/* أ. ملاحظات الطبيب */}
            {userProfile?.doctorNotes && (
                <div className="bg-indigo-950/40 border border-indigo-500/30 p-5 rounded-3xl animate-in slide-in-from-top-2 flex gap-4 items-start">
                    <div className="p-2 bg-indigo-500/20 rounded-xl shrink-0 text-indigo-400 mt-1">
                        <Info size={20} />
                    </div>
                    <div>
                        <h4 className="text-indigo-300 font-bold text-sm mb-1">{language === 'ar' ? 'ملاحظات الطبيب' : 'Doctor\'s Instructions'}</h4>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{userProfile.doctorNotes}</p>
                    </div>
                </div>
            )}

            {/* ب. تحذير الأمان (Safety Guard) */}
            {showDoctorWarning && !isManualPlan && (
              <div 
                className="relative overflow-hidden bg-rose-950/60 border border-rose-500/50 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl shadow-2xl shadow-rose-900/20 animate-in zoom-in duration-500 ring-1 ring-rose-500/50"
                role="alert"
                aria-live="assertive"
              >
                <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none"></div>
                <div className="flex items-center gap-5 relative z-10">
                  <div className="bg-rose-500/20 p-4 rounded-2xl border border-rose-500/30 shadow-inner">
                      <AlertTriangle className="text-rose-400 w-8 h-8" aria-hidden="true" />
                  </div>
                  <div>
                      <h3 className="font-bold text-white text-xl mb-1 flex items-center gap-2">
                          {t('safety_active')} <Shield size={18} className="text-rose-400" aria-hidden="true"/>
                      </h3>
                      <p className="text-rose-100 text-sm max-w-lg leading-relaxed font-medium">{t('safety_desc')}</p>
                  </div>
                </div>
                <Button 
                    onClick={handleFreezePlan} 
                    variant="danger" 
                    className="w-full md:w-auto !py-3 !px-6 relative z-10 shadow-lg shadow-rose-600/20 hover:shadow-rose-600/40 focus:ring-rose-400"
                    aria-label={t('freeze_plan_btn')}
                >
                   <PauseCircle size={20} className="mr-2" aria-hidden="true" /> {t('freeze_plan_btn')}
                </Button>
              </div>
            )}

            {/* ج. تحذير انخفاض المخزون */}
            {isLowStock && (
                <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-2xl animate-in slide-in-from-bottom-2 flex items-center gap-3 text-sm">
                    <Package size={20} className="text-amber-500 shrink-0 animate-bounce" />
                    <span className="text-amber-200">
                        {language === 'ar' 
                            ? `تنبيه: المخزون المتبقي يكفي لـ ${Math.round(daysSupply)} أيام فقط. يرجى توفير الدواء لضمان استمرار الخطة.`
                            : `Warning: Remaining stock lasts for ~${Math.round(daysSupply)} days. Please restock to maintain the plan.`}
                    </span>
                </div>
            )}
        </div>

        {/* 3. الشبكة الرئيسية (Main Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* العمود الرئيسي: الرأس + تسجيل الدخول */}
          <DashboardHeader
              todayPlan={todayPlan}
              todayLog={todayLog}
              progressPercentage={progressPercentage}
              totalDays={totalDays}
              daysCompleted={daysCompleted}
              userProfile={userProfile}
          >
              {/* نموذج التسجيل اليومي (يظهر داخل الهيدر) */}
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

          {/* العمود الجانبي: الرسوم البيانية والمعلومات */}
          <div className="lg:col-span-4 flex flex-col gap-6">
              <DashboardCharts userProfile={userProfile} plan={plan} />
          </div>

        </div>
      </main>
    </LayoutContainer>
  );
};
```
---

### File: `views\DoctorDashboardView.tsx`
```tsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
    collection, query, where, getDocs, updateDoc, doc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, ManualPhase } from '../types';
import { 
    Users, Clock, CheckCircle, Activity, Plus, X, Trash2, 
    ChevronRight, Save, AlertCircle, Copy, Repeat, Eraser, Stethoscope, LineChart, Info, Check, AlertTriangle, Eye
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { generateManualPlan } from '../services/taperingEngine';
import { useLanguage } from '../contexts/LanguageContext';

// المكونات
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

export const DoctorDashboardView = () => {
    const { t, language } = useLanguage();
    
    // -- State --
    const [loading, setLoading] = useState(true);
    const [doctorProfile, setDoctorProfile] = useState<UserProfile | null>(null);
    const [patients, setPatients] = useState<UserProfile[]>([]);
    const [pendingPatients, setPendingPatients] = useState<UserProfile[]>([]);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // -- Modal State --
    const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
    const [phases, setPhases] = useState<ManualPhase[]>([]);
    
    // Manual Input
    const [newDose, setNewDose] = useState('');
    const [newDays, setNewDays] = useState('7');
    const [doctorNote, setDoctorNote] = useState('');

    // Pattern Builder State
    const [patternSeq, setPatternSeq] = useState('0.5, 1');
    const [patternRepeat, setPatternRepeat] = useState('4');
    const [patternDaysPerDose, setPatternDaysPerDose] = useState('1');

    // Accessibility Refs
    const modalTitleRef = useRef<HTMLHeadingElement>(null);

    // -- Fetch Data --
    useEffect(() => {
        const fetchDoctorData = async () => {
            const currentUser = auth?.currentUser;
            if (!currentUser) return;
            
            setLoading(true);
            try {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDoctorProfile(docSnap.data() as UserProfile);
                }

                const q = query(
                    collection(db, "users"), 
                    where("patientData.assignedDoctorId", "==", currentUser.uid)
                );
                const querySnapshot = await getDocs(q);
                const allPatients: UserProfile[] = [];
                querySnapshot.forEach((doc) => {
                    allPatients.push({ uid: doc.id, ...doc.data() } as UserProfile);
                });

                setPendingPatients(allPatients.filter(p => p.patientData?.requestStatus === 'approved' && !p.patientData?.isPlanAssigned));
                setPatients(allPatients.filter(p => p.patientData?.isPlanAssigned));

            } catch (error) {
                console.error("Error fetching doctor data:", error);
            }
            setLoading(false);
        };

        fetchDoctorData();
    }, []);

    // Focus management when modal opens
    useEffect(() => {
        if (selectedPatient && modalTitleRef.current) {
            modalTitleRef.current.focus();
        }
    }, [selectedPatient]);

    // -- Preview Data Generation --
    const previewData = useMemo(() => {
        if (phases.length === 0) return [];
        // Use a dummy start date to generate the sequence
        const dummyPlan = generateManualPlan(phases, new Date().toISOString());
        return dummyPlan.map((p, i) => ({
            day: i + 1,
            dose: p.plannedDose
        }));
    }, [phases]);

    // -- Helpers --
    const showStatus = (type: 'success' | 'error', text: string) => {
        setStatusMsg({ type, text });
        setTimeout(() => setStatusMsg(null), 4000);
    };

    // -- Actions --
    const handleAddPhase = () => {
        const dose = parseFloat(newDose);
        const days = parseInt(newDays);
        
        if (isNaN(dose) || dose < 0) {
            showStatus('error', "Invalid dosage. Must be 0 or greater.");
            return;
        }
        if (isNaN(days) || days <= 0) {
            showStatus('error', "Duration must be at least 1 day.");
            return;
        }

        setPhases(prev => [...prev, { dose, days }]);
        setNewDose(''); 
    };

    const handleApplyPattern = () => {
        const sequence = patternSeq
            .split(',')
            .map(s => parseFloat(s.trim()))
            .filter(n => !isNaN(n) && n >= 0);
            
        const repeat = parseInt(patternRepeat);
        const days = parseInt(patternDaysPerDose);

        if (sequence.length === 0) {
            showStatus('error', "Pattern sequence is invalid.");
            return;
        }
        if (isNaN(repeat) || repeat <= 0) {
            showStatus('error', "Repeat count must be positive.");
            return;
        }
        if (isNaN(days) || days <= 0) {
            showStatus('error', "Days per dose must be positive.");
            return;
        }

        const newPhases: ManualPhase[] = [];
        for (let i = 0; i < repeat; i++) {
            sequence.forEach(dose => {
                newPhases.push({ dose, days });
            });
        }
        setPhases(prev => [...prev, ...newPhases]);
        showStatus('success', `Added ${newPhases.length} phases from pattern.`);
    };

    const handleRemovePhase = (index: number) => {
        setPhases(prev => prev.filter((_, i) => i !== index));
    };

    const saveTreatmentPlan = async () => {
        if (!selectedPatient?.uid || phases.length === 0) return;
        
        if (!window.confirm("Confirm: This will overwrite any existing plan and notify the patient immediately.")) return;

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

            setPendingPatients(prev => prev.filter(p => p.uid !== selectedPatient.uid));
            setPatients(prev => {
                const exists = prev.find(p => p.uid === selectedPatient.uid);
                if (exists) return prev;
                return [...prev, { 
                    ...selectedPatient, 
                    patientData: { ...selectedPatient.patientData!, isPlanAssigned: true } 
                }];
            });
            
            setSelectedPatient(null);
            setPhases([]);
            setDoctorNote('');
            alert("Plan assigned successfully.");

        } catch (e) {
            console.error("Error saving plan:", e);
            showStatus('error', "Failed to save plan to database.");
        }
    };

    const markAsRecovered = async (patient: UserProfile) => {
        if (!patient.uid) return;
        if (!confirm(`Mark ${patient.name} as recovered? This stops the active plan.`)) return;

        try {
            await updateDoc(doc(db, "users", patient.uid), {
                "patientData.isRecovered": true,
                "patientData.recoveryDate": new Date().toISOString()
            });

            setPatients(prev => prev.map(p => p.uid === patient.uid ? { 
                ...p, patientData: { ...p.patientData!, isRecovered: true } 
            } : p));
        } catch (e) { console.error(e); }
    };

    const statsData = [
        { name: t('stat_new_requests'), value: pendingPatients.length, color: '#f59e0b' },
        { name: 'Active', value: patients.filter(p => !p.patientData?.isRecovered).length, color: '#6366f1' },
        { name: t('stat_recovered'), value: patients.filter(p => p.patientData?.isRecovered).length, color: '#10b981' },
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-indigo-400 gap-2 animate-pulse" role="status">
            <Activity className="animate-spin" />
            <span className="font-bold tracking-widest">LOADING CLINIC DATA...</span>
        </div>
    );

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('nav_dashboard')} 
                subtitle={`Dr. ${doctorProfile?.name || 'Doctor'} - ${doctorProfile?.doctorData?.specialty || ''}`} 
            />

            {/* STATS CARDS */}
            <section aria-label="Clinic Statistics" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-in slide-in-from-top-4">
                <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-white/10 p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors pointer-events-none"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-wider">{t('stat_total_patients')}</p>
                            <h3 className="text-4xl font-black text-white">{patients.length + pendingPatients.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 border border-blue-500/20"><Users size={24} aria-hidden="true"/></div>
                    </div>
                </Card>
                
                <Card className="bg-gradient-to-br from-amber-900/20 to-slate-900/80 border-amber-500/20 p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors pointer-events-none"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-amber-500/80 text-xs font-bold uppercase mb-2 tracking-wider">{t('pending_approvals')}</p>
                            <h3 className="text-4xl font-black text-amber-500">{pendingPatients.length}</h3>
                        </div>
                        <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500 border border-amber-500/20 animate-pulse-glow"><Clock size={24} aria-hidden="true"/></div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-900/20 to-slate-900/80 border-emerald-500/20 p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-emerald-500/80 text-xs font-bold uppercase mb-2 tracking-wider">{t('stat_recovered')}</p>
                            <h3 className="text-4xl font-black text-emerald-500">{patients.filter(p => p.patientData?.isRecovered).length}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-500 border border-emerald-500/20"><CheckCircle size={24} aria-hidden="true"/></div>
                    </div>
                </Card>

                <Card className="bg-slate-900/80 border-white/10 p-6 shadow-xl relative overflow-hidden">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider flex items-center gap-2"><LineChart size={14} aria-hidden="true"/> {t('stat_overview')}</p>
                    <div className="h-16 w-full" aria-hidden="true">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsData} layout="vertical" margin={{top:0, right:0, left:0, bottom:0}}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155'}} itemStyle={{color: '#fff', fontSize: '12px'}} />
                                <Bar dataKey="value" barSize={16} radius={[0, 6, 6, 0]}>
                                    {statsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </section>

            {/* PENDING PATIENTS (Waiting for Plan) */}
            {pendingPatients.length > 0 && (
                <section aria-labelledby="waiting-list-title" className="mb-8 animate-in slide-in-from-bottom-4">
                    <h2 id="waiting-list-title" className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <div className="p-2 bg-amber-500/20 rounded-lg"><AlertCircle className="text-amber-500" size={20} aria-hidden="true"/></div>
                        Waiting for Plan
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingPatients.map(patient => (
                            <div key={patient.uid} className="glass p-6 rounded-3xl relative group hover:border-amber-500/40 transition-all">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 font-bold border border-white/5 shadow-inner">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight">{patient.name}</h3>
                                        <p className="text-xs text-slate-500 font-mono">{patient.email}</p>
                                    </div>
                                    <Badge color="amber" className="mr-auto absolute top-6 right-6">Action Needed</Badge>
                                </div>
                                <div className="bg-slate-950/50 p-4 rounded-2xl text-xs text-slate-400 mb-6 space-y-2 border border-white/5">
                                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Medication:</span> <span className="text-white font-bold">{patient.medType}</span></div>
                                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Form:</span> <span className="text-white font-bold">{patient.medForm}</span></div>
                                    <div className="flex justify-between"><span>Unit:</span> <span className="text-white font-bold">{patient.medUnit}</span></div>
                                </div>
                                <Button onClick={() => setSelectedPatient(patient)} className="w-full shadow-lg shadow-indigo-500/20" variant="primary">
                                    {t('create_plan_btn')} <ChevronRight size={16} className="ml-2" aria-hidden="true"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ACTIVE PATIENTS LIST */}
            <Card className="bg-slate-900/60 border-white/10 overflow-hidden backdrop-blur-xl" noPadding>
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg"><Users className="text-indigo-400" size={20} aria-hidden="true"/></div>
                        {t('stat_total_patients')}
                    </h2>
                    <Badge color="indigo">Total: {patients.length}</Badge>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <caption className="sr-only">List of active patients</caption>
                        <thead className="bg-slate-950/80 text-slate-500 uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="p-5" scope="col">Patient</th>
                                <th className="p-5" scope="col">Status</th>
                                <th className="p-5" scope="col">Progress</th>
                                <th className="p-5" scope="col">Last Active</th>
                                <th className="p-5 text-right" scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {patients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-600 italic flex flex-col items-center justify-center">
                                        <Users size={40} className="mb-4 opacity-20" aria-hidden="true"/>
                                        No active patients with plans.
                                    </td>
                                </tr>
                            )}
                            {patients.map(patient => (
                                <tr key={patient.uid} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-5 font-medium text-white flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold">{patient.name}</div>
                                            <div className="text-xs text-slate-500 font-mono">{patient.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        {patient.patientData?.isRecovered ? (
                                            <Badge color="green" className="shadow-none bg-emerald-500/10 border-emerald-500/20">Recovered</Badge>
                                        ) : (
                                            <Badge color="indigo" className="shadow-none bg-indigo-500/10 border-indigo-500/20">On Plan</Badge>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5" role="progressbar" aria-valuenow={patient.progress || 0} aria-valuemin={0} aria-valuemax={100}>
                                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{width: `${patient.progress || 0}%`}}></div>
                                            </div>
                                            <span className="text-xs font-bold text-indigo-300">{Math.round(patient.progress || 0)}%</span>
                                        </div>
                                    </td>
                                    <td className="p-5 font-mono text-xs">
                                        {patient.lastActive ? new Date(patient.lastActive).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-5 text-right">
                                        {!patient.patientData?.isRecovered && (
                                            <button 
                                                onClick={() => markAsRecovered(patient)}
                                                className="text-xs font-bold text-emerald-400 hover:text-white hover:bg-emerald-500 px-4 py-2 rounded-xl border border-emerald-500/30 hover:border-emerald-500 transition-all shadow-lg shadow-emerald-900/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                aria-label={`Mark ${patient.name} as recovered`}
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in" role="dialog" aria-modal="true" aria-labelledby="plan-modal-title">
                    <div className="w-full max-w-5xl bg-slate-900 border border-white/10 shadow-2xl relative max-h-[90vh] flex flex-col rounded-[2.5rem] overflow-hidden">
                        
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 bg-slate-950/50 flex justify-between items-center">
                            <div>
                                <h2 id="plan-modal-title" ref={modalTitleRef} tabIndex={-1} className="text-3xl font-black text-white mb-2 flex items-center gap-3 outline-none">
                                    <Stethoscope className="text-indigo-500" size={28} aria-hidden="true"/> {t('create_plan_btn')}
                                </h2>
                                <p className="text-slate-400 flex items-center gap-2">Patient: <Badge color="blue">{selectedPatient.name}</Badge></p>
                            </div>
                            <button type="button" onClick={() => setSelectedPatient(null)} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label={t('close')}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Status Message */}
                        {statusMsg && (
                            <div className={`mx-8 mt-6 p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`} role="status">
                                {statusMsg.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
                                {statusMsg.text}
                            </div>
                        )}

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-slate-900/30">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* LEFT: Pattern Builder */}
                                <section className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-3xl shadow-inner" aria-labelledby="pattern-heading">
                                    <h3 id="pattern-heading" className="text-indigo-300 font-bold mb-6 flex items-center gap-2 text-lg">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg"><Repeat size={18} aria-hidden="true"/></div> 
                                        {t('pattern_builder')}
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label htmlFor="patternSeq" className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">{t('pattern_sequence')}</label>
                                            <input 
                                                id="patternSeq"
                                                className="w-full bg-slate-950 border border-indigo-500/30 rounded-xl p-4 text-white font-mono text-sm focus:border-indigo-500 outline-none transition-all placeholder-indigo-900/50 focus:ring-1 focus:ring-indigo-500"
                                                placeholder="e.g. 0.5, 1, 0.5, 1"
                                                value={patternSeq}
                                                onChange={e => setPatternSeq(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label htmlFor="patternRepeat" className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">{t('repeat_count')}</label>
                                                <input 
                                                    id="patternRepeat"
                                                    type="number" min="1" className="w-full bg-slate-950 border border-indigo-500/30 rounded-xl p-4 text-white font-mono text-sm focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500"
                                                    value={patternRepeat} onChange={e => setPatternRepeat(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label htmlFor="patternDays" className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">{t('days_per_dose')}</label>
                                                <input 
                                                    id="patternDays"
                                                    type="number" min="1" className="w-full bg-slate-950 border border-indigo-500/30 rounded-xl p-4 text-white font-mono text-sm focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500"
                                                    value={patternDaysPerDose} onChange={e => setPatternDaysPerDose(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={handleApplyPattern} className="w-full !py-3 !bg-indigo-600 shadow-lg shadow-indigo-900/40" aria-label="Generate phases from pattern">
                                            <Copy size={16} className="mr-2" aria-hidden="true"/> {t('apply_pattern')}
                                        </Button>
                                    </div>
                                </section>

                                {/* RIGHT: Manual Entry */}
                                <section className="bg-slate-950/60 border border-white/5 p-6 rounded-3xl" aria-labelledby="manual-heading">
                                    <h3 id="manual-heading" className="text-white font-bold mb-6 flex items-center gap-2 text-lg">
                                        <div className="p-2 bg-slate-800 rounded-lg"><Plus size={18} aria-hidden="true"/></div>
                                        Manual Entry
                                    </h3>
                                    <div className="flex gap-4 mb-5">
                                        <div className="flex-1">
                                            <label htmlFor="manualDose" className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">{t('dose')}</label>
                                            <input id="manualDose" type="number" min="0" step="0.1" className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500" value={newDose} onChange={e => setNewDose(e.target.value)}/>
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="manualDays" className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">{t('duration_days')}</label>
                                            <input id="manualDays" type="number" min="1" className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500" value={newDays} onChange={e => setNewDays(e.target.value)}/>
                                        </div>
                                    </div>
                                    <Button onClick={handleAddPhase} variant="secondary" className="w-full !py-3 !text-xs">Add Single Phase</Button>
                                </section>
                            </div>

                            {/* Plan Visual Preview */}
                            <section className="bg-slate-950/80 p-6 rounded-3xl border border-white/5" aria-labelledby="preview-heading">
                                <h3 id="preview-heading" className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
                                    <Eye size={20} className="text-sky-400" /> Plan Visual Preview
                                </h3>
                                <div className="h-64 w-full">
                                    {previewData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={previewData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorDosePreview" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                                                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `Day ${val}`} />
                                                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                                                <Tooltip 
                                                    contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                                    itemStyle={{color: '#fff', fontSize: '12px'}}
                                                    formatter={(value) => [`${value} ${selectedPatient?.medUnit}`, 'Dose']}
                                                />
                                                <Area type="stepAfter" dataKey="dose" stroke="#38bdf8" strokeWidth={3} fill="url(#colorDosePreview)" animationDuration={1000} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
                                            <Activity size={40} className="mb-2 opacity-20" />
                                            <p>Add phases to see the projection curve</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Phases List - Live Region */}
                            <section className="bg-slate-950/80 p-6 rounded-3xl border border-white/5" aria-labelledby="phases-heading">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 id="phases-heading" className="text-white font-bold flex items-center gap-2 text-lg"><Activity size={20} className="text-emerald-400" aria-hidden="true"/> {t('plan_phases')}</h3>
                                    {phases.length > 0 && (
                                        <button onClick={() => setPhases([])} className="text-rose-400 text-xs font-bold flex items-center gap-1 hover:text-rose-300 bg-rose-900/20 px-3 py-1.5 rounded-lg transition-colors border border-rose-500/20 focus:outline-none focus:ring-2 focus:ring-rose-500">
                                            <Eraser size={14} aria-hidden="true"/> {t('clear_phases')}
                                        </button>
                                    )}
                                </div>
                                <div 
                                    className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2" 
                                    role="list"
                                    aria-live="polite"
                                    aria-atomic="false"
                                >
                                    {phases.length === 0 && (
                                        <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600">
                                            No phases added yet. Start building the plan above.
                                        </div>
                                    )}
                                    {phases.map((phase, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-white/5 animate-in slide-in-from-right-2 hover:border-indigo-500/30 transition-colors" role="listitem">
                                            <span className="text-white font-bold text-sm flex items-center gap-3">
                                                <span className="bg-slate-800 text-slate-400 w-6 h-6 flex items-center justify-center rounded-full text-[10px]">{idx + 1}</span>
                                                <span className="text-indigo-400 text-xl font-black">{phase.dose} <span className="text-xs font-normal text-indigo-300/60">{selectedPatient.medUnit || 'mg'}</span></span> 
                                                <span className="w-px h-4 bg-slate-700 mx-2" aria-hidden="true"></span>
                                                <span className="text-slate-400 text-xs font-mono">{phase.days} days</span>
                                            </span>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemovePhase(idx)} 
                                                className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                                                aria-label={`Remove phase ${idx + 1}`}
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between text-sm font-bold text-slate-400">
                                    <span>Total Duration: <span className="text-white">{phases.reduce((a,b) => a + b.days, 0)} days</span></span>
                                    <span>Total Phases: <span className="text-white">{phases.length}</span></span>
                                </div>
                            </section>

                            {/* Notes */}
                            <div className="group">
                                <label htmlFor="docNotes" className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-1 group-focus-within:text-indigo-400 transition-colors">{t('plan_notes')}</label>
                                <textarea 
                                    id="docNotes"
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-white h-24 outline-none focus:border-indigo-500 transition-all resize-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Add instructions or comments for the patient..."
                                    value={doctorNote}
                                    onChange={e => setDoctorNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-slate-950/80 backdrop-blur-md flex justify-end gap-4">
                            <Button variant="secondary" onClick={() => setSelectedPatient(null)}>{t('close')}</Button>
                            <Button variant="success" onClick={saveTreatmentPlan} disabled={phases.length === 0} className="shadow-lg shadow-emerald-500/20">
                                <Save size={18} className="mr-2" aria-hidden="true"/> {t('submit_plan')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `views\DoctorPatientsView.tsx`
```tsx
import React, { useEffect, useState, useMemo } from 'react';
import { 
    collection, query, where, getDocs, updateDoc, doc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, DailyLog } from '../types';
import { 
    Users, Search, UserPlus, FileText, Activity, Moon, Smile, Frown, Meh, Calendar, ChevronLeft, X, UserCheck, UserX, Clock, BarChart2
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

// المكونات
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

export const DoctorPatientsView = () => {
    const { t, language } = useLanguage();

    // -- State --
    const [myPatients, setMyPatients] = useState<UserProfile[]>([]);
    const [pendingRequests, setPendingRequests] = useState<UserProfile[]>([]);
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
            const q = query(
                collection(db, "users"), 
                where("patientData.assignedDoctorId", "==", currentUser.uid)
            );
            const snapshot = await getDocs(q);
            const allAssigned: UserProfile[] = [];
            snapshot.forEach(d => allAssigned.push({ uid: d.id, ...d.data() } as UserProfile));

            setMyPatients(allAssigned.filter(p => p.patientData?.requestStatus === 'approved'));
            setPendingRequests(allAssigned.filter(p => p.patientData?.requestStatus === 'pending'));

        } catch (e) { console.error("Error fetching data:", e); }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // -- Memoized Filters (Performance Optimization) --
    const filteredAvailable = useMemo(() => {
        return availableUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [availableUsers, searchTerm]);

    const filteredMyPatients = useMemo(() => {
        return myPatients.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [myPatients, searchTerm]);

    // -- Memoized & Sorted Logs for Chart --
    const sortedPatientLogs = useMemo(() => {
        return [...patientLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [patientLogs]);

    // -- Actions --

    const handleAcceptRequest = async (patient: UserProfile) => {
        if (!patient.uid) return;
        if (!confirm(`Accept ${patient.name} as your patient?`)) return;

        try {
            await updateDoc(doc(db, "users", patient.uid), {
                "patientData.requestStatus": "approved",
                "patientData.isPlanAssigned": false 
            });
            
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
            setPendingRequests(prev => prev.filter(p => p.uid !== patient.uid));
        } catch (e) { console.error(e); }
    };

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
                    requestStatus: 'approved',
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

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('manage_patients_title')} 
                subtitle="Track progress and manage your clinic."
                action={
                    viewMode === 'LIST' ? (
                        <Button onClick={() => { setViewMode('ADD_NEW'); fetchAvailableUsers(); }} variant="primary" className="!rounded-xl shadow-indigo-500/20">
                            <UserPlus size={18} aria-hidden="true" /> {t('add_patient_btn')}
                        </Button>
                    ) : (
                        <Button onClick={() => setViewMode('LIST')} variant="secondary" className="!rounded-xl">
                            <ChevronLeft size={18} aria-hidden="true" /> {t('back_list_btn')}
                        </Button>
                    )
                }
            />

            {/* --- ADD NEW PATIENT MODE --- */}
            {viewMode === 'ADD_NEW' && (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <Card className="bg-slate-900/80 border-white/10 mb-6 backdrop-blur-xl">
                        <h3 className="text-xl font-bold text-white mb-6">Find Users</h3>
                        <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-white/5 mb-6 group focus-within:border-indigo-500/50 transition-colors">
                            <label htmlFor="user-search" className="sr-only">Search Users</label>
                            <Search className="text-slate-500 group-focus-within:text-indigo-400" aria-hidden="true" />
                            <input 
                                id="user-search"
                                className="bg-transparent w-full text-white outline-none placeholder-slate-600"
                                placeholder={t('search_available_placeholder')}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar" role="list">
                            {filteredAvailable.map(user => (
                                <div key={user.uid} className="flex justify-between items-center p-5 rounded-2xl border border-white/5 bg-slate-900/40 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all group" role="listitem">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-white/5 group-hover:scale-110 transition-transform">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{user.name}</h4>
                                            <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                                        </div>
                                    </div>
                                    <Button onClick={() => handleManualAdd(user)} variant="success" className="!py-2 !px-4 !text-xs !rounded-xl shadow-emerald-500/10">
                                        <UserPlus size={16} className="mr-2" aria-hidden="true"/> {t('add_btn')}
                                    </Button>
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
                    <div className="flex p-1.5 bg-slate-900/50 rounded-2xl border border-white/10 mb-8 w-fit backdrop-blur-md" role="tablist">
                        <button 
                            onClick={() => setActiveTab('MY_PATIENTS')}
                            role="tab"
                            aria-selected={activeTab === 'MY_PATIENTS'}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${activeTab === 'MY_PATIENTS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {t('stat_total_patients')}
                            <Badge color="blue" className="!py-0 !px-1.5 bg-white/20 text-white border-transparent">{myPatients.length}</Badge>
                        </button>
                        
                        <button 
                            onClick={() => setActiveTab('REQUESTS')}
                            role="tab"
                            aria-selected={activeTab === 'REQUESTS'}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 ${activeTab === 'REQUESTS' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {t('patient_requests_title')}
                            {pendingRequests.length > 0 && <Badge color="red" className="!py-0 !px-1.5 bg-white/20 text-white border-transparent animate-pulse">{pendingRequests.length}</Badge>}
                        </button>
                    </div>

                    {/* TAB: REQUESTS */}
                    {activeTab === 'REQUESTS' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-left-4">
                            {pendingRequests.length === 0 && (
                                <div className="col-span-full text-center py-16 bg-slate-900/30 rounded-[2.5rem] border border-dashed border-slate-800 text-slate-500">
                                    <Clock size={48} className="mx-auto mb-4 opacity-20"/> {t('no_requests')}
                                </div>
                            )}
                            {pendingRequests.map(patient => (
                                <div key={patient.uid} className="bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 p-6 rounded-[2rem] relative shadow-lg hover:shadow-amber-900/10 transition-all">
                                    <Badge color="amber" className="absolute top-6 right-6 !py-1 !px-3 shadow-none bg-amber-500/10 border-amber-500/20">Pending</Badge>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-xl border border-white/5">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{patient.name}</h3>
                                            <p className="text-xs text-slate-500 font-mono">{patient.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-xs text-slate-400 bg-slate-950/50 p-4 rounded-xl mb-6 border border-white/5">
                                        <div className="flex-1 text-center border-r border-white/10">
                                            <span className="block font-bold text-white text-base mb-1">{patient.medType}</span>Type
                                        </div>
                                        <div className="flex-1 text-center">
                                            <span className="block font-bold text-white text-base mb-1">{patient.medForm}</span>Form
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button onClick={() => handleAcceptRequest(patient)} variant="success" className="flex-1 !py-3 !text-xs shadow-emerald-500/10">
                                            <UserCheck size={16} className="mr-2" aria-hidden="true"/> {t('accept_patient')}
                                        </Button>
                                        <Button onClick={() => handleRejectRequest(patient)} variant="danger" className="flex-1 !py-3 !text-xs shadow-rose-500/10">
                                            <UserX size={16} className="mr-2" aria-hidden="true"/> {t('reject_patient')}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TAB: MY PATIENTS */}
                    {activeTab === 'MY_PATIENTS' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-right-4">
                            {filteredMyPatients.map(patient => (
                                <div 
                                    key={patient.uid} 
                                    onClick={() => openPatientDetails(patient)}
                                    className="bg-slate-900/60 border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 hover:bg-slate-900/80 cursor-pointer transition-all group relative overflow-hidden backdrop-blur-md shadow-lg focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`View details for ${patient.name}`}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
                                    
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 font-bold text-2xl border border-white/5 shadow-inner group-hover:scale-105 transition-transform">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{patient.name}</h3>
                                                <p className="text-sm text-slate-500 font-mono">{patient.email}</p>
                                            </div>
                                        </div>
                                        <Badge color={patient.patientData?.isRecovered ? 'green' : patient.patientData?.isPlanAssigned ? 'indigo' : 'amber'} className="shadow-none">
                                            {patient.patientData?.isRecovered ? 'Recovered' : patient.patientData?.isPlanAssigned ? 'Active' : 'Needs Plan'}
                                        </Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-3 relative z-10">
                                        <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-center group-hover:border-white/10 transition-colors">
                                            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Progress</span>
                                            <span className="block font-black text-indigo-400 text-lg">{Math.round(patient.progress || 0)}%</span>
                                        </div>
                                        <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-center group-hover:border-white/10 transition-colors">
                                            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Status</span>
                                            <span className={`block font-bold text-sm mt-1 ${patient.patientData?.isPlanAssigned ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {patient.patientData?.isPlanAssigned ? 'On Track' : 'Waiting'}
                                            </span>
                                        </div>
                                        <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-center group-hover:border-white/10 transition-colors">
                                            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Last Active</span>
                                            <span className="block font-bold text-slate-300 text-xs mt-1.5 font-mono">
                                                {patient.lastActive ? new Date(patient.lastActive).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- PATIENT DETAILS MODAL --- */}
            {selectedPatient && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="w-full max-w-6xl h-[90vh] flex flex-col bg-slate-900 border border-white/10 shadow-2xl relative rounded-[2.5rem] overflow-hidden">
                        
                        {/* Header */}
                        <div className="p-8 bg-slate-950/80 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/30">
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 id="modal-title" className="text-3xl font-black text-white mb-1">{selectedPatient.name}</h2>
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <FileText size={16} className="text-indigo-400" aria-hidden="true"/> 
                                        <span className="text-white font-bold">{selectedPatient.medType || 'General'}</span> 
                                        <span aria-hidden="true">•</span>
                                        <span>{selectedPatient.medForm}</span>
                                        <span aria-hidden="true">•</span>
                                        <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">{selectedPatient.medUnit}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedPatient(null)} 
                                className="p-3 bg-slate-800/50 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                aria-label="Close details"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 custom-scrollbar bg-slate-900/30">
                            
                            {/* Charts Area */}
                            <div className="lg:col-span-2 space-y-8">
                                <Card className="bg-slate-900/60 border-white/5 p-6 h-[400px] flex flex-col shadow-inner">
                                    <h3 className="text-white font-bold mb-6 flex items-center gap-3 text-lg">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg"><Activity size={20} className="text-indigo-400" aria-hidden="true"/></div>
                                        Adherence & Dosage
                                    </h3>
                                    <div className="flex-1 w-full" role="img" aria-label="Adherence Chart">
                                        {sortedPatientLogs.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={sortedPatientLogs.slice(-30)} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                                    <defs>
                                                        <linearGradient id="colorDoseP" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                                    <XAxis dataKey="date" hide />
                                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                    <Tooltip 
                                                        contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                                        itemStyle={{color: '#fff'}}
                                                    />
                                                    <Area type="monotone" dataKey="doseTaken" stroke="#6366f1" strokeWidth={3} fill="url(#colorDoseP)" animationDuration={1500} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
                                                <BarChart2 size={40} className="mb-2 opacity-20"/> No data available
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>

                            {/* Stats & Logs */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/5 text-center shadow-lg">
                                         <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-2">{t('sleep_label')}</span>
                                         <span className="text-2xl font-black text-white flex items-center justify-center gap-2">
                                             <Moon size={20} className="text-blue-400" aria-hidden="true"/> 
                                             {patientLogs.length > 0 ? (patientLogs.reduce((a,b) => a + (b.sleepHours || 0), 0) / patientLogs.length).toFixed(1) : '-'} <span className="text-sm text-slate-600">h</span>
                                         </span>
                                     </div>
                                     <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/5 text-center shadow-lg">
                                         <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-2">{t('mood')}</span>
                                         <span className="text-xl font-bold text-white flex items-center justify-center gap-2 mt-1">
                                             <Smile size={24} className="text-emerald-400" aria-hidden="true"/> Good
                                         </span>
                                     </div>
                                </div>
                                
                                <Card className="bg-slate-900/60 border-white/5 flex-1 max-h-[500px] overflow-hidden flex flex-col !p-0 shadow-lg">
                                    <div className="p-6 border-b border-white/5 bg-slate-900/40">
                                        <h3 className="text-white font-bold flex items-center gap-3">
                                            <Calendar size={20} className="text-amber-400" aria-hidden="true"/> Recent Logs
                                        </h3>
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar flex-1 p-4 space-y-2">
                                        <table className="w-full text-left border-collapse">
                                            <caption className="sr-only">Patient Daily Logs</caption>
                                            <thead className="sr-only">
                                                <tr>
                                                    <th scope="col">Date</th>
                                                    <th scope="col">Dose</th>
                                                    <th scope="col">Mood</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {/* Using sortedPatientLogs for consistency in the list too, but reversing for latest first */}
                                            {[...sortedPatientLogs].reverse().map((log, i) => (
                                                <tr key={i} className="flex justify-between items-center p-4 rounded-xl bg-slate-950/50 border border-white/5 text-sm hover:bg-slate-800/50 transition-colors mb-2">
                                                    <td className="text-slate-400 font-mono">{log.date}</td>
                                                    <td className="font-bold text-white text-base">{log.doseTaken} <span className="text-xs text-slate-500 font-normal">{selectedPatient.medUnit}</span></td>
                                                    <td>
                                                        {log.mood === 'good' ? <Smile size={18} className="text-emerald-500" aria-label="Good"/> : 
                                                         log.mood === 'bad' ? <Frown size={18} className="text-rose-500" aria-label="Bad"/> : 
                                                         <Meh size={18} className="text-amber-500" aria-label="Average"/>}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `views\LoginView.tsx`
```tsx
import React, { useState } from 'react';
import { Activity, Chrome, LogIn, UserPlus, User, Mail, Lock, Ruler, Weight, Calendar, CheckSquare, Square, KeyRound, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

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
  const { t, dir, language } = useLanguage();
  const { signupWithEmail, resetPassword } = useAuth();
  
  // Local state
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [resetStatus, setResetStatus] = useState<{type: 'success'|'error', msg: string} | null>(null);

  // Additional Signup Data
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResetStatus(null);

    try {
        if (isResetMode) {
            if (!email) {
                setResetStatus({ type: 'error', msg: language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required' });
                setIsLoading(false);
                return;
            }
            await resetPassword(email);
            setResetStatus({ type: 'success', msg: language === 'ar' ? 'تم إرسال رابط التعيين. تفقد بريدك.' : 'Reset link sent. Check your email.' });
            setTimeout(() => {
                setIsResetMode(false);
                setResetStatus(null);
            }, 3000);
        } else if (isSignUp) {
            if (!hasConsented) {
                alert(language === 'ar' ? "يجب الموافقة على الشروط والتنبيه الطبي للمتابعة." : "You must agree to the terms and medical disclaimer.");
                setIsLoading(false);
                return;
            }
            if (!name || !age || !weight || !height) {
                alert(language === 'ar' ? "يرجى تعبئة جميع البيانات الصحية" : "Please fill all health data");
                setIsLoading(false);
                return;
            }
            
            await signupWithEmail(email, password, name, {
                age: parseInt(age),
                weight: parseFloat(weight),
                height: parseFloat(height)
            });
        } else {
            await handleLogin(e);
        }
    } catch (err: any) {
        console.error("Auth Error", err);
        if (isResetMode) {
            setResetStatus({ type: 'error', msg: err.message || 'Failed to send reset email.' });
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-500" dir={dir}>
      
      <div className="absolute top-0 right-0 -mt-12 z-50">
        <LanguageSwitcher />
      </div>

      <Card className="!bg-slate-900/80 border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden" noPadding>
        <div className="p-8 md:p-10 relative">
            
            {/* Logo & Header */}
            <div className="text-center mb-8">
                <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4 ring-1 ring-white/10">
                    {isResetMode ? <KeyRound className="w-10 h-10 text-white" /> : <Activity className="w-10 h-10 text-white" />}
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
                    {isResetMode ? (language === 'ar' ? 'استعادة كلمة المرور' : 'Reset Password') : 
                     isSignUp ? (language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account') : "Islam's Guide"}
                </h1>
                <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-xs mx-auto">
                    {isResetMode ? (language === 'ar' ? 'أدخل بريدك لاستلام رابط التعيين' : 'Enter email to receive reset link') :
                     isSignUp ? (language === 'ar' ? 'ابدأ رحلة التعافي الآمنة اليوم' : 'Start your safe recovery journey today') : 
                     t('subtitle')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Signup Fields */}
                {isSignUp && !isResetMode && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4">
                        <div className="relative group">
                            <label htmlFor="fullname" className="sr-only">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                            <User className="absolute top-3.5 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" size={20} />
                            <input 
                                id="fullname"
                                type="text" 
                                name="name"
                                autoComplete="name"
                                placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-white outline-none transition-all placeholder-slate-600"
                                required
                            />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                            <div className="relative group">
                                <label htmlFor="age" className="sr-only">{language === 'ar' ? 'العمر' : 'Age'}</label>
                                <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10 text-slate-500 pointer-events-none"><Calendar size={16}/></div>
                                <input id="age" type="number" name="age" placeholder={language === 'ar' ? 'العمر' : 'Age'} value={age} onChange={(e) => setAge(e.target.value)} className="w-full pl-10 pr-2 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-white outline-none text-sm text-center" required min="18" max="99"/>
                            </div>
                            <div className="relative group">
                                <label htmlFor="weight" className="sr-only">{language === 'ar' ? 'الوزن' : 'Weight'}</label>
                                <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10 text-slate-500 pointer-events-none"><Weight size={16}/></div>
                                <input id="weight" type="number" name="weight" placeholder={language === 'ar' ? 'وزن (kg)' : 'Weight'} value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full pl-10 pr-2 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-white outline-none text-sm text-center" required />
                            </div>
                            <div className="relative group">
                                <label htmlFor="height" className="sr-only">{language === 'ar' ? 'الطول' : 'Height'}</label>
                                <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10 text-slate-500 pointer-events-none"><Ruler size={16}/></div>
                                <input id="height" type="number" name="height" placeholder={language === 'ar' ? 'طول (cm)' : 'Height'} value={height} onChange={(e) => setHeight(e.target.value)} className="w-full pl-10 pr-2 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-white outline-none text-sm text-center" required />
                            </div>
                        </div>
                    </div>
                )}

                {/* Common Fields */}
                <div className="space-y-4">
                    <div className="relative group">
                        <label htmlFor="email" className="sr-only">{t('email')}</label>
                        <Mail className="absolute top-3.5 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" size={20} />
                        <input 
                            id="email"
                            type="email" 
                            name="email"
                            autoComplete="email"
                            placeholder={t('email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-white outline-none transition-all placeholder-slate-600"
                            required
                        />
                    </div>
                    {!isResetMode && (
                        <div className="relative group animate-in slide-in-from-bottom-2">
                            <label htmlFor="password" className="sr-only">{t('password')}</label>
                            <Lock className="absolute top-3.5 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" size={20} />
                            <input 
                                id="password"
                                type="password" 
                                name="password"
                                autoComplete={isSignUp ? "new-password" : "current-password"}
                                placeholder={t('password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-white outline-none transition-all placeholder-slate-600"
                                required
                                minLength={6}
                            />
                        </div>
                    )}
                </div>

                {/* Forgot Password Link */}
                {!isSignUp && !isResetMode && (
                    <div className="flex justify-end -mt-1">
                        <button 
                            type="button"
                            onClick={() => { setIsResetMode(true); setResetStatus(null); }}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                        </button>
                    </div>
                )}

                {/* Privacy Consent Checkbox (Only for Signup) */}
                {isSignUp && !isResetMode && (
                    <div className="flex items-start gap-3 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 animate-in slide-in-from-bottom-2 cursor-pointer" onClick={() => setHasConsented(!hasConsented)}>
                        <div className={`mt-0.5 shrink-0 transition-colors ${hasConsented ? 'text-indigo-400' : 'text-slate-500'}`}>
                            {hasConsented ? <CheckSquare size={18} /> : <Square size={18} />}
                        </div>
                        <label className="text-xs text-slate-300 leading-relaxed cursor-pointer select-none">
                            {language === 'ar' 
                                ? 'أقر بأنني قرأت التنبيه الطبي، وأفهم أن هذا التطبيق أداة مساعدة فقط وليس بديلاً عن الطبيب. أوافق على جمع البيانات الصحية لغرض تتبع التعافي.'
                                : 'I acknowledge the medical disclaimer. I understand this app is a tool, not a doctor. I consent to processing my health data for recovery tracking.'}
                        </label>
                    </div>
                )}
                
                {/* Error/Status Messages */}
                {(loginError || resetStatus) && (
                    <div className={`text-xs p-3 rounded-xl border flex items-center gap-2 animate-in slide-in-from-top-2 font-bold ${resetStatus?.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`} role="alert">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${resetStatus?.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div> 
                        {resetStatus ? resetStatus.msg : loginError}
                    </div>
                )}
                
                {/* Submit Button */}
                <div className="flex gap-3 mt-2">
                    {isResetMode && (
                        <Button 
                            variant="secondary"
                            onClick={() => { setIsResetMode(false); setResetStatus(null); }}
                            className="px-4"
                            disabled={isLoading}
                        >
                            {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                        </Button>
                    )}
                    <Button 
                        className="flex-1 py-4 text-lg shadow-lg shadow-indigo-500/20" 
                        type="submit" 
                        isLoading={isLoading}
                        disabled={isSignUp && !hasConsented}
                    >
                        {isResetMode 
                            ? (language === 'ar' ? 'إرسال الرابط' : 'Send Link')
                            : isSignUp 
                                ? (language === 'ar' ? 'إنشاء الحساب' : 'Create Account') 
                                : t('login_email')} 
                        {!isLoading && !isResetMode && (isSignUp ? <UserPlus size={18} className="ml-2"/> : <LogIn size={18} className="ml-2"/>)}
                    </Button>
                </div>
            </form>

            {/* Separator & Social Login (Hide in Reset Mode) */}
            {!isResetMode && (
                <>
                    <div className="my-6 flex items-center gap-4 text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">
                        <div className="h-px bg-slate-800 flex-1"></div>
                        {t('or')}
                        <div className="h-px bg-slate-800 flex-1"></div>
                    </div>

                    <Button 
                        onClick={handleGoogleLogin}
                        variant="secondary"
                        className="w-full py-3 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-950 border-0 flex items-center justify-center gap-2 font-bold"
                    >
                        <Chrome className="w-5 h-5 text-slate-900" />
                        <span>{t('login_google')}</span>
                    </Button>
                </>
            )}

            {/* Toggle Mode */}
            {!isResetMode && (
                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm">
                        {isSignUp ? (language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?') : (language === 'ar' ? 'لا تملك حساباً؟' : "Don't have an account?")}
                        <button 
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setHasConsented(false); 
                                setResetStatus(null);
                            }}
                            className="text-indigo-400 font-bold hover:text-indigo-300 ml-2 transition-colors underline decoration-indigo-500/30 underline-offset-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1"
                        >
                            {isSignUp ? (language === 'ar' ? 'تسجيل الدخول' : 'Sign In') : (language === 'ar' ? 'انضم إلينا' : 'Sign Up')}
                        </button>
                    </p>
                </div>
            )}

            {/* Demo Button */}
            {!isSignUp && !isResetMode && (
                <div className="mt-6 pt-6 border-t border-white/5 text-center">
                    <button 
                        onClick={setDemoCreds}
                        className="text-slate-600 text-xs font-mono hover:text-slate-400 transition-colors focus:outline-none focus:text-slate-300"
                    >
                        {t('demo_account')}
                    </button>
                </div>
            )}
        </div>
      </Card>
    </div>
  );
};
```
---

### File: `views\OnboardingView.tsx`
```tsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle, Pill, AlertTriangle, ArrowRight, ArrowLeft, 
  Stethoscope, BrainCircuit, FlaskConical, UserPlus, FileText, MapPin, Phone, Award, Search, User, ChevronRight, Activity, Info
} from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

// Components
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { Badge } from '../components/ui/Badge';
import { ScientificPlanModal } from '../components/modals/ScientificPlanModal';

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
  const { t, dir, language } = useLanguage();
  
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
  
  // -- Local Buffers for Numeric Inputs (Fixes Glitches) --
  const [localInv, setLocalInv] = useState<{boxes: string, pills: string, loose: string}>({
      boxes: '0', pills: '0', loose: '0'
  });
  const [localDose, setLocalDose] = useState<string>('0');

  // Initialize local buffers when entering inventory step
  useEffect(() => {
      if (step === 'ALGO_SETUP_INV') {
          setLocalInv({
              boxes: inventory.boxes.toString(),
              pills: inventory.pillsPerBox.toString(),
              loose: inventory.loosePills.toString()
          });
          setLocalDose(currentDoseHabit > 0 ? currentDoseHabit.toString() : '');
      }
  }, [step]); // Only reset on step entry

  // Helper to calculate total from local strings
  const localTotalInventory = useMemo(() => {
      const b = parseInt(localInv.boxes) || 0;
      const p = parseInt(localInv.pills) || 0;
      const l = parseFloat(localInv.loose) || 0;
      return (b * p) + l;
  }, [localInv]);
  
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
        className="absolute top-6 left-6 z-50 p-3 rounded-full glass hover:bg-white/10 text-slate-400 hover:text-white transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={loading}
        aria-label={dir === 'rtl' ? "رجوع" : "Go Back"}
      >
        {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
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
      // Sync local state to parent state just before generating
      const finalInventory = {
          boxes: parseInt(localInv.boxes) || 0,
          pillsPerBox: parseInt(localInv.pills) || 0,
          loosePills: parseFloat(localInv.loose) || 0,
          totalPills: localTotalInventory
      };
      const finalDose = parseFloat(localDose) || 0;

      setInventory(finalInventory);
      setCurrentDoseHabit(finalDose);

      const plan = generatePlan(localTotalInventory, finalDose, new Date().toISOString(), 1.0, [], medForm || 'tablet');
      setPreviewPlan(plan);
      setStep('ALGO_PREVIEW');
      setShowSciModal(true);
  };

  // --- RENDERS ---

  // Wrapper with Ambient Background
  const OnboardingWrapper = ({ children }: { children: React.ReactNode }) => (
      <div className="min-h-screen bg-[#020617] p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden" dir={dir}>
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-float opacity-50 pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] animate-float opacity-40 delay-1000 pointer-events-none"></div>
          <div className="absolute top-6 right-6 z-50"><LanguageSwitcher /></div>
          {children}
      </div>
  );

  if (step === 'ROLE_SELECT') {
      return (
        <OnboardingWrapper>
             {handleLogout && <NavBackBtn />}
             <header className="mb-12 text-center animate-in slide-in-from-top-4 relative z-10">
                <h1 className="text-4xl font-black text-white mb-4 drop-shadow-lg">{t('onboard_title')}</h1>
                <p className="text-slate-400 max-w-lg mx-auto text-lg">{t('onboard_desc')}</p>
             </header>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full relative z-10" role="group" aria-label="Role Selection">
                 {/* خيار المريض */}
                 <button 
                    onClick={() => setStep('USER_PATH_SELECT')} 
                    className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
                    aria-label={`${t('role_patient')} - ${t('role_patient_desc')}`}
                 >
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="w-16 h-16 bg-indigo-500/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20 border border-indigo-500/30">
                        <UserPlus size={32} className="text-indigo-400"/>
                     </div>
                     <h3 className="text-3xl font-bold text-white mb-3">{t('role_patient')}</h3>
                     <p className="text-slate-400 leading-relaxed text-sm font-medium">{t('role_patient_desc')}</p>
                 </button>
                 
                 {/* خيار الطبيب */}
                 <button 
                    onClick={() => setStep('DOCTOR_FORM')} 
                    className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden shadow-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
                    aria-label={`${t('role_doctor')} - ${t('role_doctor_desc')}`}
                 >
                     <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="w-16 h-16 bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20 border border-emerald-500/30">
                        <Stethoscope size={32} className="text-emerald-400"/>
                     </div>
                     <h3 className="text-3xl font-bold text-white mb-3">{t('role_doctor')}</h3>
                     <p className="text-slate-400 leading-relaxed text-sm font-medium">{t('role_doctor_desc')}</p>
                 </button>
             </div>
        </OnboardingWrapper>
      );
  }

  if (step === 'DOCTOR_FORM') {
      return (
          <OnboardingWrapper>
              <NavBackBtn to="ROLE_SELECT" />
              <div className="max-w-2xl w-full animate-in fade-in slide-in-from-bottom-8 relative z-10 pt-20">
                  <header className="text-center mb-8">
                      <h1 className="text-3xl font-black text-white mb-2">{t('doc_req_title')}</h1>
                      <p className="text-slate-400">{t('doc_req_desc')}</p>
                  </header>
                  <Card className="!bg-slate-900/80 border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
                      <div className="group">
                          <label htmlFor="docName" className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_fullname')}</label>
                          <div className="relative">
                              <User className="absolute top-3.5 right-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" size={20} />
                              <input id="docName" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all placeholder-slate-600" placeholder={t('doc_fullname')} value={doctorName} onChange={e => setDoctorName(e.target.value)}/>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="group">
                              <label htmlFor="specialty" className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_specialty')}</label>
                              <div className="relative">
                                  <Award className="absolute top-3.5 right-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" size={20} />
                                  <input id="specialty" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all placeholder-slate-600" placeholder={t('doc_specialty')} value={doctorForm.specialty} onChange={e => setDoctorForm({...doctorForm, specialty: e.target.value})}/>
                              </div>
                          </div>
                          <div className="group">
                              <label htmlFor="license" className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_license')}</label>
                              <div className="relative">
                                  <FileText className="absolute top-3.5 right-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" size={20} />
                                  <input id="license" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all placeholder-slate-600" placeholder={t('doc_license')} value={doctorForm.licenseNumber} onChange={e => setDoctorForm({...doctorForm, licenseNumber: e.target.value})}/>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="group">
                              <label htmlFor="location" className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_location')}</label>
                              <div className="relative">
                                  <MapPin className="absolute top-3.5 right-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" size={20} />
                                  <input id="location" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all placeholder-slate-600" placeholder={t('doc_location')} value={doctorForm.clinicLocation} onChange={e => setDoctorForm({...doctorForm, clinicLocation: e.target.value})}/>
                              </div>
                          </div>
                          <div className="group">
                              <label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_phone')}</label>
                              <div className="relative">
                                  <Phone className="absolute top-3.5 right-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" size={20} />
                                  <input id="phone" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all placeholder-slate-600" placeholder="+966..." value={doctorForm.phoneNumber} onChange={e => setDoctorForm({...doctorForm, phoneNumber: e.target.value})}/>
                              </div>
                          </div>
                      </div>

                      <div className="group">
                          <label htmlFor="bio" className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_bio')}</label>
                          <textarea id="bio" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none h-24 resize-none transition-all placeholder-slate-600" placeholder={t('doc_bio')} value={doctorForm.bio} onChange={e => setDoctorForm({...doctorForm, bio: e.target.value})}/>
                      </div>
                      
                      <Button variant="success" className="w-full py-4 text-lg shadow-lg shadow-emerald-500/20" onClick={handleDoctorSubmit} disabled={!doctorName || !doctorForm.specialty || !doctorForm.licenseNumber || !doctorForm.phoneNumber || loading}>
                          {loading ? 'جاري الإرسال...' : t('doc_submit')}
                      </Button>
                  </Card>
              </div>
          </OnboardingWrapper>
      );
  }

  if (step === 'USER_PATH_SELECT') { 
      return (
        <OnboardingWrapper>
            <NavBackBtn to="ROLE_SELECT" />
            <header className="mb-12 text-center animate-in slide-in-from-top-4 relative z-10 pt-20">
                <h1 className="text-4xl font-black text-white mb-4 drop-shadow-lg">{t('path_select_title')}</h1>
                <p className="text-slate-400 max-w-lg mx-auto text-lg">{t('onboard_desc')}</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full relative z-10" role="group" aria-label="Path Selection">
                <button 
                    onClick={() => {setMedType(null); setStep('ALGO_SETUP_MED');}} 
                    className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
                    aria-label={`${t('path_algo')} - ${t('path_algo_desc')}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20 border border-indigo-500/30">
                        <BrainCircuit size={32} className="text-indigo-400"/>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('path_algo')}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm font-medium">{t('path_algo_desc')}</p>
                </button>
                <button 
                    onClick={() => setStep('DOCTOR_SELECT')} 
                    className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-blue-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                    aria-label={`${t('path_doctor')} - ${t('path_doctor_desc')}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-16 h-16 bg-blue-500/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20 border border-blue-500/30">
                        <Stethoscope size={32} className="text-blue-400"/>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('path_doctor')}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm font-medium">{t('path_doctor_desc')}</p>
                </button>
            </div>
        </OnboardingWrapper>
      ); 
  }
  
  if (step === 'DOCTOR_SELECT') { 
      const filteredDocs = availableDoctors.filter(d => d.name.toLowerCase().includes(searchDoctor.toLowerCase())); 
      return (
        <OnboardingWrapper>
            <NavBackBtn to="USER_PATH_SELECT" />
            <div className="max-w-4xl w-full animate-in fade-in relative z-10 pt-20">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-white mb-2">{t('doc_select_title')}</h1>
                    <p className="text-slate-400">{t('path_doctor_desc')}</p>
                </header>
                <div className="relative mb-8 group">
                    <label htmlFor="searchDoc" className="sr-only">Search Doctor</label>
                    <Search className="absolute top-1/2 right-6 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" size={20}/>
                    <input id="searchDoc" className="w-full bg-slate-900/70 border border-white/10 rounded-2xl py-4 px-14 text-white outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all shadow-lg placeholder-slate-600" placeholder={t('doc_search_placeholder')} value={searchDoctor} onChange={e => setSearchDoctor(e.target.value)}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDocs.length === 0 ? (
                        <div className="col-span-2 text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-700">
                            <Stethoscope className="mx-auto mb-4 text-slate-700" size={48} />
                            <p className="text-slate-500">{availableDoctors.length === 0 ? 'لا يوجد أطباء متاحين حالياً.' : 'لم يتم العثور على نتائج.'}</p>
                        </div>
                    ) : (
                        filteredDocs.map(doc => (
                            <div key={doc.uid} className="bg-slate-900/80 backdrop-blur-xl border border-white/5 p-6 rounded-3xl hover:border-indigo-500/30 transition-all group flex flex-col h-full shadow-xl hover:shadow-indigo-500/10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        {doc.doctorData?.photoUrl ? (
                                            <img src={doc.doctorData.photoUrl} alt={`Dr ${doc.name}`} className="w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-lg" />
                                        ) : (
                                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 font-bold text-lg border border-indigo-500/20" aria-hidden="true">Dr</div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{doc.name}</h3>
                                            <Badge color="blue">{doc.doctorData?.specialty}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm mb-6 line-clamp-2 bg-slate-950/50 p-4 rounded-xl border border-white/5 flex-1 leading-relaxed">
                                    {doc.doctorData?.bio || "لا توجد نبذة تعريفية."}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-bold uppercase tracking-wider">
                                    <MapPin size={14}/> {doc.doctorData?.clinicLocation || "عيادة افتراضية"}
                                </div>
                                <Button onClick={() => handleAssignDoctor(doc)} className="w-full py-3" variant="secondary" disabled={loading}>
                                    {loading ? 'جاري الإرسال...' : t('doc_select_btn')}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </OnboardingWrapper>
      ); 
  }

  if (step === 'ALGO_SETUP_MED') { 
      if (blockedState) return (
        <OnboardingWrapper>
            <div className="text-center animate-in zoom-in max-w-lg">
                <div className="w-24 h-24 bg-rose-600/20 rounded-full flex items-center justify-center mb-6 mx-auto border border-rose-500/30 shadow-2xl shadow-rose-900/50 animate-bounce">
                    <AlertTriangle size={48} className="text-rose-500" />
                </div>
                <h1 className="text-4xl font-black text-white mb-4">{t('blocked_title')}</h1>
                <p className="text-rose-200/80 text-xl leading-relaxed mb-8 bg-rose-900/20 p-6 rounded-2xl border border-rose-500/10">
                    {t('med_type_narcotic_desc')}
                </p>
                <Button onClick={() => setBlockedState(false)} variant="secondary" className="px-8">{t('close')}</Button>
            </div>
        </OnboardingWrapper>
      ); 
      
      if (psychWarning) return (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in" dir={dir}>
            <Card className="max-w-md border-amber-500/30 bg-slate-900 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse border border-amber-500/30">
                    <AlertTriangle size={32} className="text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-4">{t('warning_title')}</h2>
                <p className="text-slate-300 text-center mb-8 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-white/5">
                    {t('med_type_psych_desc')}
                </p>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setPsychWarning(false)} className="flex-1">{t('close')}</Button>
                    <Button variant="primary" onClick={() => { setPsychWarning(false); setStep('ALGO_SETUP_FORM'); }} className="flex-1">موافق، تابع</Button>
                </div>
            </Card>
        </div>
      ); 
      
      return (
        <OnboardingWrapper>
            <NavBackBtn to="USER_PATH_SELECT" />
            <header className="text-center mb-12 animate-in slide-in-from-top-4 relative z-10 pt-20">
                <h1 className="text-4xl font-black text-white mb-4">{t('med_type_title')}</h1>
                <p className="text-slate-400">حدد نوع الدواء الذي تريد التعافي منه</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full relative z-10" role="group" aria-label="Medication Type Selection">
                {[
                    { type: 'narcotic', label: t('med_type_narcotic'), icon: AlertTriangle, color: 'rose', desc: t('med_type_narcotic_desc') }, 
                    { type: 'psychiatric', label: t('med_type_psych'), icon: BrainCircuit, color: 'amber', desc: t('med_type_psych_desc') }, 
                    { type: 'normal', label: t('med_type_normal'), icon: CheckCircle, color: 'emerald', desc: t('med_type_normal_desc') }
                ].map((item: any) => (
                    <button 
                        key={item.type} 
                        onClick={() => handleMedTypeSelect(item.type)} 
                        className={`group relative p-8 rounded-[2.5rem] border border-white/10 bg-slate-900/60 backdrop-blur-md hover:bg-slate-900/80 transition-all text-right overflow-hidden hover:border-${item.color}-500/50 hover:shadow-2xl shadow-lg hover:scale-105 duration-300 focus:outline-none focus:ring-4 focus:ring-${item.color}-500/30`}
                        aria-label={`${item.label} - ${item.desc}`}
                    >
                        <div className={`w-16 h-16 rounded-2xl bg-${item.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-${item.color}-500/20`}>
                            <item.icon className={`w-8 h-8 text-${item.color}-500`} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{item.label}</h3>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    </button>
                ))}
            </div>
        </OnboardingWrapper>
      ); 
  }
  
  if (step === 'ALGO_SETUP_FORM') { 
      return (
        <OnboardingWrapper>
            <NavBackBtn to="ALGO_SETUP_MED" />
            <div className="max-w-2xl w-full animate-in zoom-in relative z-10 pt-20 text-center">
                <h1 className="text-3xl font-black text-white mb-8">{t('med_form_title')}</h1>
                <div className="grid grid-cols-2 gap-6 mb-10" role="group" aria-label="Medication Form">
                    <button 
                        onClick={() => setMedForm('tablet')} 
                        className={`p-8 rounded-3xl border transition-all duration-300 group focus:outline-none focus:ring-4 focus:ring-indigo-500/30 ${medForm === 'tablet' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/30 scale-105' : 'bg-slate-900/60 border-white/10 text-slate-400 hover:bg-slate-800 hover:border-white/20'}`}
                        aria-pressed={medForm === 'tablet'}
                    >
                        <Pill className={`mx-auto mb-4 w-12 h-12 ${medForm === 'tablet' ? 'text-white' : 'text-indigo-400'}`} />
                        <span className="block font-bold text-xl">{t('form_tablet')}</span>
                    </button>
                    <button 
                        onClick={() => setMedForm('liquid')} 
                        className={`p-8 rounded-3xl border transition-all duration-300 group focus:outline-none focus:ring-4 focus:ring-indigo-500/30 ${medForm === 'liquid' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/30 scale-105' : 'bg-slate-900/60 border-white/10 text-slate-400 hover:bg-slate-800 hover:border-white/20'}`}
                        aria-pressed={medForm === 'liquid'}
                    >
                        <FlaskConical className={`mx-auto mb-4 w-12 h-12 ${medForm === 'liquid' ? 'text-white' : 'text-indigo-400'}`} />
                        <span className="block font-bold text-xl">{t('form_liquid')}</span>
                    </button>
                </div>
                
                {medForm && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 mb-10">
                        <h2 className="text-xl font-bold text-white mb-4">{t('unit_title')}</h2>
                        <div className="flex justify-center gap-4" role="group" aria-label="Unit Selection">
                            {(medForm === 'tablet' ? ['mg', 'g'] : ['ml', 'l', 'mg']).map((u) => (
                                <button 
                                    key={u} 
                                    onClick={() => setMedUnit(u as MedUnit)} 
                                    className={`px-8 py-4 rounded-2xl font-bold text-lg border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${medUnit === u ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900/50 border-white/10 text-slate-500 hover:text-white hover:bg-slate-800'}`}
                                    aria-pressed={medUnit === u}
                                >
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <Button variant="success" className="w-full py-5 text-xl rounded-2xl shadow-xl shadow-emerald-500/20" disabled={!medForm || !medUnit} onClick={() => setStep('ALGO_SETUP_INV')}>
                    التالي <ArrowRight className={dir === 'rtl' ? 'rotate-180 mr-2' : 'ml-2'} />
                </Button>
            </div>
        </OnboardingWrapper>
      ); 
  }
  
  if (step === 'ALGO_SETUP_INV') { 
      const formLabel = medForm === 'liquid' ? 'عبوات' : 'علب'; 
      const unitLabel = medUnit || 'mg'; 
      return (
        <OnboardingWrapper>
            <NavBackBtn to="ALGO_SETUP_FORM" />
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in relative z-10 pt-20 w-full">
                <Card className="border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
                        <span className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30"><Pill size={28} /></span>
                        {t('inventory_title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="group">
                            <label htmlFor="boxes" className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider group-focus-within:text-indigo-400 transition-colors">{t('boxes')} ({formLabel})</label>
                            <input 
                                id="boxes" 
                                type="number" 
                                min="0" 
                                className="w-full bg-slate-950/60 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none transition-all text-center" 
                                placeholder="0" 
                                value={localInv.boxes} 
                                onChange={(e) => setLocalInv({...localInv, boxes: e.target.value})} 
                            />
                        </div>
                        <div className="group">
                            <label htmlFor="pillsPerBox" className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider group-focus-within:text-indigo-400 transition-colors">{t('pills_per_box')}</label>
                            <input 
                                id="pillsPerBox" 
                                type="number" 
                                min="1" 
                                className="w-full bg-slate-950/60 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none transition-all text-center" 
                                placeholder="0" 
                                value={localInv.pills} 
                                onChange={(e) => setLocalInv({...localInv, pills: e.target.value})} 
                            />
                        </div>
                        <div className="group">
                            <label htmlFor="loosePills" className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider group-focus-within:text-indigo-400 transition-colors">{t('loose_pills')}</label>
                            <input 
                                id="loosePills" 
                                type="number" 
                                min="0" 
                                step="0.5"
                                className="w-full bg-slate-950/60 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none transition-all text-center" 
                                placeholder="0" 
                                value={localInv.loose} 
                                onChange={(e) => setLocalInv({...localInv, loose: e.target.value})} 
                            />
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center bg-slate-950/30 -mx-8 -mb-8 p-8 rounded-b-[2.5rem]">
                        <span className="text-slate-400 font-bold text-lg">{t('total_balance')}</span>
                        <span className="text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                            {localTotalInventory} <span className="text-lg text-slate-500">{unitLabel}</span>
                        </span>
                    </div>
                </Card>
                
                <Card className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Activity className="text-amber-400"/> {t('current_habit')} ({unitLabel})
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {[0.5, 1, 2, 5, 10, 20, 50, 100].map(dose => (
                            <button key={dose} onClick={() => setLocalDose(dose.toString())} className={`h-14 min-w-[4rem] px-4 rounded-xl font-mono font-bold border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${parseFloat(localDose) === dose ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105' : 'bg-slate-950/50 border-white/10 text-slate-500 hover:bg-slate-800 hover:text-white'}`}>{dose}</button>
                        ))}
                        <div className="relative flex-1 min-w-[120px]">
                            <label htmlFor="customDose" className="sr-only">Custom Dose</label>
                            <input 
                                id="customDose"
                                type="number" 
                                min="0.1"
                                step="0.1"
                                placeholder="جرعة أخرى..." 
                                className="h-14 w-full bg-slate-950/50 rounded-xl border border-white/10 px-6 font-mono font-bold text-white focus:border-indigo-500 outline-none transition-all text-center placeholder-slate-600" 
                                value={localDose}
                                onChange={(e) => setLocalDose(e.target.value)} 
                            />
                        </div>
                    </div>
                </Card>
                
                <Button className="w-full text-2xl py-6 rounded-3xl shadow-2xl shadow-indigo-500/20 animate-pulse-glow" variant="success" disabled={parseFloat(localDose) <= 0 || localTotalInventory <= 0} onClick={generatePreview}>
                    {t('analyze_plan')} <BrainCircuit className="ml-3" size={28}/>
                </Button>
            </div>
        </OnboardingWrapper>
      ); 
  }
  
  if (step === 'ALGO_PREVIEW') { 
      return (
        <OnboardingWrapper>
            <ScientificPlanModal 
                isOpen={showSciModal} 
                onClose={() => setShowSciModal(false)} 
                onConfirm={() => setShowSciModal(false)} 
            />

            <NavBackBtn to="ALGO_SETUP_INV" />
            <div className="max-w-4xl w-full text-center space-y-8 animate-in zoom-in relative z-10 pt-20">
                <div className="inline-flex p-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                    <CheckCircle size={64} className="text-emerald-400" />
                </div>
                <h1 className="text-5xl font-black text-white tracking-tight">تم إنشاء الخطة المبدئية</h1>
                <p className="text-slate-400 text-xl">بناءً على مخزونك الحالي، هذا هو مقترح الجدول الزمني:</p>
                
                {/* Safety Warning Block */}
                <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl text-left flex items-start gap-4">
                    <Info className="text-amber-400 shrink-0 mt-1" />
                    <div>
                        <h4 className="text-amber-300 font-bold mb-1">تنويه هام قبل البدء</h4>
                        <p className="text-amber-200/70 text-sm leading-relaxed">
                            هذه الخطة تم توليدها رياضياً بناءً على الكمية المتوفرة لديك لضمان عدم انقطاع الدواء فجأة. 
                            <strong> يرجى عرض هذه الخطة على طبيبك المختص للموافقة عليها قبل البدء.</strong>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Card className="text-center border-indigo-500/30 bg-slate-900/80">
                        <div className="text-sm text-indigo-300 font-bold uppercase mb-2 tracking-widest">{t('duration_days')}</div>
                        <div className="text-6xl font-black text-white">{previewPlan.length}</div>
                        <div className="text-xs text-slate-500 mt-2 font-bold">يوم تقديري</div>
                    </Card>
                    <Card className="text-center border-emerald-500/30 bg-slate-900/80">
                        <div className="text-sm text-emerald-300 font-bold uppercase mb-2 tracking-widest">تغطية المخزون</div>
                        <div className="text-6xl font-black text-emerald-400">100%</div>
                        <div className="text-xs text-slate-500 mt-2 font-bold">كافٍ لإتمام الجدول</div>
                    </Card>
                </div>

                <Button onClick={confirmAlgorithmPlan} variant="success" className="w-full py-6 text-xl shadow-2xl shadow-emerald-500/20" disabled={loading}>
                    {loading ? 'جاري الإعداد...' : t('confirm_log')} <ChevronRight className={dir === 'rtl' ? 'rotate-180 mr-2' : 'ml-2'} />
                </Button>
            </div>
        </OnboardingWrapper>
      ); 
  }

  return null;
};
```
---

### File: `views\SettingsView.tsx`
```tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    Activity, ShieldCheck, Zap, AlertTriangle, Save, Camera, MapPin, Phone, 
    User, Award, Clock, Package, Pill, RefreshCw, Trash2, Download, CheckCircle, XCircle, Upload
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Inventory } from '../types';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { Badge } from '../components/ui/Badge';

import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';

interface SettingsViewProps {
    userProfile: UserProfile;
    resetAllData: () => void;
    updateSpeedSettings: (speed: number) => void;
}

export const SettingsView = ({ userProfile, resetAllData, updateSpeedSettings }: SettingsViewProps) => {
    const { t, language } = useLanguage();
    const { inventory, setInventory, plan, logs } = useData(); 
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // Delete Confirmation State
    const [deleteInput, setDeleteInput] = useState('');
    const deleteKeyword = language === 'ar' ? 'حذف' : 'DELETE';

    // File Import Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // -- Doctor Form State --
    const [formData, setFormData] = useState({
        photoUrl: '',
        bio: '',
        phoneNumber: '',
        clinicLocation: '',
        name: ''
    });

    // -- Inventory Edit State --
    const [localInventory, setLocalInventory] = useState<Inventory>({
        boxes: 0, 
        pillsPerBox: 0, 
        loosePills: 0, 
        totalPills: 0
    });

    // Load initial data for Doctor
    useEffect(() => {
        if (userProfile.role === 'doctor' && userProfile.doctorData) {
            setFormData({
                photoUrl: userProfile.doctorData.photoUrl || '',
                bio: userProfile.doctorData.bio || '',
                phoneNumber: userProfile.doctorData.phoneNumber || '',
                clinicLocation: userProfile.doctorData.clinicLocation || '',
                name: userProfile.name || ''
            });
        }
    }, [userProfile]);

    // Sync Inventory (Initialize only)
    useEffect(() => {
        if (inventory) {
            setLocalInventory(prev => {
                // Only sync if we haven't touched it yet (all zeros) or if it's a fresh load
                // This prevents the "jumping" issue while typing
                const isPrevEmpty = prev.boxes === 0 && prev.pillsPerBox === 0 && prev.loosePills === 0;
                if (isPrevEmpty) return inventory;
                return prev;
            });
        }
    }, [inventory]);

    const showStatus = (type: 'success' | 'error', text: string) => {
        setStatusMsg({ type, text });
        setTimeout(() => setStatusMsg(null), 4000);
    };

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
            showStatus('success', language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح.' : 'Profile updated successfully.');
        } catch (e) {
            console.error("Error updating profile:", e);
            showStatus('error', language === 'ar' ? 'فشل التحديث. يرجى المحاولة لاحقاً.' : 'Failed to update profile.');
        }
        setLoading(false);
    };

    const handleUpdateInventory = () => {
        const newTotal = (localInventory.boxes * localInventory.pillsPerBox) + localInventory.loosePills;
        const updatedInv = { ...localInventory, totalPills: newTotal };
        setInventory(updatedInv); // Update Context
        setLocalInventory(updatedInv); // Sync Local
        showStatus('success', language === 'ar' ? 'تم تحديث المخزون وإعادة حساب الرصيد.' : 'Inventory updated successfully.');
    };

    const handleExportData = () => {
        const dataToExport = {
            profile: { ...userProfile, uid: undefined }, // Exclude UID for privacy in raw file
            inventory: inventory,
            plan: plan,
            logs: logs,
            exportedAt: new Date().toISOString(),
            version: '2.0'
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `islams_guide_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        showStatus('success', language === 'ar' ? 'تم تحميل بياناتك بنجاح.' : 'Data exported successfully.');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !userProfile.uid) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                
                // Validate Basic Structure
                if (!json.inventory || !Array.isArray(json.plan) || !Array.isArray(json.logs)) {
                    throw new Error("Invalid file format");
                }

                if (!window.confirm(language === 'ar' ? 'تحذير: استيراد البيانات سيستبدل بياناتك الحالية (السجلات، الخطة، المخزون). هل أنت متأكد؟' : 'Warning: Importing will overwrite current logs, plan, and inventory. Continue?')) {
                    return;
                }

                setLoading(true);
                
                const dataToRestore = {
                    inventory: json.inventory,
                    plan: json.plan,
                    logs: json.logs,
                    speedModifier: json.profile?.speedModifier || 1.0,
                    // We don't overwrite name/email/role here to prevent account lockout/corruption
                };

                await updateDoc(doc(db, "users", userProfile.uid!), dataToRestore);
                
                // Manually trigger context update if needed, but onSnapshot in DataContext should catch it
                showStatus('success', language === 'ar' ? 'تم استعادة البيانات بنجاح.' : 'Data restored successfully.');
            } catch (err) {
                console.error("Import Error:", err);
                showStatus('error', language === 'ar' ? 'ملف غير صالح أو تالف.' : 'Invalid or corrupt backup file.');
            } finally {
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
            }
        };
        reader.readAsText(file);
    };

    return (
        <LayoutContainer>
            <PageHeader title={t('settings_title')} subtitle={t('settings_subtitle')} />

            {/* Status Message Banner */}
            {statusMsg && (
                <div 
                    className={`p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top-2 mb-6 ${
                        statusMsg.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    }`}
                    role="status"
                >
                    {statusMsg.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    <span className="font-bold">{statusMsg.text}</span>
                </div>
            )}

            {/* --- DOCTOR VIEW --- */}
            {userProfile.role === 'doctor' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        {/* ID Card */}
                        <Card className="text-center relative overflow-hidden group border-white/10 !bg-slate-900/80">
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-600/30 to-transparent"></div>
                            
                            <div className="relative z-10 pt-8">
                                <div className="w-32 h-32 mx-auto bg-slate-950 rounded-full border-4 border-slate-800/80 flex items-center justify-center mb-4 overflow-hidden shadow-2xl relative group-hover:border-indigo-500/50 transition-colors">
                                    {formData.photoUrl ? (
                                        <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-slate-600" />
                                    )}
                                </div>
                                
                                <h2 className="text-2xl font-black text-white mb-1">{formData.name}</h2>
                                <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-6">
                                    {userProfile.doctorData?.specialty}
                                </p>
                                
                                <div className="flex justify-center gap-2 mb-8">
                                    <Badge color="amber">LVL {userProfile.doctorData?.doctorLevel || 1}</Badge>
                                    <Badge color={userProfile.doctorData?.accountStatus === 'approved' ? 'green' : 'red'}>
                                        {userProfile.doctorData?.accountStatus.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="h-full border-white/10">
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                                <div className="p-2 bg-indigo-500/10 rounded-lg"><User className="text-indigo-400" size={20} /></div> 
                                {t('edit_profile')}
                            </h3>
                            
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-6">
                                <div className="group">
                                    <label htmlFor="docName" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('doc_fullname')}</label>
                                    <input 
                                        id="docName"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>

                                <div className="group">
                                    <label htmlFor="photoUrl" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('photo_url_label')}</label>
                                    <div className="relative">
                                        <Camera className="absolute top-4 right-4 text-slate-600" size={18} />
                                        <input 
                                            id="photoUrl"
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-10 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all"
                                            placeholder="https://..."
                                            value={formData.photoUrl}
                                            onChange={e => setFormData({...formData, photoUrl: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="phone" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('doc_phone')}</label>
                                        <div className="relative">
                                            <Phone className="absolute top-4 right-4 text-slate-600" size={18} />
                                            <input 
                                                id="phone"
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-10 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all"
                                                value={formData.phoneNumber}
                                                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="location" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('doc_location')}</label>
                                        <div className="relative">
                                            <MapPin className="absolute top-4 right-4 text-slate-600" size={18} />
                                            <input 
                                                id="location"
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-10 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all"
                                                value={formData.clinicLocation}
                                                onChange={e => setFormData({...formData, clinicLocation: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="bio" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('doc_bio')}</label>
                                    <textarea 
                                        id="bio"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none h-32 resize-none transition-all"
                                        value={formData.bio}
                                        onChange={e => setFormData({...formData, bio: e.target.value})}
                                    />
                                </div>

                                <div className="pt-6 border-t border-white/5 flex justify-end">
                                    <Button type="submit" variant="primary" disabled={loading} className="w-full md:w-auto">
                                        <Save size={18} className="mr-2" /> {loading ? 'Saving...' : t('save_changes')}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            )}

            {/* --- PATIENT / NORMAL USER VIEW --- */}
            {userProfile.role !== 'doctor' && (
                <>
                    {/* Pace Control */}
                    <Card className="mb-8 border-white/10">
                        <section aria-labelledby="pace-settings">
                            <h2 id="pace-settings" className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Activity className="text-indigo-400" /> {t('pace_control')}
                            </h2>
                            <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-2xl bg-slate-950/30 p-4 rounded-xl border border-white/5">
                                {t('pace_desc')}
                            </p>
                            
                            {userProfile.role === 'patient' || userProfile.planType === 'manual' ? (
                                <div className="p-8 bg-slate-950/50 rounded-[2rem] border border-dashed border-slate-700 text-slate-500 text-center flex flex-col items-center gap-4">
                                    <ShieldCheck size={40} className="text-slate-600" />
                                    <p className="max-w-md">هذه الخطة مدارة بواسطة {userProfile.role === 'patient' ? 'طبيبك المعالج' : 'النظام اليدوي'}. التعديل التلقائي للسرعة غير متاح.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { speed: 0.8, label: t('pace_slow'), icon: Clock, desc: 'تمديد المدة للراحة', color: 'indigo' },
                                        { speed: 1.0, label: t('pace_balanced'), icon: ShieldCheck, desc: 'الوضع القياسي', color: 'emerald' },
                                        { speed: 1.2, label: t('pace_fast'), icon: Zap, desc: 'تقليص المدة (مكثف)', color: 'rose' },
                                    ].map((opt) => (
                                        <button 
                                            key={opt.speed}
                                            onClick={() => updateSpeedSettings(opt.speed)} 
                                            className={`group p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col items-center gap-4 focus:outline-none focus:ring-4 focus:ring-${opt.color}-500/30 ${
                                                userProfile.speedModifier && Math.abs(userProfile.speedModifier - opt.speed) < 0.1
                                                ? `bg-${opt.color}-600 border-${opt.color}-500 text-white shadow-xl shadow-${opt.color}-500/20` 
                                                : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:bg-slate-900 hover:border-slate-600'
                                            }`}
                                            aria-pressed={userProfile.speedModifier === opt.speed}
                                        >
                                            <div className={`p-4 rounded-full transition-colors ${userProfile.speedModifier === opt.speed ? 'bg-white/20' : 'bg-slate-900 group-hover:bg-slate-800'}`}>
                                                <opt.icon size={28} />
                                            </div>
                                            <div className="text-center">
                                                <span className="block font-bold text-lg">{opt.label}</span>
                                                <span className="text-[10px] opacity-70">{opt.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>
                    </Card>

                    {/* Inventory Management */}
                    <Card className="mb-8 border-white/10">
                        <section aria-labelledby="inventory-settings">
                            <h2 id="inventory-settings" className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Package className="text-blue-400" /> {t('inventory_title')}
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors group focus-within:border-indigo-500">
                                    <label htmlFor="invBoxes" className="text-xs text-slate-500 font-bold block mb-2 uppercase tracking-wider">{t('boxes')}</label>
                                    <div className="flex items-center gap-3">
                                        <Package className="text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={24} />
                                        <input 
                                            id="invBoxes"
                                            type="number" 
                                            className="bg-transparent text-white font-bold text-2xl w-full outline-none placeholder-slate-700"
                                            value={localInventory.boxes}
                                            onChange={(e) => setLocalInventory({...localInventory, boxes: parseInt(e.target.value) || 0})}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors group focus-within:border-indigo-500">
                                    <label htmlFor="invPills" className="text-xs text-slate-500 font-bold block mb-2 uppercase tracking-wider">{t('pills_per_box')}</label>
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-600 font-bold text-xl group-focus-within:text-indigo-500">x</span>
                                        <input 
                                            id="invPills"
                                            type="number" 
                                            className="bg-transparent text-white font-bold text-2xl w-full outline-none placeholder-slate-700"
                                            value={localInventory.pillsPerBox}
                                            onChange={(e) => setLocalInventory({...localInventory, pillsPerBox: parseInt(e.target.value) || 0})}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors group focus-within:border-indigo-500">
                                    <label htmlFor="invLoose" className="text-xs text-slate-500 font-bold block mb-2 uppercase tracking-wider">{t('loose_pills')}</label>
                                    <div className="flex items-center gap-3">
                                        <Pill className="text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={24} />
                                        <input 
                                            id="invLoose"
                                            type="number" 
                                            className="bg-transparent text-white font-bold text-2xl w-full outline-none placeholder-slate-700"
                                            value={localInventory.loosePills}
                                            onChange={(e) => setLocalInventory({...localInventory, loosePills: parseInt(e.target.value) || 0})}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5 pt-6">
                                <div className="text-sm bg-slate-950/50 px-4 py-2 rounded-xl border border-white/5">
                                    <span className="text-slate-500">{t('total_balance')}: </span>
                                    <span className="text-emerald-400 font-bold font-mono text-xl ml-2">
                                        {(localInventory.boxes * localInventory.pillsPerBox) + localInventory.loosePills} <span className="text-xs">{userProfile.medUnit || 'mg'}</span>
                                    </span>
                                </div>
                                <Button onClick={handleUpdateInventory} variant="primary" className="!py-3 !px-6 w-full md:w-auto">
                                    <RefreshCw size={18} className="mr-2"/> {t('save_changes')}
                                </Button>
                            </div>
                        </section>
                    </Card>
                </>
            )}

            {/* Privacy & Data Section */}
            <Card className="mb-8 border-white/10 bg-indigo-900/10">
                <section aria-labelledby="privacy-settings">
                    <h2 id="privacy-settings" className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Download className="text-indigo-400" /> {language === 'ar' ? 'بياناتي' : 'My Data'}
                    </h2>
                    <p className="text-indigo-200/60 text-sm mb-6 max-w-xl">
                        {language === 'ar' 
                            ? 'يمكنك تحميل نسخة احتياطية (تصدير) أو استعادة بياناتك السابقة (استيراد).' 
                            : 'You can backup (Export) or restore previous data (Import).'}
                    </p>
                    
                    <div className="flex gap-4 flex-wrap">
                        <Button onClick={handleExportData} variant="secondary" className="border-indigo-500/30 hover:bg-indigo-500/20">
                            <Download size={18} className="mr-2" /> {language === 'ar' ? 'تصدير' : 'Export Data'}
                        </Button>
                        
                        <Button onClick={handleImportClick} variant="secondary" className="border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400">
                            <Upload size={18} className="mr-2" /> {language === 'ar' ? 'استيراد' : 'Import Data'}
                        </Button>
                        {/* Hidden Input for File Upload */}
                        <input 
                            type="file" 
                            accept=".json"
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            onChange={handleFileChange}
                        />
                    </div>
                </section>
            </Card>

            {/* Danger Zone */}
            <Card className="border-rose-500/20 bg-rose-900/10 hover:bg-rose-900/20 transition-colors">
                <section aria-labelledby="danger-zone">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h2 id="danger-zone" className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <AlertTriangle className="text-rose-500" /> {language === 'ar' ? 'منطقة الخطر' : 'Danger Zone'}
                            </h2>
                            <p className="text-rose-200/60 text-sm max-w-md mb-4">
                                {language === 'ar' 
                                    ? 'هذا الإجراء سيقوم بحذف حسابك وجميع بياناتك نهائياً. يرجى كتابة كلمة "حذف" في المربع أدناه للتأكيد.' 
                                    : 'This action permanently deletes your account. Please type "DELETE" below to confirm.'}
                            </p>
                            <div className="relative group max-w-xs">
                                <input 
                                    type="text" 
                                    className="w-full bg-rose-950/50 border border-rose-500/30 rounded-xl px-4 py-3 text-white placeholder-rose-700/50 outline-none focus:border-rose-500 transition-all font-mono"
                                    placeholder={deleteKeyword}
                                    value={deleteInput}
                                    onChange={(e) => setDeleteInput(e.target.value)}
                                    aria-label="Confirm deletion"
                                />
                            </div>
                        </div>
                        <Button 
                            variant="danger" 
                            onClick={resetAllData} 
                            disabled={deleteInput !== deleteKeyword}
                            className="w-full md:w-auto whitespace-nowrap !py-3 !px-6 shadow-lg shadow-rose-900/20"
                        >
                            <Trash2 size={18} className="mr-2"/> {language === 'ar' ? 'حذف الحساب نهائياً' : 'Delete Account'}
                        </Button>
                    </div>
                </section>
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
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, ReferenceLine, ComposedChart, Line, Legend
} from 'recharts';
import { Smile, Activity, Zap, Moon, Shield, Award, TrendingUp, Frown, Meh, BarChart2 } from 'lucide-react';

// المكونات
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutContainer } from '../components/ui/LayoutContainer';

import { DailyLog, PlanDay, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface StatsViewProps {
    logs: DailyLog[];
    plan: PlanDay[];
    userProfile?: UserProfile | null;
}

export const StatsView = ({ logs, plan, userProfile }: StatsViewProps) => {
    const { t, language } = useLanguage();
    const unitLabel = userProfile?.medUnit || 'mg';

    // 1. بيانات الحالة المزاجية (Pie Chart)
    const moodData = useMemo(() => [
        { name: t('excellent'), value: logs.filter(l => l.mood === 'good').length, color: '#10b981' }, 
        { name: t('stable'), value: logs.filter(l => l.mood === 'normal').length, color: '#f59e0b' }, 
        { name: t('bad'), value: logs.filter(l => l.mood === 'bad').length, color: '#f43f5e' },    
    ].filter(d => d.value > 0), [logs, t]);

    // 2. المخطط الذكي: الربط بين الجرعة وجودة النوم (Smart Correlation)
    // FIX: Sort logs by date first to ensure we get the actual *latest* 14 days, not just the last 14 in the array
    const recentLogs = useMemo(() => {
        return [...logs]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-14);
    }, [logs]);
    
    const correlationData = useMemo(() => {
        return recentLogs.map(log => ({
            date: log.date,
            displayDate: log.date.slice(5), // YYYY-MM-DD -> MM-DD
            dose: log.doseTaken,
            sleep: log.sleepHours || 0,
            moodLabel: log.mood
        }));
    }, [recentLogs]);

    // 3. منطق الأوسمة (Gamification)
    // FIX: Also ensure badges use the sorted recent logs logic where applicable
    const badges = [
        {
            id: 'warrior',
            title: t('badge_7days'),
            icon: Shield,
            color: 'indigo',
            achieved: logs.length >= 7, // Basic check on count is fine
            desc: "7 أيام متواصلة"
        },
        {
            id: 'halfway',
            title: t('badge_halfway'),
            icon: Zap,
            color: 'amber',
            achieved: logs.length > 0 && plan.length > 0 && recentLogs[recentLogs.length-1]?.doseTaken <= (plan[0].plannedDose / 2),
            desc: "نصف الكمية"
        },
        {
            id: 'sleep',
            title: t('badge_sleep'),
            icon: Moon,
            color: 'blue',
            achieved: recentLogs.length >= 3 && (recentLogs.slice(-3).reduce((acc, l) => acc + (l.sleepHours || 0), 0) / 3) >= 7,
            desc: "نوم منتظم"
        },
        {
            id: 'stable',
            title: t('badge_stable'),
            icon: Smile,
            color: 'emerald',
            achieved: recentLogs.length >= 3 && recentLogs.slice(-3).every(l => l.mood === 'good'),
            desc: "مزاج ممتاز"
        }
    ];

    return (
      <LayoutContainer>
          <PageHeader 
            title={t('nav_stats')}
            subtitle={language === 'ar' ? "تحليل عميق لأدائك الحيوي ومسار التعافي." : "Deep analysis of your vitals and recovery path."}
          />

          {/* Badges Section */}
          <section aria-labelledby="badges-heading" className="mb-8">
              <h2 id="badges-heading" className="sr-only">{t('badges_title')}</h2>
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.map((badge) => (
                      <li key={badge.id} className={`relative p-6 rounded-[2rem] border overflow-hidden transition-all duration-500 group list-none ${badge.achieved ? `bg-${badge.color}-500/10 border-${badge.color}-500/30 shadow-lg shadow-${badge.color}-900/20` : 'bg-slate-900/40 border-white/5 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                          {/* Background Glow */}
                          <div className={`absolute inset-0 bg-gradient-to-br from-${badge.color}-500/0 via-${badge.color}-500/0 to-${badge.color}-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                          
                          <div className="relative z-10 flex flex-col items-center text-center gap-4">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6 ${badge.achieved ? `bg-gradient-to-tr from-${badge.color}-600 to-${badge.color}-400` : 'bg-slate-800'}`}>
                                  <badge.icon size={28} strokeWidth={1.5} aria-hidden="true" />
                              </div>
                              <div>
                                  <span className={`text-sm font-bold block mb-1 ${badge.achieved ? 'text-white' : 'text-slate-400'}`}>{badge.title}</span>
                                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider bg-slate-950/50 px-2 py-1 rounded-lg">
                                      {badge.achieved ? badge.desc : (language === 'ar' ? "مغلق" : "Locked")}
                                  </span>
                              </div>
                          </div>
                          
                          {badge.achieved && (
                              <div className="absolute top-3 right-3 text-yellow-400 animate-pulse" aria-label={language === 'ar' ? 'تم الإنجاز' : 'Achieved'}>
                                  <Award size={16} />
                              </div>
                          )}
                      </li>
                  ))}
              </ul>
          </section>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* 1. Correlation Chart (Dose vs Sleep) */}
              <section aria-labelledby="correlation-heading" className="lg:col-span-2">
                  <Card className="min-h-[400px] flex flex-col border-white/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
                          <h3 id="correlation-heading" className="text-xl font-bold text-white flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                  <Activity className="w-5 h-5" aria-hidden="true"/>
                              </div>
                               {language === 'ar' ? 'تأثير الجرعة على النوم' : 'Dose Impact on Sleep'}
                          </h3>
                          <div className="flex gap-4 text-xs font-bold mt-4 md:mt-0 bg-slate-950/50 p-2 rounded-xl border border-white/5" aria-hidden="true">
                              <span className="flex items-center gap-2 text-indigo-300"><span className="w-3 h-3 rounded bg-indigo-500"></span> {t('dose')} ({unitLabel})</span>
                              <span className="flex items-center gap-2 text-emerald-300"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> {t('sleep_label')}</span>
                          </div>
                      </div>
                      
                      <div className="flex-1 h-[300px] w-full" aria-hidden="true">
                          {correlationData.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                  <ComposedChart data={correlationData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                      <defs>
                                        <linearGradient id="colorDoseBar" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                      <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                      <YAxis yAxisId="left" stroke="#6366f1" fontSize={10} axisLine={false} tickLine={false} />
                                      <YAxis yAxisId="right" orientation="right" stroke="#34d399" fontSize={10} axisLine={false} tickLine={false} domain={[0, 12]} />
                                      <Tooltip 
                                          contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'}}
                                          itemStyle={{color: '#fff', fontSize: '12px'}}
                                          labelStyle={{color: '#94a3b8', marginBottom: '8px', fontSize: '10px'}}
                                      />
                                      <Bar yAxisId="left" dataKey="dose" barSize={20} fill="url(#colorDoseBar)" radius={[4, 4, 0, 0]} animationDuration={1500} name={t('dose')} />
                                      <Line yAxisId="right" type="monotone" dataKey="sleep" stroke="#34d399" strokeWidth={3} dot={{r: 4, fill: '#0f172a', strokeWidth: 2}} activeDot={{r: 6}} animationDuration={2000} name={t('sleep_label')} />
                                  </ComposedChart>
                              </ResponsiveContainer>
                          ) : (
                              <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">
                                  <TrendingUp size={48} className="opacity-20 mb-4"/>
                                  <p>{language === 'ar' ? 'سجل بياناتك لمدة 3 أيام لتبدأ التحليلات الذكية بالعمل.' : 'Log data for 3 days to see analytics.'}</p>
                              </div>
                          )}
                      </div>

                      {/* Screen Reader Table for Correlation Chart */}
                      <div className="sr-only">
                          <table>
                              <caption>{language === 'ar' ? 'جدول بيانات الجرعة مقابل النوم' : 'Data table: Dose vs Sleep'}</caption>
                              <thead>
                                  <tr>
                                      <th scope="col">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                      <th scope="col">{t('dose')}</th>
                                      <th scope="col">{t('sleep_label')}</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {correlationData.map((row, i) => (
                                      <tr key={i}>
                                          <td>{row.date}</td>
                                          <td>{row.dose} {unitLabel}</td>
                                          <td>{row.sleep} hours</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </Card>
              </section>

              {/* 2. Mood Distribution (Pie Chart) */}
              <section aria-labelledby="mood-heading">
                  <Card className="min-h-[350px] flex flex-col border-white/10">
                      <h3 id="mood-heading" className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                              <Smile className="w-5 h-5" aria-hidden="true"/>
                          </div>
                          {language === 'ar' ? 'الحالة المزاجية العامة' : 'Mood Distribution'}
                      </h3>
                      <div className="flex-1 relative" aria-hidden="true">
                           {moodData.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                      <Pie
                                          data={moodData}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius={60}
                                          outerRadius={100}
                                          paddingAngle={5}
                                          dataKey="value"
                                          stroke="none"
                                          cornerRadius={6}
                                      >
                                          {moodData.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                          ))}
                                      </Pie>
                                      <Tooltip 
                                          contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                          itemStyle={{fontWeight: 'bold', color: '#fff'}}
                                      />
                                      <Legend 
                                        verticalAlign="bottom" 
                                        height={36} 
                                        iconType="circle"
                                        formatter={(value) => <span className="text-slate-400 text-xs font-bold mx-2">{value}</span>}
                                      />
                                  </PieChart>
                              </ResponsiveContainer>
                           ) : (
                               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 font-medium">
                                   <Meh size={40} className="mb-2 opacity-20"/>
                                   {language === 'ar' ? 'لا توجد بيانات كافية' : 'Insufficient Data'}
                               </div>
                           )}
                      </div>

                      {/* Screen Reader List for Mood */}
                      <div className="sr-only">
                          <h4>{language === 'ar' ? 'ملخص المزاج' : 'Mood Summary'}</h4>
                          <ul>
                              {moodData.map((item, i) => (
                                  <li key={i}>{item.name}: {item.value} {language === 'ar' ? 'أيام' : 'days'}</li>
                              ))}
                          </ul>
                      </div>
                  </Card>
              </section>

              {/* 3. Sleep Quality Histogram */}
              <section aria-labelledby="sleep-heading">
                  <Card className="min-h-[350px] flex flex-col border-white/10">
                      <h3 id="sleep-heading" className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                              <Moon className="w-5 h-5" aria-hidden="true"/>
                          </div>
                           {language === 'ar' ? 'استقرار النوم (آخر 7 أيام)' : 'Sleep Stability (Last 7 Days)'}
                      </h3>
                      <div className="flex-1 mt-4" aria-hidden="true">
                          {recentLogs.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                  {/* Using recentLogs.slice(-7) ensures we use the sorted latest days */}
                                  <BarChart data={recentLogs.slice(-7)}> 
                                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                      <XAxis dataKey="date" tickFormatter={(str) => str.slice(8)} stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                      <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} domain={[0, 12]} />
                                      <Tooltip 
                                          cursor={{fill: '#1e293b', opacity: 0.5}}
                                          contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                          itemStyle={{color: '#fff'}}
                                          formatter={(val) => [`${val} h`, t('sleep_label')]}
                                      />
                                      <ReferenceLine y={7} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target (7h)', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
                                      <Bar dataKey="sleepHours" radius={[6, 6, 0, 0]} barSize={24}>
                                        {recentLogs.slice(-7).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.sleepHours && entry.sleepHours >= 7 ? '#10b981' : '#6366f1'} />
                                        ))}
                                      </Bar>
                                  </BarChart>
                              </ResponsiveContainer>
                          ) : (
                              <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">
                                  <BarChart2 size={40} className="mb-2 opacity-20"/>
                                  <p>{language === 'ar' ? 'لا توجد سجلات للنوم.' : 'No sleep logs.'}</p>
                              </div>
                          )}
                      </div>

                      {/* Screen Reader Table for Sleep */}
                      <div className="sr-only">
                          <table>
                              <caption>{language === 'ar' ? 'سجل النوم للأسبوع الماضي' : 'Past week sleep log'}</caption>
                              <thead>
                                  <tr>
                                      <th scope="col">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                      <th scope="col">{t('sleep_label')}</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {recentLogs.slice(-7).map((log, i) => (
                                      <tr key={i}>
                                          <td>{log.date}</td>
                                          <td>{log.sleepHours || 0} {language === 'ar' ? 'ساعات' : 'hours'}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </Card>
              </section>
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
import { 
    LifeBuoy, Plus, Send, CheckCircle, Lock, X, Pill, FlaskConical, User, 
    Stethoscope, ChevronRight, Loader2, AlertCircle, MessageSquare, Mail
} from 'lucide-react';

// المكونات
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
    const { t, language, dir } = useLanguage();
    
    // -- State --
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Forms
    const [newSubject, setNewSubject] = useState("");
    const [newMessage, setNewMessage] = useState("");
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // -- 1. Fetch User Tickets --
    useEffect(() => {
        if (!user.uid) return;
        
        let q;
        
        // IF ADMIN: Fetch ALL tickets
        if (user.role === 'admin') {
            q = query(
                collection(db, "tickets"), 
                orderBy("lastUpdate", "desc")
            );
        } 
        // IF USER: Fetch OWN tickets
        else {
            q = query(
                collection(db, "tickets"), 
                where("userId", "==", user.uid), 
                orderBy("lastUpdate", "desc")
            );
        }
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTickets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Ticket));
            setTickets(fetchedTickets);
            
            // Real-time update for active ticket
            if (activeTicket) {
                const updatedActive = fetchedTickets.find(t => t.id === activeTicket.id);
                if (updatedActive) setActiveTicket(updatedActive);
            }
        });
        
        return () => unsubscribe();
    }, [user.uid, user.role, activeTicket?.id]);

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
        
        setIsSubmitting(true);
        const initialMsg: TicketMessage = {
            senderId: user.uid,
            senderName: user.name,
            text: newMessage.trim().slice(0, 1000), // Max length check
            timestamp: Date.now(),
            isAdmin: user.role === 'admin'
        };

        try {
            await addDoc(collection(db, "tickets"), {
                userId: user.uid,
                userEmail: user.email,
                subject: newSubject.trim().slice(0, 100),
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
        } finally {
            setIsSubmitting(false);
        }
    };

    const sendReply = async () => {
        if (!user.uid) return;
        if (!newMessage.trim() || !activeTicket || !activeTicket.id) return;

        setIsSubmitting(true);
        const newMsg: TicketMessage = {
            senderId: user.uid,
            senderName: user.name,
            text: newMessage.trim().slice(0, 1000),
            timestamp: Date.now(),
            isAdmin: user.role === 'admin' // Dynamic check for admin role
        };

        try {
            const ticketRef = doc(db, "tickets", activeTicket.id);
            const currentMessages = activeTicket.messages || [];
            
            // If admin replies, status might be 'pending' (waiting for user) or keep 'open'.
            // If user replies, status 'open'. 
            // For simplicity, we keep 'open' or set 'resolved' manually later.
            await updateDoc(ticketRef, {
                messages: [...currentMessages, newMsg],
                lastUpdate: Date.now(),
                status: 'open' 
            });
            setNewMessage("");
        } catch (e) {
            console.error("Error sending reply:", e);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Mark ticket as resolved/closed (Admin or User)
    const toggleResolve = async () => {
        if (!activeTicket || !activeTicket.id) return;
        const newStatus = activeTicket.status === 'resolved' ? 'open' : 'resolved';
        try {
            await updateDoc(doc(db, "tickets", activeTicket.id), { status: newStatus });
        } catch(e) { console.error(e); }
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
                title={user.role === 'admin' ? (language === 'ar' ? 'مركز دعم العملاء' : 'Support Center') : t('nav_support')} 
                subtitle={user.role === 'admin' ? (language === 'ar' ? 'إدارة التذاكر والردود' : 'Manage tickets and replies') : (t('support_desc') || "Contact the support team directly.")}
                action={
                    // Only show Create Ticket button if NOT admin, or keep it if admin wants to create internal tickets
                    <Button onClick={() => setShowCreateModal(true)} variant="primary" className="!rounded-xl shadow-indigo-500/20" aria-label={t('new_ticket')}>
                        <Plus size={18} aria-hidden="true" /> {t('new_ticket') || "New Ticket"}
                    </Button>
                }
            />

            {/* Context Banner - Semantic Header Info */}
            <section aria-label="User Context" className="mb-8 bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-white/10 p-5 rounded-3xl flex items-center justify-between backdrop-blur-xl shadow-xl animate-in slide-in-from-top-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-900/20" aria-hidden="true">
                        {user.role === 'doctor' ? <Stethoscope size={24}/> : 
                         user.role === 'admin' ? <Lock size={24} /> :
                         user.medForm === 'liquid' ? <FlaskConical size={24} /> : 
                         user.medForm === 'tablet' ? <Pill size={24} /> : <User size={24}/>}
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t('current_account') || "Current Account"}</p>
                        <p className="text-white font-bold text-lg flex items-center gap-2">
                            {user.name} 
                            <Badge color="blue" className="!py-0.5 !px-2 !text-[10px] shadow-none">{user.role.toUpperCase()}</Badge>
                        </p>
                    </div>
                </div>
                {user.role === 'normal_user' && user.planType === 'algorithm' && (
                    <Badge color="indigo" className="hidden md:flex">Smart Algorithm</Badge>
                )}
            </section>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
                {/* LIST COLUMN */}
                <Card className={`md:col-span-4 flex flex-col overflow-hidden bg-slate-900/80 border-white/10 !p-0 ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/50 backdrop-blur-md">
                        <h3 className="font-bold text-white text-lg">
                            {user.role === 'admin' ? (language === 'ar' ? 'صندوق التذاكر' : 'Ticket Inbox') : (t('my_tickets') || "My Tickets")}
                        </h3>
                        <Badge color="indigo">{tickets.length}</Badge>
                    </div>
                    
                    <ul className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2" role="list">
                        {tickets.length === 0 && (
                            <li className="text-center py-12 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-2xl m-2 flex flex-col items-center">
                                <LifeBuoy className="mb-3 opacity-30" size={32} aria-hidden="true"/>
                                {t('no_tickets') || "No tickets found."}
                            </li>
                        )}
                        {tickets.map(ticket => (
                            <li key={ticket.id}>
                                <button 
                                    onClick={() => setActiveTicket(ticket)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                        activeTicket?.id === ticket.id 
                                        ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-900/20' 
                                        : 'bg-slate-950/30 border-transparent hover:bg-slate-800 hover:border-white/5'
                                    }`}
                                    aria-current={activeTicket?.id === ticket.id ? 'true' : undefined}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="max-w-[70%]">
                                            {/* Show user email if Admin */}
                                            {user.role === 'admin' && (
                                                <p className="text-[10px] text-indigo-400 font-mono mb-1 truncate">{ticket.userEmail || ticket.userId}</p>
                                            )}
                                            <h4 className={`font-bold text-sm truncate ${activeTicket?.id === ticket.id ? 'text-indigo-300' : 'text-slate-200'}`}>
                                                {ticket.subject}
                                            </h4>
                                        </div>
                                        <Badge color={ticket.status === 'resolved' ? 'green' : ticket.status === 'open' ? 'rose' : 'amber'} className="!text-[9px] !px-2 !py-0.5">
                                            {getStatusLabel(ticket.status)}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-end text-[10px] text-slate-500">
                                        <span className="font-mono">{new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                                        <ChevronRight size={14} className={`transition-transform duration-300 ${activeTicket?.id === ticket.id ? 'text-indigo-400 translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} aria-hidden="true"/>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* CHAT COLUMN */}
                <Card className={`md:col-span-8 flex flex-col overflow-hidden bg-slate-900/60 border-white/10 relative !p-0 ${!activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    {!activeTicket ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 opacity-50 shadow-inner border border-white/5">
                                <LifeBuoy size={48} aria-hidden="true"/>
                            </div>
                            <p className="text-lg font-medium">{t('select_ticket_prompt') || "Select a ticket to view details"}</p>
                        </div>
                    ) : (
                        <>
                            {/* Ticket Header */}
                            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl absolute top-0 left-0 right-0 z-20">
                                <div className="flex-1 mr-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setActiveTicket(null)} 
                                        className="md:hidden text-slate-400 mr-2 mb-2 flex items-center gap-1 text-xs hover:text-white transition-colors focus:outline-none focus:text-white"
                                        aria-label={t('close')}
                                    >
                                        <ChevronRight size={14} className={language === 'ar' ? 'rotate-180' : 'rotate-0'}/> {t('close')}
                                    </button>
                                    <h3 className="font-bold text-white flex items-center gap-3 text-lg truncate">
                                        <div className="p-1.5 bg-emerald-500/10 rounded-lg shrink-0"><Lock size={16} className="text-emerald-500" aria-hidden="true"/></div>
                                        {activeTicket.subject}
                                    </h3>
                                    {user.role === 'admin' && (
                                        <div className="flex items-center gap-2 mt-1 ml-9">
                                            <Mail size={10} className="text-slate-500"/>
                                            <p className="text-[10px] text-slate-400 font-mono">{activeTicket.userEmail}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeTicket.status === 'resolved' ? (
                                        <button onClick={toggleResolve} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-emerald-500/20 transition-colors">
                                            <CheckCircle size={14} aria-hidden="true"/> {t('status_resolved') || "Resolved"}
                                        </button>
                                    ) : (
                                        <button onClick={toggleResolve} className="px-3 py-1 bg-slate-800 border border-white/10 text-slate-400 rounded-full text-xs font-bold hover:bg-slate-700 hover:text-white transition-colors">
                                            Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Messages Area (Live Region) */}
                            <div 
                                className="flex-1 overflow-y-auto p-6 pt-32 space-y-6 custom-scrollbar bg-slate-900/30"
                                role="log"
                                aria-live="polite"
                                aria-label="Ticket Conversation"
                            >
                                {activeTicket.messages?.map((msg, idx) => {
                                    // If user is Admin, they are "Me" (right side) if msg.isAdmin is true.
                                    // If user is User, they are "Me" (right side) if msg.isAdmin is false.
                                    
                                    const isMe = (user.role === 'admin' && msg.isAdmin) || (user.role !== 'admin' && !msg.isAdmin);
                                    const senderLabel = msg.isAdmin 
                                        ? (user.role === 'admin' ? (t('me') || 'Me') : (t('support_team') || 'Support'))
                                        : (user.role === 'admin' ? 'User' : (t('me') || 'Me'));

                                    return (
                                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                                                isMe 
                                                ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20' 
                                                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                                            }`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-slate-500 mt-2 px-1 flex items-center gap-1 font-bold uppercase tracking-wider">
                                                {senderLabel} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Reply Input */}
                            <div className="p-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl z-20">
                                {activeTicket.status === 'resolved' && user.role !== 'admin' ? (
                                    <div className="text-center text-sm text-emerald-400 font-bold bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 shadow-lg flex items-center justify-center gap-2">
                                        <CheckCircle size={16} aria-hidden="true"/>
                                        {t('ticket_closed_msg') || "This ticket is closed."}
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <label htmlFor="reply-input" className="sr-only">{t('write_reply') || "Write your reply"}</label>
                                        <input 
                                            id="reply-input"
                                            className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 focus:bg-slate-900 outline-none transition-all placeholder-slate-600 shadow-inner disabled:opacity-50"
                                            placeholder={t('write_reply') || "Write your reply..."}
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && !isSubmitting && sendReply()}
                                            disabled={isSubmitting}
                                            maxLength={1000}
                                        />
                                        <button 
                                            onClick={sendReply} 
                                            disabled={!newMessage.trim() || isSubmitting}
                                            className="p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            aria-label={language === 'ar' ? 'إرسال الرد' : 'Send Reply'}
                                        >
                                            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {/* Create Ticket Modal */}
            {showCreateModal && (
                <div 
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="new-ticket-title"
                >
                    <Card className="w-full max-w-md bg-slate-900 border-white/10 relative shadow-2xl overflow-hidden">
                        {/* Header Background */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-600/20 to-transparent pointer-events-none"></div>
                        
                        <button 
                            type="button" 
                            onClick={() => setShowCreateModal(false)} 
                            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label={t('close')}
                        >
                            <X size={20}/>
                        </button>
                        
                        <div className="relative z-10 p-2">
                            <h3 id="new-ticket-title" className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                                <div className="p-3 bg-indigo-500/20 rounded-xl"><LifeBuoy className="text-indigo-400" size={24} aria-hidden="true"/></div>
                                {t('new_ticket_title') || "New Request"}
                            </h3>
                            
                            <div className="space-y-5">
                                <div className="group">
                                    <label htmlFor="ticket-subject" className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{t('ticket_subject') || "Subject"}</label>
                                    <input 
                                        id="ticket-subject"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all placeholder-slate-700 focus:ring-1 focus:ring-indigo-500" 
                                        value={newSubject} 
                                        onChange={e => setNewSubject(e.target.value)} 
                                        placeholder="Briefly describe the issue..." 
                                        maxLength={100}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="group">
                                    <label htmlFor="ticket-details" className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{t('ticket_details') || "Details"}</label>
                                    <textarea 
                                        id="ticket-details"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none h-40 resize-none transition-all placeholder-slate-700 focus:ring-1 focus:ring-indigo-500" 
                                        value={newMessage} 
                                        onChange={e => setNewMessage(e.target.value)} 
                                        placeholder="Provide more details here..." 
                                        maxLength={1000}
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-right text-[10px] text-slate-600 mt-1">{newMessage.length}/1000</p>
                                </div>
                                <Button 
                                    onClick={createTicket} 
                                    variant="primary" 
                                    className="w-full py-4 text-lg shadow-lg shadow-indigo-500/20" 
                                    disabled={!newSubject || !newMessage || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <><Loader2 size={20} className="animate-spin mr-2"/> Sending...</>
                                    ) : (
                                        t('send_request') || "Submit Request"
                                    )}
                                </Button>
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

### File: `App.tsx`
```tsx
import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, ArrowLeft, Loader2, XCircle, Clock, AlertTriangle, Phone } from 'lucide-react';

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

// --- New Medical Disclaimer Component (Internal) ---
const MedicalSafetyBanner = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="w-full bg-amber-950/40 border-b border-amber-500/20 backdrop-blur-md relative z-[100] print:hidden">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-center gap-3 text-center md:text-start">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs md:text-sm">
          <AlertTriangle size={16} className="shrink-0 animate-pulse" />
          <span>
            {isAr 
              ? "تنبيه هام: هذا الموقع يوفر أدوات مساعدة فقط ولا يُعد بديلاً عن الاستشارة الطبية المتخصصة."
              : "Medical Disclaimer: This site provides support tools only and is NOT a substitute for professional medical advice."}
          </span>
        </div>
        <div className="hidden md:block w-px h-4 bg-amber-500/20 mx-2"></div>
        <a href="tel:112" className="flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
          <Phone size={12} />
          {isAr ? "للطوارئ: اتصل بالإسعاف فوراً" : "Emergency? Call Local Services"}
        </a>
      </div>
    </div>
  );
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
        setCurrentView(AppView.DASHBOARD);
    }
  };

  const submitDailyLog = (sleepHours: number, symptoms: string[]) => {
    if (selectedDose === null || selectedMood === null) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Check for existing log to prevent double deduction
    const existingLog = logs.find(l => l.date === today);
    
    // Calculate current total pills
    let currentTotal = calculateTotalInventory(inventory);
    
    // If we are updating, we must first REFUND the old dose to the inventory
    if (existingLog) {
        currentTotal += existingLog.doseTaken;
    }
    
    // Now deduct the new dose
    const newTotal = Math.max(0, Math.round((currentTotal - selectedDose) * 100) / 100);
    
    // Construct new inventory object
    const newInventory: Inventory = { ...inventory, totalPills: newTotal };
    if (inventory.pillsPerBox > 0) {
        newInventory.boxes = Math.floor(newTotal / inventory.pillsPerBox);
        newInventory.loosePills = Math.round((newTotal % inventory.pillsPerBox) * 100) / 100;
    } else {
        newInventory.loosePills = newTotal;
    }
    setInventory(newInventory);

    // Create the new log entry
    const newLog: DailyLog = { 
        date: today, doseTaken: selectedDose, mood: selectedMood, sleepHours, symptoms 
    };
    
    // Update logs array (replace if exists, or add new)
    const newLogs = [...logs.filter(l => l.date !== today), newLog];
    setLogs(newLogs);

    // Update Plan if Algorithm is active
    if (userProfile?.planType === 'algorithm') {
        const totalUsed = newLogs.reduce((acc, l) => acc + l.doseTaken, 0);
        // Recalculate theoretical start for the algorithm projection
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-indigo-400 gap-4" dir={dir}>
            <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse"></div>
            <Loader2 size={48} className="animate-spin relative z-10" />
            <span className="font-bold tracking-widest animate-pulse relative z-10">LOADING SYSTEM...</span>
        </div>
      );
  }

  // 1. LOGIN SCREEN
  if (!currentUser && !isDemoMode) {
    return (
        <div className="min-h-screen bg-[#020617] flex flex-col">
            <MedicalSafetyBanner />
            <div className="flex-1 flex items-center justify-center">
                <LoginView 
                    handleLogin={handleLoginSubmit} 
                    handleGoogleLogin={loginWithGoogle} 
                    email={email} setEmail={setEmail} 
                    password={password} setPassword={setPassword} 
                    loginError={loginError || ''} 
                    setDemoCreds={enableDemoMode} 
                />
            </div>
        </div>
    );
  }

  // 2. ONBOARDING & RESUBMISSION
  if ((userProfile && !userProfile.setupComplete && !userProfile.role?.includes('admin')) || isResubmitting) {
    return (
        <div className="min-h-screen bg-[#020617] flex flex-col">
            <MedicalSafetyBanner />
            <div className="flex-1">
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
            </div>
        </div>
    );
  }

  // 3. MAIN APP LAYOUT
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 relative overflow-x-hidden selection:bg-indigo-500/30 flex flex-col" dir={dir}>
      
      {/* Medical Banner - Always visible at top */}
      <MedicalSafetyBanner />

      {/* --- Ambient Background Effects (The New Magic) --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-float opacity-50"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] animate-float opacity-40 delay-1000"></div>
      </div>

      {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-2 border border-white/10">
              <Check size={18} /> {toastMessage}
          </div>
      )}

      {/* REJECTION SCREEN - DOCTOR */}
      {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'rejected' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-in zoom-in relative z-10">
              <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-rose-500/20">
                  <XCircle size={48} className="text-rose-500 animate-pulse" />
              </div>
              <h1 className="text-4xl font-black text-white mb-4">نأسف، تم رفض طلبك</h1>
              <div className="bg-rose-950/30 border border-rose-500/30 p-6 rounded-2xl max-w-lg w-full mb-8 backdrop-blur-sm">
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
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-in zoom-in relative z-10">
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
          <div className="flex-1 flex flex-col md:flex-row h-full">
              {/* Mobile Back Nav - Moved Top */}
              {(viewHistory.length > 0 || currentView !== AppView.DASHBOARD) && (
                  <button onClick={goBack} className="fixed top-24 left-4 z-[60] p-3 rounded-full bg-slate-800/80 backdrop-blur-md text-white shadow-lg border border-white/10 hover:bg-indigo-600 transition-colors md:hidden">
                      {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                  </button>
              )}

              <Sidebar currentView={currentView} setCurrentView={navigateTo} handleLogout={logout} userProfile={userProfile} />
              <MobileNav currentView={currentView} setCurrentView={navigateTo} userProfile={userProfile} />
              
              <div className="flex-1 md:mr-80 p-4 md:p-12 pb-24 md:pb-12 transition-all duration-500 relative z-10">
                
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

                        {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'approved' && (
                            <>
                                {currentView === AppView.DOCTOR_DASHBOARD && <DoctorDashboardView />}
                                {currentView === AppView.DOCTOR_PATIENTS && <DoctorPatientsView />}
                            </>
                        )}

                        {currentView === AppView.COMMUNITY && (
                            <CommunityView currentUser={{...userProfile!, uid: currentUser?.uid}} />
                        )}

                        {currentView === AppView.SUPPORT && (
                            <SupportView user={{...userProfile!, uid: currentUser?.uid || ''}} />
                        )}

                        {currentView === AppView.ARTICLES && (
                            <ArticlesView userProfile={userProfile ? { ...userProfile, uid: currentUser?.uid } : null} />
                        )}
                        
                        {currentView === AppView.ADMIN && userProfile?.role === 'admin' && (
                            <AdminView />
                        )}
                        
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
          </div>
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

    // =========================================================
    // 🛡️ HELPER FUNCTIONS (دوال مساعدة للتحقق والحماية)
    // =========================================================
    
    // التحقق من تسجيل الدخول
    function isSignedIn() {
      return request.auth != null;
    }
    
    // التحقق من ملكية المستند
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // جلب بيانات المستخدم الحالي من القاعدة
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // التحقق من صلاحية "أدمن"
    function isAdmin() {
      return isSignedIn() && (
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) && getUserData().role == 'admin') ||
        // Hardcoded fallback for bootstrap admins (remove in production if user collection is seeded)
        request.auth.token.email.matches('.*@islamguide.com') 
      );
    }
    
    // التحقق من صلاحية "طبيب معتمد"
    function isApprovedDoctor() {
      let user = getUserData();
      return isSignedIn() && user.role == 'doctor' && user.doctorData.accountStatus == 'approved';
    }

    // التحقق من البيانات القادمة (Incoming Data Helpers)
    function incomingData() {
      return request.resource.data;
    }
    
    // التحقق من عدم تغيير حقل معين (Immutability)
    function notUpdating(field) {
      return !(field in incomingData()) || resource.data[field] == incomingData()[field];
    }

    // التحقق من صحة النصوص (الطول)
    function isValidString(text, min, max) {
      return text is string && text.size() >= min && text.size() <= max;
    }

    // =========================================================
    // 📂 COLLECTION RULES (قواعد المجموعات)
    // =========================================================

    // --- 1. Users Collection ---
    match /users/{userId} {
      // Admin: Full Access
      allow read, write, delete: if isAdmin();

      // Read Permissions
      allow read: if isSignedIn() && (
        isOwner(userId) || 
        // Doctors can read specific profiles (pending/approved doctors logic needed?)
        (resource.data.role == 'doctor' && resource.data.doctorData.accountStatus == 'approved') ||
        // Approved doctors can read their assigned patients
        (isApprovedDoctor() && resource.data.patientData.assignedDoctorId == request.auth.uid) ||
        // Allow reading doctors list for selection (usually handled by query filters, but good to be explicit)
        (resource.data.role == 'doctor')
      );

      // Create: Users can create their own profile
      allow create: if isSignedIn() && isOwner(userId) && (
        // Validate initial role
        (!('role' in incomingData()) || incomingData().role in ['patient', 'normal_user', 'doctor'])
      );

      // Update: Strict validation
      allow update: if isSignedIn() && (
        (isOwner(userId) && 
         // 🚫 SECURITY: User cannot change their own role or banned status
         notUpdating('role') && 
         notUpdating('isBanned') &&
         // Validation
         (incomingData().age == null || (incomingData().age > 10 && incomingData().age < 120))
        ) ||
        // Doctor updating patient data (Plan assignment)
        (isApprovedDoctor() && resource.data.patientData.assignedDoctorId == request.auth.uid) ||
        // Doctor accepting/rejecting patient request
        (isApprovedDoctor() && (resource.data.patientData == null || resource.data.patientData.assignedDoctorId == null))
      );
      
      // Delete: Users can delete their own account (GDPR compliance)
      allow delete: if isSignedIn() && isOwner(userId);
    }

    // --- 2. Chat Rooms ---
    match /rooms/{roomId} {
      // Admins can always delete
      allow delete: if isAdmin();

      allow read: if isSignedIn() && (
        // Public rooms
        resource.data.isDoctorRoom == false ||
        // Doctor sees their own rooms
        (resource.data.isDoctorRoom == true && resource.data.doctorId == request.auth.uid) ||
        // Patient sees their assigned doctor's room
        (resource.data.isDoctorRoom == true && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.patientData.assignedDoctorId == resource.data.doctorId)
      );

      // Only approved doctors can create rooms
      allow create: if isApprovedDoctor() && 
                    isValidString(incomingData().name, 3, 50);
      
      // Creator can update OR DELETE their own room
      allow update, delete: if isSignedIn() && resource.data.createdBy == request.auth.uid;
      
      // Messages Sub-collection
      match /messages/{msgId} {
        allow read: if isSignedIn();
        // Create message: Must be authenticated and valid text
        allow create: if isSignedIn() && 
                      isValidString(incomingData().text, 1, 1000) &&
                      incomingData().senderId == request.auth.uid;
        
        // FIX: Allow delete if Admin OR if User is the Room Creator (required for cleaning up room)
        allow delete: if isAdmin() || (
          isSignedIn() && 
          get(/databases/$(database)/documents/rooms/$(roomId)).data.createdBy == request.auth.uid
        );
      }
    }

    // --- 3. Articles (CMS) ---
    match /articles/{articleId} {
      allow read, write, delete: if isAdmin();
      
      // Public read for published articles
      allow read: if isSignedIn() && resource.data.isPublished == true;
      
      // Doctors can create drafts/articles
      allow create: if isApprovedDoctor() && 
                    isValidString(incomingData().title, 5, 200) &&
                    isValidString(incomingData().content, 20, 10000);
                    
      // Doctors can edit/delete their own articles
      allow update, delete: if isApprovedDoctor() && resource.data.authorId == request.auth.uid;
    }

    // --- 4. Support Tickets ---
    match /tickets/{ticketId} {
      allow read, write, delete: if isAdmin();
      
      // User can read/update their own tickets
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      
      allow create: if isSignedIn() && 
                    incomingData().userId == request.auth.uid &&
                    isValidString(incomingData().subject, 3, 200);
                    
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
    }

    // --- 5. Audit Logs ---
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      // FIX: Restrict audit log creation to Admins only
      allow create: if isAdmin() && 
                    incomingData().keys().hasAll(['action', 'timestamp']) &&
                    request.resource.data.timestamp is number;
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
  :root {
    /* --- Design System Variables (نظام الألوان والقياسات) --- */
    
    /* Primary Brand Colors (Indigo/Violet) */
    --primary-50: #eef2ff;
    --primary-100: #e0e7ff;
    --primary-500: #6366f1;
    --primary-600: #4f46e5;
    --primary-glow: rgba(99, 102, 241, 0.5);

    /* Backgrounds (Slate/Dark) */
    --bg-deep: #020617;
    --bg-surface: #0f172a;
    --bg-glass: rgba(15, 23, 42, 0.7);

    /* Status Colors */
    --status-success: #10b981;
    --status-warning: #f59e0b;
    --status-danger: #f43f5e;

    /* Focus Ring (Accessibility) */
    --focus-ring: #818cf8;
  }

  html {
    /* Smooth scrolling only if motion is allowed */
    scroll-behavior: smooth;
  }

  body {
    @apply bg-[#020617] text-slate-200 antialiased selection:bg-indigo-500/30 selection:text-indigo-200;
    
    /* Typography Setup */
    font-family: 'Tajawal', 'Inter', system-ui, -apple-system, sans-serif;
    font-feature-settings: "ss01", "ss02", "cv01", "cv02";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    
    /* Prevent horizontal overflow issues */
    overflow-x: hidden; 
    width: 100%;
  }

  /* Custom Scrollbar Styling (Webkit) */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: var(--bg-surface); 
  }
  ::-webkit-scrollbar-thumb {
    background: #334155; 
    border-radius: 4px;
    border: 2px solid var(--bg-surface);
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #475569; 
  }

  /* Global Focus Styles for Keyboard Navigation */
  :focus-visible {
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
  }
}

@layer components {
  /* Glassmorphism Utility */
  .glass {
    @apply bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-lg;
  }
  
  .glass-heavy {
    @apply bg-slate-950/80 backdrop-blur-xl border border-white/5;
  }

  /* Interactive Glass Hover Effect */
  .glass-hover {
    @apply transition-all duration-300 hover:bg-slate-800/60 hover:border-indigo-500/30 hover:shadow-indigo-500/10 hover:shadow-xl;
  }
}

@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-700/30 rounded-full hover:bg-slate-600/50 transition-colors;
  }

  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400;
  }
}

/* === Animation Library === */

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.98) translateY(5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
  50% { opacity: .8; box-shadow: 0 0 20px 0 var(--primary-glow); }
}

/* Utility Classes for Animation */
.animate-in {
  animation: fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: transform, opacity;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
  will-change: transform;
}

.animate-pulse-glow {
  animation: pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.slide-in-from-bottom-4 { --tw-enter-translate-y: 1rem; }
.slide-in-from-right-4 { --tw-enter-translate-x: 1rem; }
.zoom-in { --tw-enter-scale: 0.95; }

/* === Global Reduced Motion (Accessibility) === */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .animate-pulse, 
  .animate-bounce, 
  .animate-spin, 
  .animate-float, 
  .animate-pulse-glow {
    animation: none !important;
  }
}

/* === Global Print Styles === */
@media print {
  body {
    background-color: white !important;
    color: black !important;
    background-image: none !important;
  }

  /* Hide interactive/nav elements in print */
  nav, 
  aside, 
  .fixed, 
  .absolute, 
  button, 
  .no-print,
  [role="dialog"] button {
    display: none !important;
  }

  /* Ensure main content is visible */
  main, 
  .print\:block,
  [role="dialog"] {
    display: block !important;
    position: static !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    box-shadow: none !important;
    border: none !important;
  }

  /* Reset layout constraints */
  .max-w-4xl, .max-w-7xl, .lg\:col-span-8 {
    max-width: none !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  /* Ensure text contrast */
  p, h1, h2, h3, span, div {
    color: black !important;
    text-shadow: none !important;
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
// ============================================================================
// 1. MEDICATION & CLINICAL TYPES
// ============================================================================

export type MedType = 'narcotic' | 'psychiatric' | 'normal' | null;
export type MedForm = 'tablet' | 'liquid'; 
export type MedUnit = 'mg' | 'g' | 'ml' | 'l';

// ============================================================================
// 2. USER ROLES & PROFILES
// ============================================================================

export type UserRole = 'admin' | 'doctor' | 'normal_user' | 'patient';

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

export interface PatientProfileData {
  assignedDoctorId: string;
  assignedDoctorName: string;
  requestStatus: 'pending' | 'approved' | 'rejected'; 
  
  isPlanAssigned: boolean; 
  isRecovered: boolean;    
  recoveryDate?: string;   
}

export interface UserProfile {
  uid?: string; 
  email: string;
  name: string;
  
  // Physical Stats (New for Safety Algo)
  age?: number;
  weight?: number; // kg
  height?: number; // cm

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

// ============================================================================
// 3. INVENTORY & PLANNING
// ============================================================================

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

// ============================================================================
// 4. CONTENT & CMS
// ============================================================================

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

// ============================================================================
// 5. COMMUNITY & CHAT
// ============================================================================

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

// ============================================================================
// 6. SUPPORT SYSTEM
// ============================================================================

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
  isAdmin: boolean; // Flag to distinguish support staff
}

// ============================================================================
// 7. SECURITY & AUDIT
// ============================================================================

export interface AuditLog {
  id?: string;
  adminId: string;
  adminName: string;
  action: string; 
  targetId?: string; 
  details: string;
  timestamp: number;
}

// ============================================================================
// 8. NAVIGATION
// ============================================================================

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
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Security: Disable source maps in production to hide source code
    sourcemap: false,
    
    // Performance: Increase chunk size limit warning to reduce noise
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // Optimization: Manually split huge vendor libraries into separate chunks
        // This improves browser caching (users don't re-download firebase when you change UI)
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Split Firebase (usually the largest chunk)
            if (id.includes('firebase')) {
              return 'firebase';
            }
            // Split Recharts (charting library)
            if (id.includes('recharts')) {
              return 'recharts';
            }
            // Split React Core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Split Lucide Icons
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            
            // All other node_modules go to a generic vendor file
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true, // Allow LAN access for mobile testing
  },
});
```
---

## 📊 Stats
- Total Files: 56
- Total Characters: 599134
- Estimated Tokens: ~149.784 (GPT-4 Context)
