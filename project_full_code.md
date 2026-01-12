# Project Code Dump
Generated: 12/1/2026, 23:21:08

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
import { FileText, Printer, X, Activity, Calendar, User, Ruler, Weight } from 'lucide-react';
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
  
  if (!isOpen) return null;

  // حسابات التقرير
  const unitLabel = userProfile?.medUnit || 'mg';
  const adherenceRate = plan.length > 0 ? Math.round((logs.length / plan.filter(p => p.date <= new Date().toISOString().split('T')[0]).length) * 100) : 0;
  const startDose = plan.length > 0 ? plan[0].plannedDose : 0;
  const currentDose = plan.find(p => p.date === new Date().toISOString().split('T')[0])?.plannedDose || 0;
  
  const planTypeLabel = userProfile?.planType === 'manual' 
    ? `Managed by Dr. ${userProfile.patientData?.assignedDoctorName || 'Unknown'}` 
    : 'Automated Smart Algorithm';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300 p-4 print:p-0 print:bg-white print:static">
      
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col print:max-h-none print:rounded-none print:shadow-none print:w-full">
        
        {/* Header - Screen Only */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 print:hidden">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <FileText className="text-indigo-600" /> {t('export_report')}
            </h2>
            <div className="flex gap-3">
                <Button onClick={() => window.print()} className="!py-2 !px-4 !bg-indigo-600 !text-white !rounded-xl !shadow-none hover:!bg-indigo-700">
                    <Printer size={18} className="mr-2"/> {t('print')}
                </Button>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* Printable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible custom-scrollbar bg-white">
            
            {/* Report Header */}
            <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Islam's Guide <span className="text-indigo-600 text-sm align-top">PRO</span></h1>
                    <p className="text-slate-500 font-medium">Recovery Progress & Neuro-Adaptation Report</p>
                </div>
                <div className="text-right">
                    <p className="text-slate-400 text-sm mb-1">Generated on</p>
                    <p className="font-bold text-slate-900 font-mono">{new Date().toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Patient Info Grid */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8 print:border print:border-slate-300">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <User size={14} /> Patient Information
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <span className="block text-xs text-slate-500 mb-1">Full Name</span>
                        <span className="block font-bold text-slate-900 text-lg">{userProfile?.name}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-slate-500 mb-1">Age</span>
                        <span className="block font-bold text-slate-900 text-lg">{userProfile?.age ? `${userProfile.age} Years` : '-'}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-slate-500 mb-1">Weight</span>
                        <span className="block font-bold text-slate-900 text-lg">{userProfile?.weight ? `${userProfile.weight} kg` : '-'}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-slate-500 mb-1">Height</span>
                        <span className="block font-bold text-slate-900 text-lg">{userProfile?.height ? `${userProfile.height} cm` : '-'}</span>
                    </div>
                </div>
            </div>

            {/* Clinical Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8 print:grid-cols-3">
                 <div className="p-4 rounded-xl border border-slate-200 bg-white">
                     <span className="block text-xs text-slate-400 uppercase font-bold mb-2">Medication</span>
                     <div className="font-black text-xl text-slate-800 capitalize">{userProfile?.medType || 'Standard'}</div>
                     <div className="text-xs text-slate-500 mt-1">{userProfile?.medForm} ({unitLabel})</div>
                 </div>
                 <div className="p-4 rounded-xl border border-slate-200 bg-white">
                     <span className="block text-xs text-slate-400 uppercase font-bold mb-2">Dose Reduction</span>
                     <div className="flex items-baseline gap-2">
                         <span className="font-black text-xl text-slate-800">{startDose}</span>
                         <span className="text-slate-400 text-sm">➔</span>
                         <span className="font-black text-xl text-indigo-600">{currentDose}</span>
                         <span className="text-xs text-slate-500">{unitLabel}</span>
                     </div>
                 </div>
                 <div className="p-4 rounded-xl border border-slate-200 bg-white">
                     <span className="block text-xs text-slate-400 uppercase font-bold mb-2">Adherence</span>
                     <div className="font-black text-xl text-emerald-600">{adherenceRate}%</div>
                     <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                         <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${adherenceRate}%` }}></div>
                     </div>
                 </div>
            </div>

            {/* Detailed Log Table */}
            <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={16} className="text-slate-400"/> Daily Vitals Log
                </h3>
                <table className="w-full text-sm text-left border-collapse border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th className="p-3 font-bold border-b border-slate-200">Date</th>
                            <th className="p-3 font-bold border-b border-slate-200">Planned</th>
                            <th className="p-3 font-bold border-b border-slate-200">Taken</th>
                            <th className="p-3 font-bold border-b border-slate-200">Sleep (Prev)</th>
                            <th className="p-3 font-bold border-b border-slate-200">Mood</th>
                            <th className="p-3 font-bold border-b border-slate-200 w-1/3">Symptoms / Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.slice().reverse().map((log, i) => {
                            const planned = plan.find(p => p.date === log.date)?.plannedDose;
                            return (
                                <tr key={i} className="hover:bg-slate-50 break-inside-avoid">
                                    <td className="p-3 font-mono text-slate-500">{log.date}</td>
                                    <td className="p-3 font-medium text-slate-400">{planned !== undefined ? `${planned}${unitLabel}` : '-'}</td>
                                    <td className="p-3 font-bold text-indigo-600">{log.doseTaken}{unitLabel}</td>
                                    <td className="p-3 text-slate-700">{log.sleepHours ? `${log.sleepHours} hrs` : '-'}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                            log.mood === 'good' ? 'bg-emerald-100 text-emerald-700' : 
                                            log.mood === 'bad' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {log.mood}
                                        </span>
                                    </td>
                                    <td className="p-3 text-slate-500 text-xs italic">
                                        {log.symptoms && log.symptoms.length > 0 ? log.symptoms.join(', ') : 'None'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer / Disclaimer */}
            <div className="border-t border-slate-200 pt-6 mt-12 flex justify-between items-end text-xs text-slate-400 print:fixed print:bottom-0 print:left-0 print:w-full print:p-8 print:bg-white">
                <div>
                    <p className="font-bold text-slate-500 mb-1">Plan Strategy: {planTypeLabel}</p>
                    <p>This report is computer-generated by Islam's Guide Algorithm v2.0.</p>
                    <p>It acts as a supplementary record and does not replace official medical advice.</p>
                </div>
                <div className="text-center">
                    <div className="h-10 w-32 border-b border-slate-300 mb-1"></div>
                    <p>Doctor's Signature</p>
                </div>
            </div>
        </div>
      </div>
      
      {/* Print CSS Rules */}
      <style>{`
        @media print {
            @page { margin: 0.5cm; size: A4 portrait; }
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; color: black !important; background: white !important; }
            .fixed { position: static !important; overflow: visible !important; }
            /* Hide scrollbars in print */
            ::-webkit-scrollbar { display: none; }
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
  const { t, dir } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300 p-4" dir={dir}>
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
                    {t('sci_btn_understood')} <ArrowRight size={20} className={dir === 'rtl' ? 'mr-2 rotate-180' : 'ml-2'} />
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
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'panic';
  children: React.ReactNode;
  isLoading?: boolean; // خاصية جديدة للتحميل
}

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false, 
  isLoading = false,
  ...props 
}: ButtonProps) => {
  
  // التصميم الأساسي المشترك
  const baseStyle = "relative overflow-hidden px-6 py-4 rounded-2xl font-bold transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2 tracking-wide select-none disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 group";
  
  // الأنماط المختلفة
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/20 hover:shadow-indigo-500/40 hover:border-indigo-400/40",
    
    secondary: "bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20",
    
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/20 transition-colors",
    
    success: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/20 hover:shadow-emerald-500/40",
    
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border border-transparent",
    
    panic: "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/40 animate-pulse-glow border border-rose-400/30"
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || isLoading} 
      className={`${baseStyle} ${selectedVariant} ${className}`}
      {...props}
    >
      {/* مؤشر التحميل */}
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      ) : (
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      )}

      {/* تأثير اللمعان (Shine Effect) - يعمل فقط على الأزرار الملونة */}
      {(variant === 'primary' || variant === 'success') && !disabled && !isLoading && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 ease-in-out pointer-events-none"></div>
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
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex items-center gap-1 p-1 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:border-white/20 transition-colors group">
      
      {/* Icon Indicator */}
      <div className="px-2 text-slate-400 group-hover:text-indigo-400 transition-colors">
        <Globe size={14} />
      </div>

      {(['ar', 'en', 'ru'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`
            relative px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300
            ${language === lang 
              ? 'text-white shadow-lg shadow-indigo-500/30' 
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}
          `}
        >
          {/* خلفية متدرجة للعنصر النشط فقط */}
          {language === lang && (
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl -z-10 animate-in zoom-in"></div>
          )}
          
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
      {/* خلفية متوهجة خلف الحلقة */}
      <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-700 animate-pulse-glow"></div>
      
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg] transform transition-transform duration-700 group-hover:scale-105 relative z-10">
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
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} 
            strokeLinecap="round" 
            fill="transparent" 
            r={normalizedRadius} 
            cx={radius} 
            cy={radius} 
            filter="url(#glow)"
        />
      </svg>
      
      {/* النص في المنتصف */}
      <div className="absolute flex flex-col items-center text-center animate-in zoom-in pointer-events-none z-20">
        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white tracking-tighter drop-shadow-2xl">
            {Math.round(progress)}%
        </span>
        <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">تعافي</span>
        
        <div className="mt-2 bg-slate-900/80 px-3 py-1 rounded-full border border-white/10 shadow-lg backdrop-blur-md">
            <span className="text-[9px] text-slate-300 font-mono">
                {totalSteps} {t('days_left').split(' ')[0]}
            </span>
        </div>
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
        { id: AppView.COMMUNITY, icon: MessageSquare, label: language === 'ar' ? 'المجتمع' : 'Chat' },
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
             );
        }
    }
    
    // Settings always available
    items.push({ id: AppView.SETTINGS, icon: Settings, label: t('nav_settings') });
    
    return items;
  };

  const menuItems = getMenuItems();

  return (
    // الجزيرة العائمة: glass class + rounded-full + margins
    <div className="md:hidden fixed bottom-5 left-4 right-4 h-[70px] glass rounded-[2rem] z-50 animate-in slide-in-from-bottom-8 flex items-center justify-between px-2 shadow-2xl shadow-black/50">
      
      {menuItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`
              flex-1 flex flex-col items-center justify-center gap-1 h-full relative group transition-all duration-500
              ${isActive ? '-translate-y-2' : ''}
            `}
          >
            {/* الخلفية المضيئة للعنصر النشط */}
            <div className={`
              absolute top-2 w-10 h-10 rounded-full blur-lg transition-all duration-500
              ${isActive ? 'bg-indigo-500/40 opacity-100' : 'opacity-0'}
            `}></div>

            {/* الأيقونة */}
            <div className={`
              relative z-10 p-2.5 rounded-full transition-all duration-300
              ${isActive 
                ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-[#020617]' 
                : 'text-slate-500 hover:text-slate-300'}
            `}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            
            {/* النص */}
            <span className={`
              text-[10px] font-bold tracking-wide transition-all duration-300 absolute bottom-2
              ${isActive ? 'opacity-100 text-white translate-y-0' : 'opacity-0 translate-y-2'}
            `}>
                {item.label}
            </span>
            
            {/* نقطة صغيرة للعناصر غير النشطة بدلاً من النص لتوفير المساحة */}
            {!isActive && (
                 <span className="w-1 h-1 rounded-full bg-slate-700 absolute bottom-3 transition-all duration-300 group-hover:bg-slate-500"></span>
            )}
          </button>
        );
      })}
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
    <div className="hidden md:flex flex-col w-80 h-screen fixed right-0 top-0 overflow-y-auto z-50 border-l border-white/5 bg-slate-950/80 backdrop-blur-2xl shadow-2xl">
      
      {/* Header */}
      <div className="p-8 pb-4 relative shrink-0">
        {/* Ambient Glow behind Logo */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none"></div>
        
        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 relative z-10 mb-1">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-6 h-6 text-white" />
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
                    Smart Edition <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </span>
            )}
        </div>
      </div>
      
      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
                ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}
              `}
            >
              {/* Active Background Gradient */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-indigo-600/5 to-transparent border-r-[3px] border-indigo-500 opacity-100 transition-opacity duration-300"></div>
              )}

              <item.icon 
                className={`
                  w-5 h-5 relative z-10 transition-transform duration-300 
                  ${isActive ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'group-hover:scale-110'}
                `} 
              />
              
              <span className={`font-bold text-lg tracking-wide truncate relative z-10 ${isActive ? 'text-indigo-50' : ''}`}>
                {item.label}
              </span>
              
              {/* Admin Notification Dot */}
              {item.id === AppView.ADMIN && (
                  <span className="mr-auto w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)] relative z-10"></span>
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-6 shrink-0 space-y-4 relative z-10">
        <LanguageSwitcher />
        
        {/* User Card */}
        <div className="glass p-4 rounded-2xl flex items-center gap-3 group hover:border-indigo-500/30 transition-all cursor-default">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold border border-white/5 group-hover:scale-105 transition-transform">
                {userProfile?.role === 'doctor' ? <Stethoscope size={18} /> : (userProfile?.name?.charAt(0).toUpperCase() || <UserIcon size={18} />)}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{userProfile?.name || 'Guest'}</p>
                <p className="text-[10px] text-slate-500 truncate">{userProfile?.role?.toUpperCase()}</p>
            </div>
            <button 
                onClick={handleLogout} 
                className="p-2 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
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
  createUserWithEmailAndPassword, // دالة إنشاء الحساب
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile // لتحديث اسم المستخدم فوراً
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // للكتابة في قاعدة البيانات
import { auth, googleProvider, db } from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  // الدالة الجديدة لإنشاء الحساب
  signupWithEmail: (e: string, p: string, name: string, data: { age: number, weight: number, height: number }) => Promise<void>;
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

  // تسجيل الدخول
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
      if (err.code === 'auth/user-not-found') errorMessage = 'User not found.';
      else if (err.code === 'auth/wrong-password') errorMessage = 'Incorrect password.';
      else if (err.code === 'auth/invalid-email') errorMessage = 'Invalid email format.';
      else errorMessage = err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- دالة إنشاء الحساب الجديدة ---
  const signupWithEmail = async (email: string, password: string, name: string, data: { age: number, weight: number, height: number }) => {
    if (!auth) return;
    
    setLoading(true);
    setError(null);

    try {
        // 1. إنشاء الحساب في Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. تحديث الاسم في ملف Auth الشخصي
        await updateProfile(user, { displayName: name });

        // 3. إنشاء ملف المستخدم في قاعدة البيانات (Firestore) مع البيانات الفيزيائية
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: email,
            name: name,
            role: 'normal_user', // افتراضياً مستخدم عادي
            age: data.age,
            weight: data.weight,
            height: data.height,
            setupComplete: false, // لا يزال يحتاج لإعداد الدواء
            createdAt: new Date().toISOString(),
            // تهيئة القيم الفارغة لتجنب الأخطاء لاحقاً
            plan: [],
            logs: [],
            inventory: { boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 }
        });

    } catch (err: any) {
        let errorMessage = 'Signup Error';
        if (err.code === 'auth/email-already-in-use') errorMessage = 'Email already registered.';
        else if (err.code === 'auth/weak-password') errorMessage = 'Password should be at least 6 characters.';
        else errorMessage = err.message;
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // ملاحظة: مع جوجل قد نحتاج خطوة إضافية لطلب العمر والوزن إذا كان مستخدماً جديداً، 
      // لكن سنكتفي بالدخول المباشر حالياً للتبسيط.
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
      localStorage.removeItem('taper_profile');
      localStorage.removeItem('taper_plan');
      window.location.reload();
    } catch (err: any) {
      console.error("Logout Error:", err);
    }
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
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
      signupWithEmail, // تصدير الدالة الجديدة
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
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'; // تمت إضافة deleteDoc
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
        // Demo Mode
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
        
        if (data.userProfile) Object.assign(fetchedProfile, data.userProfile);

        setUserProfile(fetchedProfile);

        // Only update local state from cloud if we are not currently "dirty"
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

  // 2. Sync Logic
  useEffect(() => {
    if (userProfile?.setupComplete) {
        isDirty.current = true;
    }

    if (userProfile) localStorage.setItem('taper_profile', JSON.stringify(userProfile));
    if (plan.length > 0) localStorage.setItem('taper_plan', JSON.stringify(plan));
    
    if (currentUser && !isDemoMode && userProfile?.setupComplete) {
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
                console.error("Cloud sync failed", e);
            }
        }, 5000); 

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

  // --- التعديل الجذري هنا ---
  const resetAllData = async () => {
      if (!window.confirm("تحذير هام: هذا الإجراء سيقوم بحذف جميع بياناتك، خطتك العلاجية، وسجلاتك نهائياً من قاعدة البيانات. هل أنت متأكد؟")) {
          return;
      }

      try {
          setDataLoading(true);
          
          if (currentUser && !isDemoMode) {
              // حذف المستند بالكامل من فايربيس
              await deleteDoc(doc(db, "users", currentUser.uid));
          }
          
          // تنظيف المتصفح
          localStorage.clear();
          setUserProfile(null);
          setPlan([]);
          setLogs([]);
          setInventory({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
          
          // تسجيل الخروج
          await logout();
          
      } catch (e) {
          console.error("Error resetting data:", e);
          alert("حدث خطأ أثناء محاولة حذف البيانات. يرجى التحقق من الاتصال بالإنترنت.");
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
// 1. UTILS (أدوات مساعدة)
// ============================================================================

// إضافة أيام للتاريخ
const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0];
};

// حساب المخزون الكلي
export const calculateTotalInventory = (inv: Inventory): number => {
    return (inv.boxes * (inv.pillsPerBox || 1)) + inv.loosePills;
};

// ============================================================================
// 2. ENGINE CORE (المحرك المنطقي الجديد)
// ============================================================================

/**
 * المولد اليدوي (للأطباء) - يبقى كما هو
 */
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

/**
 * المولد الذكي (الخوارزمية العملية)
 * تم تعديلها لتدعم نظام "الأنصاف" و "تباعد الأيام"
 */
export const generatePlan = (
    totalPills: number, 
    startDose: number, 
    startDateStr: string,
    speedModifier: number = 1.0, // 1.0 = عادي، 0.5 = بطيء، 1.5 = سريع
    recentLogs: DailyLog[] = [],
    medForm: MedForm = 'tablet'
): PlanDay[] => {
    
    // إذا كان رصيد الحبوب 0 أو الجرعة 0، لا نولد خطة
    if (totalPills <= 0 || startDose <= 0) return [];

    const plan: PlanDay[] = [];
    let currentDate = startDateStr.split('T')[0];
    let remainingInventory = totalPills;
    
    // تحديد أقل وحدة كسر (للأقراص 0.5 للنص، وللسائل 0.1)
    // بناءً على طلبك: التركيز على نظام الأنصاف (0.5)
    const MIN_STEP = medForm === 'liquid' ? 0.1 : 0.5;
    
    // الجرعة الحالية التي سنبدأ التخفيض منها
    let currentDose = startDose;

    // --- المرحلة الأولى: التخفيض المباشر حتى الوصول لـ 0.5 ---
    // طالما الجرعة أكبر من 0.5، نقوم بالإنقاص تدريجياً
    while (currentDose > 0.5 && remainingInventory >= currentDose) {
        
        // تحديد مدة الثبات على الجرعة (تتأثر بالسرعة المختارة)
        // السرعة العادية: 7-10 أيام لكل تخفيض
        let daysOnDose = Math.round(7 * (1 / speedModifier));
        if (daysOnDose < 3) daysOnDose = 3; // لا تقل عن 3 أيام

        // إضافة الأيام للخطة
        for (let i = 0; i < daysOnDose; i++) {
            if (remainingInventory < currentDose) break; // نفاد المخزون

            plan.push({
                date: currentDate,
                plannedDose: currentDose,
                isPast: false
            });
            remainingInventory -= currentDose;
            currentDate = addDays(currentDate, 1);
        }

        // حساب الجرعة التالية (إنقاص نصف حبة)
        // مثال: 2 -> 1.5 -> 1 -> 0.5
        let nextDose = currentDose - 0.5;
        
        // تصحيح الأرقام العشرية
        nextDose = Math.round(nextDose * 10) / 10;
        
        if (nextDose < 0.5) nextDose = 0.5; // لا ننزل تحت النص في هذه المرحلة
        currentDose = nextDose;
    }

    // --- المرحلة الثانية: نظام تباعد الأيام (Skip-Day Logic) ---
    // عندما نصل لجرعة 0.5 (نص حبة)، نبدأ بزيادة أيام الراحة تدريجياً
    // هذا هو النظام الذي طلبته بالضبط
    
    if (currentDose === 0.5 && remainingInventory >= 0.5) {
        
        // تعريف أنماط تباعد الأيام
        const patterns = [
            { label: "Day ON, Day OFF", doseSeq: [0.5, 0], cycles: 4 },           // أسبوع تقريباً
            { label: "Day ON, 2 Days OFF", doseSeq: [0.5, 0, 0], cycles: 3 },     // 9 أيام
            { label: "Day ON, 3 Days OFF", doseSeq: [0.5, 0, 0, 0], cycles: 2 },  // 8 أيام
            { label: "Day ON, 4 Days OFF", doseSeq: [0.5, 0, 0, 0, 0], cycles: 2 } // 10 أيام
        ];

        // تطبيق الأنماط بالترتيب
        for (const pattern of patterns) {
            // نعدل عدد التكرارات (Cycles) بناءً على سرعة المستخدم
            // إذا اختار "سريع" نقلل التكرار، إذا "بطيء" نزيد التكرار
            const adjustedCycles = Math.max(1, Math.round(pattern.cycles * (1 / speedModifier)));

            for (let c = 0; c < adjustedCycles; c++) {
                for (const dose of pattern.doseSeq) {
                    // التحقق من المخزون فقط في أيام الجرعة
                    if (dose > 0 && remainingInventory < dose) break; 

                    plan.push({
                        date: currentDate,
                        plannedDose: dose,
                        isPast: false
                    });

                    if (dose > 0) remainingInventory -= dose;
                    currentDate = addDays(currentDate, 1);
                }
                if (remainingInventory < 0.5) break;
            }
            if (remainingInventory < 0.5) break;
        }
    }

    return plan;
};

// --- إعادة الحساب الديناميكي (عند تسجيل جرعة يومية) ---
export const adjustPlan = (
    originalPlan: PlanDay[],
    logs: DailyLog[],
    totalInitialInventory: number, 
    speedModifier: number = 1.0,
    medForm: MedForm = 'tablet'
): PlanDay[] => {
    
    // ترتيب السجلات زمنياً
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedLogs.length === 0) {
        // إذا لم توجد سجلات، نولد خطة جديدة من البداية
        return originalPlan.length > 0 
            ? generatePlan(totalInitialInventory, originalPlan[0].plannedDose, originalPlan[0].date, speedModifier, [], medForm)
            : [];
    }

    // آخر يوم تم تسجيله
    const lastLog = sortedLogs[sortedLogs.length - 1];
    
    // حساب ما تم استهلاكه
    const totalUsed = sortedLogs.reduce((acc, log) => acc + log.doseTaken, 0);
    
    // المتبقي الفعلي
    const remainingInventory = Math.max(0, totalInitialInventory - totalUsed);

    // الأيام الماضية (نحتفظ بها كما هي في التاريخ)
    const historyDays = originalPlan.filter(day => day.date <= lastLog.date).map(day => {
        const log = sortedLogs.find(l => l.date === day.date);
        return { ...day, isPast: true, log: log || undefined };
    });

    // تحديد نقطة الانطلاق الجديدة
    // إذا كان آخر يوم 0 (يوم راحة)، نبحث عن آخر جرعة حقيقية أخذها لنعرف مستواه
    let startPoint = lastLog.doseTaken;
    if (startPoint === 0) {
        const lastActive = [...sortedLogs].reverse().find(l => l.doseTaken > 0);
        // إذا وجدنا آخر جرعة فعالة، نعتمدها، وإلا نعود لبداية الخطة
        startPoint = lastActive ? lastActive.doseTaken : (originalPlan[0]?.plannedDose || 0.5);
    }

    // توليد المستقبل بناءً على المعطيات الجديدة
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
// تمت إضافة Clock إلى الاستيراد هنا 👇
import { Plus, Trash2, FileText, Image, Tag, AlignLeft, X, Clock } from 'lucide-react';
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

    const getCategoryColor = (cat: string) => {
        switch(cat) {
            case 'medical': return 'indigo';
            case 'motivation': return 'rose';
            case 'news': return 'blue';
            default: return 'amber';
        }
    };

    return (
        <div className="animate-in fade-in space-y-8">
            {/* Header Action */}
            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                        <FileText size={20} className="text-indigo-400"/>
                    </div>
                    {t('tab_cms')}
                </h2>
                <Button onClick={() => setShowArticleModal(true)} variant="primary" className="!py-2.5 !px-5 !text-sm !rounded-xl shadow-lg shadow-indigo-500/20">
                    <Plus size={18} className="mr-2"/> {t('new_article_btn')}
                </Button>
            </div>

            {/* Create Article Modal (Inline for quick access or Overlay) */}
            {showArticleModal && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-in zoom-in">
                     <Card className="w-full max-w-2xl bg-slate-900 border-white/10 shadow-2xl relative rounded-[2rem] overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                         
                         <div className="p-8">
                             <div className="flex justify-between items-start mb-8">
                                <h3 className="text-2xl font-black text-white">{t('new_article_btn')}</h3>
                                <button onClick={() => setShowArticleModal(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                                    <X size={24} />
                                </button>
                             </div>

                             <div className="space-y-6">
                                 <div className="group">
                                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{t('article_title_label')}</label>
                                     <div className="relative">
                                         <FileText className="absolute top-4 right-4 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                                         <input 
                                             className="w-full bg-slate-950/50 p-4 pr-12 rounded-xl text-white border border-white/10 outline-none focus:border-indigo-500 transition-all placeholder-slate-700 font-bold text-lg" 
                                             placeholder="Article Title..."
                                             value={newArticle.title} 
                                             onChange={e => setNewArticle({...newArticle, title: e.target.value})} 
                                             autoFocus
                                         />
                                     </div>
                                 </div>
                                 
                                 <div>
                                     <label className="text-xs font-bold text-slate-500 uppercase mb-3 block ml-1">{t('article_cat_label')}</label>
                                     <div className="flex gap-3 flex-wrap">
                                         {(['medical', 'motivation', 'tip', 'news'] as const).map(cat => (
                                             <button 
                                                key={cat}
                                                onClick={() => setNewArticle({...newArticle, category: cat})}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
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
                                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{t('article_content_label')}</label>
                                     <textarea 
                                         className="w-full bg-slate-950/50 p-4 rounded-xl text-white border border-white/10 h-40 outline-none focus:border-indigo-500 transition-all resize-none placeholder-slate-700 custom-scrollbar" 
                                         placeholder="Write something amazing..."
                                         value={newArticle.content} 
                                         onChange={e => setNewArticle({...newArticle, content: e.target.value})} 
                                     />
                                 </div>
                                 
                                 <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                     <Button variant="secondary" onClick={() => setShowArticleModal(false)}>{t('cancel_btn')}</Button>
                                     <Button variant="success" onClick={handlePublish} disabled={!newArticle.title || !newArticle.content}>
                                         {t('publish_now')}
                                     </Button>
                                 </div>
                             </div>
                         </div>
                     </Card>
                 </div>
            )}

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.length === 0 && (
                    <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
                        <Image size={48} className="mx-auto mb-4 opacity-20"/>
                        <p>No articles published yet.</p>
                    </div>
                )}
                
                {articles.map(art => (
                    <div key={art.id} className="group relative bg-slate-900/60 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/10 flex flex-col h-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <Badge color={getCategoryColor(art.category) as any} className="shadow-none bg-slate-950/50 border-white/10">
                                {art.category.toUpperCase()}
                            </Badge>
                            <button 
                                onClick={() => art.id && deleteArticle(art.id)}
                                className="text-slate-600 hover:text-rose-500 p-2 hover:bg-rose-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete Article"
                            >
                                <Trash2 size={16}/>
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
                            <Clock size={12}/>
                            {new Date(art.createdAt).toLocaleDateString()}
                            <span className="mx-1">•</span>
                            <span className="text-slate-400 font-bold">{art.authorName}</span>
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
import { Lock, AlertCircle, Stethoscope, Eye, Ban, Trash2, ShieldCheck, MapPin } from 'lucide-react';
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
        <div className="space-y-10 animate-in fade-in">
             {/* 1. Pending Approvals Section */}
             <div className="space-y-6">
                 <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                     <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <Lock className="text-amber-500" size={20} />
                     </div>
                     <h2 className="text-xl font-bold text-white">
                         {t('pending_approvals')}
                         <span className="ml-3 text-sm bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-white/5">{pendingDoctors.length}</span>
                     </h2>
                 </div>
                 
                 {pendingDoctors.length === 0 ? (
                     <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-500 flex flex-col items-center justify-center">
                         <ShieldCheck className="mb-4 opacity-20" size={48} />
                         <p>No pending requests. All clear.</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingDoctors.map(doc => (
                            <div key={doc.uid} className="group relative bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:border-amber-500/30 transition-all duration-300 shadow-lg hover:shadow-amber-900/10">
                                <div className="absolute top-0 right-0 p-6 opacity-50">
                                    <Badge color="amber" className="shadow-none bg-amber-500/10 border-amber-500/20">Pending</Badge>
                                </div>
                                
                                <div className="flex flex-col items-center text-center mb-6 pt-4">
                                    <div className="w-20 h-20 mb-4 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 text-2xl font-bold border border-white/5 shadow-inner group-hover:scale-105 transition-transform">
                                        {doc.doctorData?.photoUrl ? (
                                            <img src={doc.doctorData.photoUrl} alt="Dr" className="w-full h-full rounded-2xl object-cover" />
                                        ) : (
                                            doc.name.charAt(0)
                                        )}
                                    </div>
                                    <h3 className="font-bold text-white text-xl mb-1">{doc.name}</h3>
                                    <p className="text-sm text-slate-400 flex items-center gap-1">
                                        <Stethoscope size={12}/> {doc.doctorData?.specialty}
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
                                
                                <Button onClick={() => setSelectedDoctor(doc)} variant="secondary" className="w-full !py-3 border-white/5 hover:border-white/20 hover:bg-white/5">
                                    <Eye size={16} className="mr-2"/> {t('view_details')}
                                </Button>
                            </div>
                        ))}
                     </div>
                 )}
             </div>

             {/* 2. Active Doctors List */}
             <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                     <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <Stethoscope className="text-emerald-500" size={20} />
                     </div>
                     <h2 className="text-xl font-bold text-white">
                         {t('approved_docs_list')}
                         <span className="ml-3 text-sm bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-white/5">{approvedDoctors.length}</span>
                     </h2>
                </div>

                <Card className="bg-slate-900/60 border-white/10 overflow-hidden !p-0 backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-950/80 text-slate-500 uppercase font-bold text-xs tracking-wider">
                                <tr>
                                    <th className="p-5">Doctor</th>
                                    <th className="p-5">Specialty</th>
                                    <th className="p-5 text-center">Patients</th>
                                    <th className="p-5 text-center">Level</th>
                                    <th className="p-5 text-center">Actions</th>
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
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                                    {doc.doctorData?.photoUrl ? (
                                                        <img src={doc.doctorData.photoUrl} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        doc.name.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-base">{doc.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono font-normal flex items-center gap-1 mt-0.5">
                                                        <MapPin size={10}/> {doc.doctorData?.clinicLocation || 'Online'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <Badge color="blue" className="bg-blue-500/10 border-blue-500/20 text-blue-300 shadow-none">
                                                    {doc.doctorData?.specialty}
                                                </Badge>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className="font-mono font-bold text-white bg-slate-800 px-3 py-1 rounded-lg border border-white/5">
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
                                                    <button onClick={() => setSelectedDoctor(doc)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors border border-blue-500/20" title={t('view_details')}>
                                                        <Eye size={16}/>
                                                    </button>
                                                    <button onClick={() => toggleBan(doc)} className="p-2 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500 hover:text-white transition-colors border border-amber-500/20" title={doc.isBanned ? t('unban_user') : t('ban_user')}>
                                                        <Ban size={16}/>
                                                    </button>
                                                    <button onClick={() => doc.uid && deleteUser(doc.uid)} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-colors border border-rose-500/20" title={t('delete_user')}>
                                                        <Trash2 size={16}/>
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
             </div>
        </div>
    );
};
```
---

### File: `views\admin\AdminOverview.tsx`
```tsx
import React, { useMemo } from 'react';
import { Lock, CheckCircle, Users, Activity, AlertCircle } from 'lucide-react';
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
    const { t } = useLanguage();

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
    }, [users, t]);

    const pieData = [
        { name: 'Active', value: normalUsers.length - recoveredUsers.length, color: '#6366f1' },
        { name: 'Recovered', value: recoveredUsers.length, color: '#10b981' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <Card className="relative bg-slate-900/80 border-white/5 p-6 flex flex-col justify-between h-32 overflow-hidden group-hover:border-white/10 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <stat.icon size={64} color={stat.color} />
                            </div>
                            <div>
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{stat.name}</h3>
                                <div className="text-4xl font-black text-white" style={{ textShadow: `0 0 20px ${stat.color}40` }}>
                                    {stat.value}
                                </div>
                            </div>
                            <div className="h-1 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '70%', backgroundColor: stat.color }}></div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <Card className="lg:col-span-2 bg-slate-900/80 border-white/5 min-h-[350px] flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2 z-10">
                        <Activity size={20} className="text-indigo-400"/> {t('stat_overview')}
                    </h3>
                    
                    <div className="flex-1 w-full min-h-[250px] z-10">
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
                </Card>
                
                {/* Pending Requests & Ratio */}
                <div className="flex flex-col gap-6">
                    <Card className="bg-slate-900/80 border-white/5 flex-1 relative overflow-hidden">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Lock size={18} className="text-amber-500"/> {t('pending_approvals')}
                        </h3>
                        {pendingDoctors.length === 0 ? (
                            <div className="text-center text-slate-500 py-8 flex flex-col items-center justify-center h-full">
                                <CheckCircle size={40} className="mb-3 text-emerald-500/20"/>
                                <p className="text-sm">All clear! No pending requests.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingDoctors.slice(0, 3).map(doc => (
                                    <div key={doc.uid} className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all group">
                                        <div>
                                            <div className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">{doc.name}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{doc.doctorData?.specialty}</div>
                                        </div>
                                        <Button onClick={() => setActiveTab('doctors')} variant="secondary" className="!py-1.5 !px-3 !text-xs !rounded-lg">
                                            {t('review_btn')}
                                        </Button>
                                    </div>
                                ))}
                                {pendingDoctors.length > 3 && (
                                    <div className="text-center pt-2">
                                        <button onClick={() => setActiveTab('doctors')} className="text-xs text-slate-400 hover:text-white transition-colors">
                                            + {pendingDoctors.length - 3} more
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    <Card className="bg-slate-900/80 border-white/5 h-48 relative overflow-hidden flex items-center justify-center">
                         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black text-white">{Math.round((recoveredUsers.length / (normalUsers.length || 1)) * 100)}%</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Recovery Rate</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
```
---

### File: `views\admin\AdminUsers.tsx`
```tsx
import React, { useState } from 'react';
import { Search, Ban, Trash2, User, Shield, Stethoscope, Mail, CheckCircle, XCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button'; // استخدام الزر الموحد
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminUsersProps {
    users: UserProfile[];
    toggleBan: (user: UserProfile) => void;
    deleteUser: (uid: string) => void;
}

export const AdminUsers = ({ users, toggleBan, deleteUser }: AdminUsersProps) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState("");

    // تصفية المستخدمين (نستبعد الأطباء والأدمن لعرض المستخدمين العاديين فقط)
    const normalUsers = users.filter(u => u.role === 'normal_user' || u.role === 'patient');

    // فلترة البحث
    const filteredUsers = normalUsers.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* شريط البحث المتطور */}
            <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
                    <div className="p-3 bg-slate-800 rounded-xl text-slate-400">
                        <Search size={20} />
                    </div>
                    <input 
                        className="w-full bg-transparent border-none text-white px-4 py-2 outline-none placeholder-slate-500 font-medium"
                        placeholder={t('search_user_placeholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="px-4 text-xs text-slate-500 font-bold uppercase tracking-wider hidden md:block">
                        {filteredUsers.length} Users Found
                    </div>
                </div>
            </div>

            {/* شبكة المستخدمين */}
            {filteredUsers.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
                    <User size={48} className="mx-auto mb-4 opacity-20"/>
                    <p>No users found matching "{searchTerm}"</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredUsers.map(user => (
                        <div key={user.uid} className="group relative bg-slate-900/60 border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 hover:bg-slate-900/90 transition-all duration-300 overflow-hidden shadow-lg">
                            {/* زخرفة خلفية */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
                            
                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl border shadow-inner transition-transform group-hover:scale-105 ${user.isBanned ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-slate-800 text-slate-300 border-white/5'}`}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                            {user.name}
                                            {user.isBanned && <Badge color="red" className="!py-0 !px-1.5 text-[9px]">BANNED</Badge>}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge color={user.role === 'patient' ? 'indigo' : 'blue'} className="bg-slate-950/50 border-white/5 shadow-none">
                                                {user.role === 'patient' ? 'Patient' : 'User'}
                                            </Badge>
                                            {user.planType && (
                                                <span className="text-[10px] text-slate-500 bg-slate-950/30 px-2 py-0.5 rounded border border-white/5">
                                                    {user.planType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 relative z-10">
                                <div className="flex items-center gap-3 text-sm text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                                    <Mail size={14} className="text-slate-500"/> 
                                    <span className="truncate">{user.email}</span>
                                </div>
                                {user.patientData?.assignedDoctorName ? (
                                    <div className="flex items-center gap-3 text-sm text-indigo-300 bg-indigo-900/10 p-3 rounded-xl border border-indigo-500/10">
                                        <Stethoscope size={14}/> 
                                        <span>Dr. {user.patientData.assignedDoctorName}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-950/40 p-3 rounded-xl border border-white/5 border-dashed">
                                        <Shield size={14}/> 
                                        <span>No Doctor Assigned</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 relative z-10 pt-2 border-t border-white/5">
                                <button 
                                    onClick={() => toggleBan(user)} 
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                        user.isBanned 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' 
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500 hover:text-white'
                                    }`}
                                >
                                    {user.isBanned ? <CheckCircle size={14}/> : <Ban size={14}/>}
                                    {user.isBanned ? t('unban_user') : t('ban_user')}
                                </button>
                                
                                <button 
                                    onClick={() => user.uid && deleteUser(user.uid)} 
                                    className="flex-none p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                                    title={t('delete_user')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
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
```
---

### File: `views\dashboard\DashboardCharts.tsx`
```tsx
import React from 'react';
import { FlaskConical, Clock, Info, ShieldCheck, BrainCircuit } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
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

    // تجهيز البيانات للرسم البياني (فقط أول 14 يوم أو حسب المتوفر)
    const chartData = plan.slice(0, 30).map(p => ({
        date: p.date.slice(5), // MM-DD
        dose: p.plannedDose
    }));

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            
            {/* بطاقة معلومات الخطة */}
            <Card className="flex flex-col items-center justify-center text-center py-10 border-white/10 relative overflow-hidden group">
                 {/* خلفية جمالية */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors duration-500"></div>
                 
                 <div className="w-20 h-20 rounded-3xl bg-slate-900/80 border border-white/5 flex items-center justify-center mb-6 relative shadow-2xl shadow-black/50 group-hover:scale-110 transition-transform duration-500">
                     <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     {isLiquid ? (
                        <FlaskConical className="w-8 h-8 text-indigo-400 relative z-10" />
                     ) : (
                        <Clock className="w-8 h-8 text-indigo-400 relative z-10" />
                     )}
                 </div>
                 
                 {isPatient ? (
                     <div className="relative z-10 px-6">
                        <h3 className="text-white font-bold text-lg mb-2">خطة طبية معتمدة</h3>
                        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-4 bg-slate-950/50 py-2 px-4 rounded-xl border border-white/5">
                            <ShieldCheck size={16} className="text-emerald-500"/>
                            <span>إشراف د. {doctorName}</span>
                        </div>
                        <Badge color="indigo" className="mx-auto">Fixed Plan</Badge>
                     </div>
                 ) : (
                     <div className="relative z-10 px-6">
                        <h3 className="text-white font-bold text-lg mb-2 flex items-center justify-center gap-2">
                            {t('algo_active')} <BrainCircuit size={18} className="text-amber-400"/>
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto mb-4">
                          {t('algo_desc')}
                        </p>
                        <Badge color="emerald">Smart Engine v2.0</Badge>
                     </div>
                 )}
            </Card>

            {/* الرسم البياني للتوقعات */}
            <Card className="min-h-[280px] relative overflow-hidden border-white/10" noPadding>
                <div className="p-6 pb-0 relative z-10 flex justify-between items-start">
                   <div>
                       <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                           {t('recovery_path')} <Info size={14} className="text-slate-500 hover:text-white transition-colors cursor-help"/>
                       </h2>
                       <p className="text-[10px] text-indigo-300/60 uppercase tracking-widest font-bold">Projection 30 Days</p>
                   </div>
                </div>
                
                <div className="absolute inset-x-0 bottom-0 top-16">
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
                            formatter={(val) => [`${val} mg`, 'الجرعة']}
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
        // استخدام البطاقة مع خلفية مخصصة وتأثيرات بصرية
        <Card className="lg:col-span-8 min-h-[550px] flex flex-col relative overflow-hidden group border-white/10 shadow-2xl shadow-indigo-900/10" noPadding>
            
            {/* 1. خلفية متدرجة داكنة وهادئة */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b] opacity-90"></div>
            
            {/* 2. تأثير إضاءة محيطية (Ambient Light) خلف النص */}
            <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse-glow pointer-events-none"></div>

            <div className="relative z-10 p-8 md:p-12 flex flex-col h-full justify-between">
                {/* القسم العلوي: الجرعة والعداد */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> {t('target_dose')}
                        </h2>
                        <div className="flex items-baseline gap-2 cursor-default select-none">
                            {/* رقم الجرعة بتدرج لوني (Gradient Text) */}
                            <span className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter drop-shadow-xl transition-all duration-500 hover:to-indigo-200">
                                {todayPlan ? todayPlan.plannedDose : 0}
                            </span>
                            <span className="text-2xl text-slate-500 font-bold mb-4">{unitLabel}</span>
                        </div>
                    </div>

                    {/* عداد التقدم الدائري */}
                    <div className="hidden md:block scale-110 relative">
                        {/* توهج خلف العداد */}
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                        <ProgressRing 
                            radius={70} 
                            stroke={8} 
                            progress={progressPercentage} 
                            totalSteps={totalDays - daysCompleted} 
                        />
                    </div>
                </div>

                {/* القسم السفلي: إما رسالة النجاح أو نموذج التسجيل */}
                {todayLog ? (
                    // حالة النجاح (تم التوثيق) - بطاقة زجاجية خضراء
                    <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl flex items-center justify-between backdrop-blur-md animate-in slide-in-from-bottom-4 shadow-lg shadow-emerald-900/10">
                        <div>
                            <p className="text-emerald-400 font-bold text-2xl mb-2 flex items-center gap-2">
                                {t('documented')} <span className="text-2xl">🎉</span>
                            </p>
                            <div className="space-y-1 text-sm">
                                <p className="text-slate-400 font-medium">{t('dose')}: <span className="text-white font-mono font-bold">{todayLog.doseTaken}{unitLabel}</span></p>
                                <p className="text-slate-400 font-medium">{t('mood')}: <span className="text-white">{todayLog.mood === 'good' ? t('excellent') : todayLog.mood === 'normal' ? t('stable') : t('bad')}</span></p>
                            </div>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-full flex items-center justify-center ring-1 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-pulse-glow">
                            <CheckCircle className="text-emerald-500 w-8 h-8" />
                        </div>
                    </div>
                ) : (
                    // نموذج التسجيل (يتم تمريره كـ children)
                    <div className="mt-8 animate-in slide-in-from-bottom-2">
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
import { UserProfile, Article } from '../types';
import { Activity, Users, FileText, Stethoscope, MessageSquareWarning, X, Trash2, ShieldAlert } from 'lucide-react';

// المكونات الأساسية
import { LayoutContainer } from '../components/ui/LayoutContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

// المكونات الفرعية
import { AdminOverview } from './admin/AdminOverview';
import { AdminDoctors } from './admin/AdminDoctors';
import { AdminUsers } from './admin/AdminUsers';
import { AdminCMS } from './admin/AdminCMS';

import { useLanguage } from '../contexts/LanguageContext';

export const AdminView = () => {
    const { t, language } = useLanguage();

    // -- Global State --
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'users' | 'cms'>('overview');
    const [loading, setLoading] = useState(false);
    
    // -- Data Stores --
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);

    // -- Modals State --
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

    // -- ACTIONS --
    
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

    const toggleBan = async (user: UserProfile) => {
        if (!user.uid) return;
        const newVal = !user.isBanned;
        if(confirm(newVal ? "Ban this user?" : "Unban this user?")) {
            await updateDoc(doc(db, "users", user.uid), { isBanned: newVal });
        }
    };

    const deleteUser = async (targetUid: string) => {
        if (!confirm("Warning: This will permanently delete the user and all their data. Continue?")) return;
        try {
            await deleteDoc(doc(db, "users", targetUid));
            if (selectedDoctor?.uid === targetUid) setSelectedDoctor(null);
        } catch (e) {
            console.error("Error deleting user:", e);
            alert("Failed to delete user.");
        }
    };

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
            <div className="relative">
                {/* خلفية جمالية خاصة بالأدمن */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                <PageHeader title={t('admin_title')} subtitle={t('admin_subtitle')} />
            </div>

            {/* Navigation Tabs - Glass Floating Style */}
            <div className="flex p-1.5 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 mb-8 w-full overflow-x-auto scrollbar-hide shadow-2xl relative z-10">
                {[
                    { id: 'overview', icon: Activity, label: t('tab_overview') },
                    { id: 'doctors', icon: Stethoscope, label: t('tab_doctors') },
                    { id: 'users', icon: Users, label: t('tab_users') },
                    { id: 'cms', icon: FileText, label: t('tab_cms') },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap min-w-[120px] ${
                            activeTab === tab.id 
                            ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/20' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {tab.id === 'doctors' && pendingDoctorsCount > 0 && (
                             <span className="ml-2 bg-white text-rose-600 text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">{pendingDoctorsCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content Area - with Fade In */}
            <div className="animate-in slide-in-from-bottom-4 relative z-10">
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
            </div>

            {/* --- SHARED MODALS (GLASS STYLE) --- */}

            {/* DOCTOR DETAILS MODAL */}
            {selectedDoctor && !showRejectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in">
                    <Card className="w-full max-w-lg !bg-slate-900 border-white/10 shadow-2xl relative rounded-[2.5rem] overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-600/20 to-transparent"></div>
                        <button onClick={() => setSelectedDoctor(null)} className="absolute top-4 right-4 p-2 bg-slate-800/50 rounded-full text-slate-400 hover:text-white z-20 backdrop-blur-md hover:bg-slate-700 transition-colors"><X size={20}/></button>
                        
                        <div className="text-center pt-8 pb-6 relative z-10">
                            <div className="w-28 h-28 mx-auto mb-4 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl">
                                {selectedDoctor.doctorData?.photoUrl ? (
                                    <img src={selectedDoctor.doctorData.photoUrl} alt="Dr" className="w-full h-full rounded-full object-cover border-4 border-slate-900" />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500 border-4 border-slate-900">Dr</div>
                                )}
                            </div>
                            <h2 className="text-2xl font-black text-white">{selectedDoctor.name}</h2>
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
                                         <Trash2 size={18} className="mr-2"/> Terminate Account
                                     </Button>
                                 </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* REJECTION REASON MODAL */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in">
                    <Card className="w-full max-w-md !bg-slate-900 border-rose-500/30 shadow-2xl relative rounded-[2rem] overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <ShieldAlert className="text-rose-500" /> سبب الرفض
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">يرجى توضيح سبب رفض طلب الطبيب ليتمكن من تصحيحه.</p>
                            
                            <textarea 
                                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none h-32 resize-none transition-all placeholder-slate-700"
                                placeholder="مثال: رقم الترخيص غير واضح، البيانات ناقصة..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                            
                            <div className="flex gap-3 mt-6">
                                <Button onClick={() => setShowRejectModal(false)} variant="secondary" className="flex-1">إلغاء</Button>
                                <Button onClick={confirmReject} variant="danger" className="flex-1 shadow-lg shadow-rose-500/20">تأكيد الرفض</Button>
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

### File: `views\ArticlesView.tsx`
```tsx
import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Article, UserProfile, ArticleCategory } from '../types';
import { BookOpen, Lightbulb, Heart, Stethoscope, X, ArrowRight, Plus, PenTool, Sparkles } from 'lucide-react';

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

    const getCategoryGradient = (cat: string) => {
        switch(cat) {
            case 'medical': return 'from-indigo-500/20 to-blue-500/20 hover:from-indigo-500/30 hover:to-blue-500/30';
            case 'motivation': return 'from-rose-500/20 to-pink-500/20 hover:from-rose-500/30 hover:to-pink-500/30';
            default: return 'from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30';
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
                        <Button onClick={() => setShowCreateModal(true)} variant="primary" className="!rounded-xl shadow-indigo-500/20">
                            <PenTool size={18} /> {t('new_article_btn')}
                        </Button>
                    )
                }
            />

            {/* Category Filters */}
            <div className="flex gap-3 overflow-x-auto pb-6 mb-2 scrollbar-hide">
                {[
                    { id: 'all', label: t('cat_all'), icon: BookOpen },
                    { id: 'medical', label: t('cat_medical'), icon: Stethoscope },
                    { id: 'motivation', label: t('cat_motivation'), icon: Heart },
                    { id: 'tip', label: t('cat_tip'), icon: Lightbulb },
                ].map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as any)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border backdrop-blur-md ${
                            selectedCategory === cat.id 
                            ? 'bg-white text-slate-900 border-white shadow-lg shadow-white/20 scale-105' 
                            : 'bg-slate-900/40 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                        }`}
                    >
                        <cat.icon size={18} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Articles Grid */}
            {loading ? (
                <div className="text-center py-24 text-indigo-400 animate-pulse flex flex-col items-center">
                    <Sparkles className="w-10 h-10 mb-4 animate-spin-slow"/>
                    <span className="font-bold tracking-widest text-sm">جاري تحميل المحتوى...</span>
                </div>
            ) : filteredArticles.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/40 rounded-[2.5rem] border border-dashed border-slate-800 backdrop-blur-sm">
                    <BookOpen size={48} className="mx-auto text-slate-700 mb-4"/>
                    <p className="text-slate-500">{language === 'ar' ? 'لا توجد مقالات هنا.' : 'No articles found.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map(article => (
                        <div 
                            key={article.id}
                            onClick={() => setReadingArticle(article)}
                            className={`group rounded-[2rem] p-6 cursor-pointer flex flex-col h-full relative overflow-hidden transition-all duration-300 hover:-translate-y-2 border border-white/5 bg-gradient-to-br ${getCategoryGradient(article.category)}`}
                        >
                            <div className="mb-4 relative z-10">
                                <Badge color={getCategoryColor(article.category) as any} className="mb-4 w-fit flex items-center gap-1.5 !text-[10px] !py-1 !px-2.5 shadow-none bg-black/20 border-transparent">
                                    {getCategoryIcon(article.category)} {article.category.toUpperCase()}
                                </Badge>
                                <h3 className="text-xl font-bold text-white leading-snug group-hover:text-white/90 transition-colors line-clamp-2">
                                    {article.title}
                                </h3>
                            </div>
                            
                            <p className="text-white/60 text-sm line-clamp-3 mb-6 flex-1 font-medium leading-relaxed">
                                {article.content}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10 relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                                        {article.authorName} {article.authorRole === 'doctor' && '(Dr)'}
                                    </span>
                                    <span className="text-[10px] text-white/40 font-mono">
                                        {new Date(article.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-all">
                                    <ArrowRight size={14} className={language === 'ar' ? 'rotate-180' : ''}/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Article Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-2xl bg-slate-900 border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors"><X size={20}/></button>
                        
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400"><PenTool size={20}/></div>
                            {t('new_article_btn')}
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('article_title_label')}</label>
                                <input 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-all placeholder-slate-700"
                                    value={newArticle.title}
                                    onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                                    placeholder="عنوان جذاب..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('article_cat_label')}</label>
                                <div className="flex gap-2">
                                    {[
                                        { id: 'medical', label: t('cat_medical'), color: 'indigo' },
                                        { id: 'motivation', label: t('cat_motivation'), color: 'rose' },
                                        { id: 'tip', label: t('cat_tip'), color: 'amber' },
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setNewArticle({...newArticle, category: cat.id as ArticleCategory})}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
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
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('article_content_label')}</label>
                                <textarea 
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-white/10 shadow-2xl relative overflow-hidden rounded-[2.5rem]">
                        {/* Modal Header */}
                        <div className={`p-8 md:p-10 border-b border-white/5 relative bg-gradient-to-br ${getCategoryGradient(readingArticle.category)}`}>
                            <button 
                                onClick={() => setReadingArticle(null)}
                                className="absolute top-6 left-6 p-2 bg-black/20 rounded-full text-white/70 hover:text-white transition-colors backdrop-blur-md"
                            >
                                <X size={20} />
                            </button>
                            
                            <Badge color={getCategoryColor(readingArticle.category) as any} className="mb-4 bg-black/20 border-transparent text-white shadow-none">
                                {readingArticle.category.toUpperCase()}
                            </Badge>
                            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 drop-shadow-lg">
                                {readingArticle.title}
                            </h2>
                            <div className="flex items-center gap-4 text-xs text-white/60 font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                                        {readingArticle.authorName.charAt(0)}
                                    </div>
                                    <span>{readingArticle.authorName}</span>
                                </div>
                                <span>•</span>
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
import React from 'react';
import { Check, X, Stethoscope, BrainCircuit, Calendar as CalendarIcon } from 'lucide-react';

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

    // 1. ضبط بداية الشهر
    const startDate = new Date(plan[0]?.date || new Date());
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
          
          {/* Legend (مفتاح الخريطة) - تصميم جديد */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
              <div className="flex gap-4 text-[10px] md:text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> {language === 'ar' ? 'تم' : 'Done'}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span> {language === 'ar' ? 'تجاوز' : 'Over'}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span> {language === 'ar' ? 'اليوم' : 'Today'}
                  </div>
              </div>
              
              <div className="text-slate-500 text-xs flex items-center gap-2">
                  <CalendarIcon size={14}/> {new Date().toLocaleDateString(language, { month: 'long', year: 'numeric' })}
              </div>
          </div>

          {/* ترويسة أيام الأسبوع */}
          <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4" dir={dir}>
            {weekDays.map(d => (
              <div key={d} className="text-center text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-wider py-2">
                  {d}
              </div>
            ))}
          </div>

          {/* شبكة الأيام */}
          <div className="grid grid-cols-7 gap-2 md:gap-4" dir={dir}>
            {/* الأيام الفارغة */}
            {blanks.map((_, i) => <div key={`blank-${i}`} className="min-h-[80px] md:min-h-[120px]" />)}

            {plan.map((day, idx) => {
              const isToday = day.date === todayDate;
              const log = logs.find(l => l.date === day.date);
              const isPast = day.date < todayDate;
              
              // تحديد الستايل بناءً على الحالة
              let containerClass = "bg-slate-900/40 border-white/5 text-slate-500";
              let statusGlow = "";

              if (isToday) {
                  containerClass = "bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10 scale-105 z-10";
                  statusGlow = "shadow-[0_0_15px_rgba(99,102,241,0.3)]";
              } else if (log) {
                  if (log.doseTaken <= day.plannedDose) { 
                      containerClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-100 hover:bg-emerald-500/20";
                  } else { 
                      containerClass = "bg-rose-500/10 border-rose-500/20 text-rose-100 hover:bg-rose-500/20";
                  }
              } else if (isPast) {
                  containerClass = "bg-slate-950/20 border-white/5 opacity-60 grayscale border-dashed";
              }

              return (
                <div 
                    key={idx} 
                    className={`
                        relative rounded-2xl p-2 md:p-3 min-h-[80px] md:min-h-[120px] flex flex-col justify-between 
                        transition-all duration-300 border backdrop-blur-sm group hover:scale-[1.02]
                        ${containerClass} ${statusGlow}
                    `}
                >
                   {/* رأس الخلية: التاريخ */}
                   <div className="flex justify-between items-start">
                        <span className={`text-[10px] md:text-sm font-bold opacity-70`}>
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
                  
                  {/* محتوى الخلية: الجرعة */}
                  <div className="text-center my-1 md:my-2">
                    <span className={`text-lg md:text-3xl font-black tracking-tight ${isToday ? 'text-white' : ''}`}>
                      {day.plannedDose}
                    </span>
                    <span className="text-[8px] md:text-[10px] block uppercase font-bold opacity-60">
                        {unitLabel}
                    </span>
                  </div>

                  {/* ذيل الخلية: شريط الحالة */}
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                      {log ? (
                          <div className={`h-full w-full ${
                              log.mood === 'good' ? 'bg-emerald-400' : 
                              log.mood === 'bad' ? 'bg-rose-400' : 'bg-amber-400'
                          }`}></div>
                      ) : isPast ? (
                          <div className="h-full w-full bg-rose-900/50"></div>
                      ) : (
                          <div className="h-full w-1/3 bg-slate-600 rounded-full opacity-20"></div>
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
    ShieldCheck, Pill, FlaskConical, Zap, Stethoscope, Lock, ChevronLeft, Medal, Sparkles
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
    const { t, language, dir } = useLanguage();
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
            const q = query(collection(db, "users"), orderBy("progress", "desc"), limit(50)); // Increased limit
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const u: UserProfile[] = [];
                snapshot.forEach((doc) => u.push({ ...doc.data(), uid: doc.id } as UserProfile));
                setLeaderboard(u);
            });
            return () => unsubscribe();
        }
    }, [tab]);

    // 3. Fetch Messages
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
            creatorName: currentUser.name || "Unknown Doctor",
            language: 'mixed',
            createdAt: Date.now(),
            isDoctorRoom: isDoctor,
            doctorId: isDoctor ? currentUser.uid : null
        });
        setNewRoomName("");
        setShowCreateModal(false);
    };

    const deleteRoom = async (roomId: string) => {
        if (confirm("Are you sure?")) {
            await deleteDoc(doc(db, "rooms", roomId));
            if (activeRoom?.id === roomId) setActiveRoom(null);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeRoom || !currentUser.uid) return;
        await addDoc(collection(db, "rooms", activeRoom.id, "messages"), {
            text: newMessage,
            senderId: currentUser.uid,
            senderName: currentUser.name || "Anonymous",
            timestamp: Date.now(),
            role: currentUser.role,
            isDoctor: currentUser.role === 'doctor',
            isAdmin: currentUser.role === 'admin'
        });
        setNewMessage("");
    };

    const canCreateRoom = currentUser.role !== 'patient';

    return (
        <LayoutContainer className="h-[calc(100vh-140px)] flex flex-col relative">
            
            {/* Tabs Navigation (Floating Island Style) */}
            {!activeRoom && (
                <div className="flex p-1.5 bg-slate-900/80 rounded-full border border-white/10 mb-8 shrink-0 backdrop-blur-xl shadow-2xl w-fit mx-auto relative z-10">
                    <button 
                        onClick={() => setTab('rooms')} 
                        className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all duration-500 ${tab === 'rooms' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/40 scale-105' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <MessageCircle size={18} /> {t('comm_rooms')}
                    </button>
                    <button 
                        onClick={() => setTab('leaderboard')} 
                        className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all duration-500 ${tab === 'leaderboard' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/40 scale-105' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Trophy size={18} /> {t('comm_leaderboard')}
                    </button>
                </div>
            )}

            {/* LEADERBOARD TAB */}
            {tab === 'leaderboard' && !activeRoom && (
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 space-y-4 animate-in slide-in-from-bottom-8">
                    {leaderboard.map((user, idx) => {
                        let rankStyle = 'bg-slate-900/60 border-white/5';
                        let rankBadge = null;
                        let progressColor = 'bg-slate-700';
                        let nameColor = 'text-white';
                        
                        // Top 3 Styling
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
                            <div key={idx} className={`flex items-center justify-between p-4 rounded-3xl border backdrop-blur-md transition-all hover:scale-[1.01] hover:bg-white/5 ${rankStyle}`}>
                                <div className="flex items-center gap-5">
                                    {/* Rank Indicator */}
                                    <div className="shrink-0">
                                        {rankBadge}
                                    </div>
                                    
                                    {/* User Info */}
                                    <div>
                                        <p className={`font-bold text-lg flex items-center gap-2 ${nameColor}`}>
                                            {user.name || t('guest')}
                                            {user.role === 'admin' && <ShieldCheck size={16} className="text-rose-500" />}
                                            {user.role === 'doctor' && <Stethoscope size={16} className="text-blue-400" />}
                                            {idx === 0 && <Sparkles size={14} className="text-yellow-400 animate-pulse"/>}
                                        </p>
                                        
                                        {/* Progress Bar Visual */}
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${progressColor}`} style={{width: `${user.progress || 0}%`}}></div>
                                            </div>
                                            <div className="flex gap-2">
                                                {user.medType && (
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md">
                                                        <MedIcon size={10} /> {user.medType}
                                                    </span>
                                                )}
                                                {user.streak && (
                                                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/10">
                                                        <Zap size={10} fill="currentColor" /> {user.streak} Days
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Percentage */}
                                <div className="text-right">
                                    <span className="text-2xl font-black text-white">{Math.round(user.progress || 0)}<span className="text-sm text-slate-500 ml-0.5">%</span></span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ROOMS TAB (Cards) */}
            {tab === 'rooms' && !activeRoom && (
                <div className="flex-1 flex flex-col h-full overflow-hidden animate-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-6 shrink-0 px-1">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Globe size={20} className="text-indigo-400"/> 
                            {currentUser.role === 'patient' ? "Your Clinic" : t('comm_rooms')}
                        </h2>
                        {canCreateRoom && (
                            <Button variant="success" onClick={() => setShowCreateModal(true)} className="!py-2 !px-4 !text-xs !rounded-xl shadow-emerald-500/20">
                                <Plus size={16} /> {t('create_room')}
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-20 custom-scrollbar pr-1">
                        {rooms.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-slate-900/30 rounded-[2.5rem] border border-dashed border-slate-800 text-slate-500 flex flex-col items-center">
                                <MessageCircle size={48} className="mb-4 opacity-20"/>
                                <p>No rooms available at the moment.</p>
                            </div>
                        )}
                        {rooms.map(room => (
                            <Card 
                                key={room.id} 
                                hoverEffect={true}
                                className={`!p-0 cursor-pointer flex flex-col justify-between min-h-[140px] border-white/5 relative group ${room.isDoctorRoom ? 'bg-gradient-to-br from-indigo-900/40 to-slate-900/80' : 'bg-slate-900/60'}`}
                            >
                                <div className="absolute inset-0 z-20" onClick={() => setActiveRoom(room)}></div>
                                
                                {/* Decor */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>

                                <div className="p-6 flex flex-col h-full justify-between relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${room.isDoctorRoom ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-400 border border-white/5'}`}>
                                            {room.isDoctorRoom ? <Stethoscope size={24} /> : <MessageCircle size={24} />}
                                        </div>
                                        
                                        {(currentUser.uid === room.createdBy || currentUser.role === 'admin') && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                                                className="p-2 hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 rounded-lg transition-colors z-30"
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
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
                            <Card className="w-full max-w-sm bg-slate-900 border-white/10 shadow-2xl relative">
                                <h3 className="text-lg font-bold text-white mb-6">
                                    {currentUser.role === 'doctor' ? t('community_clinic') : t('create_room')}
                                </h3>
                                <input 
                                    className="w-full bg-slate-950 p-4 rounded-xl border border-white/10 text-white mb-6 outline-none focus:border-indigo-500 transition-all placeholder-slate-700"
                                    placeholder={t('room_name')}
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    autoFocus
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
                                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>{t('close')}</Button>
                                    <Button variant="primary" onClick={createRoom}>{t('create_room')}</Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* CHAT INTERFACE (Modern Message Bubbles) */}
            {tab === 'rooms' && activeRoom && (
                <div className="flex-1 flex flex-col h-full bg-slate-900/80 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative animate-in zoom-in backdrop-blur-xl">
                    
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/50 backdrop-blur-md absolute top-0 left-0 right-0 z-20">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setActiveRoom(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors md:hidden">
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
                    <div className="flex-1 overflow-y-auto p-4 pt-24 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
                        {messages.map((msg, i) => {
                            const isMe = msg.senderId === currentUser.uid;
                            const showAvatar = i === 0 || messages[i-1].senderId !== msg.senderId;
                            
                            // أنماط الرسائل الحديثة
                            let bubbleStyle = 'bg-slate-800/80 text-slate-200 border-white/5';
                            if (isMe) bubbleStyle = 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border-indigo-500';
                            else if (msg.isDoctor || msg.role === 'doctor') bubbleStyle = 'bg-gradient-to-br from-blue-900/90 to-blue-800/90 border-blue-500/30 text-blue-100 shadow-lg';
                            else if (msg.isAdmin || msg.role === 'admin') bubbleStyle = 'bg-gradient-to-br from-rose-900/90 to-rose-800/90 border-rose-500/30 text-rose-100 shadow-lg';

                            return (
                                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border border-white/10 shadow-md ${showAvatar ? (isMe ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400') : 'opacity-0'}`}>
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

                    {/* Input Area */}
                    <div className="p-4 bg-slate-950/80 border-t border-white/5 flex gap-3 backdrop-blur-xl relative z-20">
                        <input 
                            className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all placeholder-slate-600 shadow-inner"
                            placeholder={t('type_msg')}
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        />
                        <button 
                            onClick={sendMessage} 
                            disabled={!newMessage.trim()}
                            className="p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 active:scale-95"
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
import { AlertTriangle, HeartPulse, FileText, PauseCircle, Stethoscope, Shield } from 'lucide-react';

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
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // هل المستخدم يتبع طبيباً؟
  const isPatient = userProfile?.role === 'patient';
  const isManualPlan = userProfile?.planType === 'manual';
  const doctorName = userProfile?.patientData?.assignedDoctorName;

  return (
    <LayoutContainer>
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
            <div className="flex flex-wrap gap-3 items-center">
                <div className="hidden md:block"><LanguageSwitcher /></div>
                
                <Button onClick={() => setIsReportOpen(true)} variant="secondary" className="!py-2.5 !px-5 !text-xs !rounded-xl shadow-lg hover:shadow-white/5 border-white/10">
                    <FileText size={16} className="mr-2" /> {t('export_report')}
                </Button>
                
                <Button variant="panic" onClick={() => setIsSosOpen(true)} className="!py-2.5 !px-5 !text-xs !rounded-xl shadow-rose-500/20">
                    <HeartPulse size={16} className="mr-2 animate-pulse" /> {t('sos_button')}
                </Button>
            </div>
        }
      />

      {/* 1. لافتة المريض (تظهر فقط للمرضى المرتبطين بأطباء) */}
      {isPatient && (
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-indigo-500/20 p-5 rounded-3xl flex items-center justify-between mb-8 backdrop-blur-xl shadow-lg animate-in slide-in-from-top-2 group">
              <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
              <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                      <Stethoscope size={28} />
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

      {/* 2. تحذير الأمان (Safety Guard) */}
      {showDoctorWarning && !isManualPlan && (
        <div className="relative overflow-hidden bg-rose-950/40 border border-rose-500/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl shadow-2xl shadow-rose-900/20 animate-in zoom-in duration-500 mb-8">
          <div className="absolute inset-0 bg-rose-500/5 animate-pulse"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="bg-rose-500/20 p-4 rounded-2xl border border-rose-500/30 shadow-inner">
                <AlertTriangle className="text-rose-500 w-8 h-8" />
            </div>
            <div>
                <h3 className="font-bold text-rose-200 text-xl mb-1 flex items-center gap-2">
                    {t('safety_active')} <Shield size={18} className="text-rose-400"/>
                </h3>
                <p className="text-rose-300/70 text-sm max-w-lg leading-relaxed">{t('safety_desc')}</p>
            </div>
          </div>
          <Button onClick={handleFreezePlan} variant="danger" className="w-full md:w-auto !py-3 !px-6 relative z-10 shadow-lg shadow-rose-600/20 hover:shadow-rose-600/40">
             <PauseCircle size={20} className="mr-2" /> {t('freeze_plan_btn')}
          </Button>
        </div>
      )}

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
    ChevronRight, Save, AlertCircle, Copy, Repeat, Eraser, Stethoscope, LineChart
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid 
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
    const { t } = useLanguage();
    
    // -- State --
    const [loading, setLoading] = useState(true);
    const [doctorProfile, setDoctorProfile] = useState<UserProfile | null>(null);
    const [patients, setPatients] = useState<UserProfile[]>([]);
    const [pendingPatients, setPendingPatients] = useState<UserProfile[]>([]);
    
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

    // -- Actions --
    const handleAddPhase = () => {
        const dose = parseFloat(newDose);
        const days = parseInt(newDays);
        if (!isNaN(dose) && !isNaN(days) && days > 0) {
            setPhases([...phases, { dose, days }]);
            setNewDose(''); 
        }
    };

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
            alert("Failed to save plan.");
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

    if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-400 animate-pulse font-bold tracking-widest">LOADING CLINIC DATA...</div>;

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('nav_dashboard')} 
                subtitle={`Dr. ${doctorProfile?.name || 'Doctor'} - ${doctorProfile?.doctorData?.specialty || ''}`} 
            />

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-in slide-in-from-top-4">
                <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-white/10 p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-wider">{t('stat_total_patients')}</p>
                            <h3 className="text-4xl font-black text-white">{patients.length + pendingPatients.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 border border-blue-500/20"><Users size={24}/></div>
                    </div>
                </Card>
                
                <Card className="bg-gradient-to-br from-amber-900/20 to-slate-900/80 border-amber-500/20 p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-amber-500/80 text-xs font-bold uppercase mb-2 tracking-wider">{t('pending_approvals')}</p>
                            <h3 className="text-4xl font-black text-amber-500">{pendingPatients.length}</h3>
                        </div>
                        <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500 border border-amber-500/20 animate-pulse-glow"><Clock size={24}/></div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-900/20 to-slate-900/80 border-emerald-500/20 p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-emerald-500/80 text-xs font-bold uppercase mb-2 tracking-wider">{t('stat_recovered')}</p>
                            <h3 className="text-4xl font-black text-emerald-500">{patients.filter(p => p.patientData?.isRecovered).length}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-500 border border-emerald-500/20"><CheckCircle size={24}/></div>
                    </div>
                </Card>

                <Card className="bg-slate-900/80 border-white/10 p-6 shadow-xl relative overflow-hidden">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider flex items-center gap-2"><LineChart size={14}/> {t('stat_overview')}</p>
                    <div className="h-16 w-full">
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
            </div>

            {/* PENDING PATIENTS (Waiting for Plan) */}
            {pendingPatients.length > 0 && (
                <div className="mb-8 animate-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <div className="p-2 bg-amber-500/20 rounded-lg"><AlertCircle className="text-amber-500" size={20} /></div>
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
                                    {t('create_plan_btn')} <ChevronRight size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ACTIVE PATIENTS LIST */}
            <Card className="bg-slate-900/60 border-white/10 overflow-hidden backdrop-blur-xl" noPadding>
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg"><Users className="text-indigo-400" size={20} /></div>
                        {t('stat_total_patients')}
                    </h2>
                    <Badge color="indigo">Total: {patients.length}</Badge>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950/80 text-slate-500 uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="p-5">Patient</th>
                                <th className="p-5">Status</th>
                                <th className="p-5">Progress</th>
                                <th className="p-5">Last Active</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {patients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-600 italic flex flex-col items-center justify-center">
                                        <Users size={40} className="mb-4 opacity-20"/>
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
                                            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
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
                                                className="text-xs font-bold text-emerald-400 hover:text-white hover:bg-emerald-500 px-4 py-2 rounded-xl border border-emerald-500/30 hover:border-emerald-500 transition-all shadow-lg shadow-emerald-900/20"
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in">
                    <div className="w-full max-w-5xl bg-slate-900 border border-white/10 shadow-2xl relative max-h-[90vh] flex flex-col rounded-[2.5rem] overflow-hidden">
                        
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 bg-slate-950/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                                    <Stethoscope className="text-indigo-500" size={28}/> {t('create_plan_btn')}
                                </h2>
                                <p className="text-slate-400 flex items-center gap-2">Patient: <Badge color="blue">{selectedPatient.name}</Badge></p>
                            </div>
                            <button type="button" onClick={() => setSelectedPatient(null)} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-slate-900/30">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* LEFT: Pattern Builder (Glass Style) */}
                                <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-3xl shadow-inner">
                                    <h3 className="text-indigo-300 font-bold mb-6 flex items-center gap-2 text-lg">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg"><Repeat size={18}/></div> 
                                        {t('pattern_builder')}
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">{t('pattern_sequence')}</label>
                                            <input 
                                                className="w-full bg-slate-950 border border-indigo-500/30 rounded-xl p-4 text-white font-mono text-sm focus:border-indigo-500 outline-none transition-all placeholder-indigo-900/50"
                                                placeholder="0.5, 1, 0.5, 1"
                                                value={patternSeq}
                                                onChange={e => setPatternSeq(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">{t('repeat_count')}</label>
                                                <input 
                                                    type="number" className="w-full bg-slate-950 border border-indigo-500/30 rounded-xl p-4 text-white font-mono text-sm focus:border-indigo-500 outline-none"
                                                    value={patternRepeat} onChange={e => setPatternRepeat(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">{t('days_per_dose')}</label>
                                                <input 
                                                    type="number" className="w-full bg-slate-950 border border-indigo-500/30 rounded-xl p-4 text-white font-mono text-sm focus:border-indigo-500 outline-none"
                                                    value={patternDaysPerDose} onChange={e => setPatternDaysPerDose(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={handleApplyPattern} className="w-full !py-3 !bg-indigo-600 shadow-lg shadow-indigo-900/40">
                                            <Copy size={16} className="mr-2"/> {t('apply_pattern')}
                                        </Button>
                                    </div>
                                </div>

                                {/* RIGHT: Manual Entry (Glass Style) */}
                                <div className="bg-slate-950/60 border border-white/5 p-6 rounded-3xl">
                                    <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-lg">
                                        <div className="p-2 bg-slate-800 rounded-lg"><Plus size={18}/></div>
                                        Manual Entry
                                    </h3>
                                    <div className="flex gap-4 mb-5">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">{t('dose')}</label>
                                            <input type="number" className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white focus:border-indigo-500 outline-none" value={newDose} onChange={e => setNewDose(e.target.value)}/>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">{t('duration_days')}</label>
                                            <input type="number" className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white focus:border-indigo-500 outline-none" value={newDays} onChange={e => setNewDays(e.target.value)}/>
                                        </div>
                                    </div>
                                    <Button onClick={handleAddPhase} variant="secondary" className="w-full !py-3 !text-xs">Add Single Phase</Button>
                                </div>
                            </div>

                            {/* Phases List */}
                            <div className="bg-slate-950/80 p-6 rounded-3xl border border-white/5">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-white font-bold flex items-center gap-2 text-lg"><Activity size={20} className="text-emerald-400"/> {t('plan_phases')}</h3>
                                    {phases.length > 0 && (
                                        <button onClick={() => setPhases([])} className="text-rose-400 text-xs font-bold flex items-center gap-1 hover:text-rose-300 bg-rose-900/20 px-3 py-1.5 rounded-lg transition-colors border border-rose-500/20">
                                            <Eraser size={14}/> {t('clear_phases')}
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                    {phases.length === 0 && (
                                        <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600">
                                            No phases added yet. Start building the plan above.
                                        </div>
                                    )}
                                    {phases.map((phase, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-white/5 animate-in slide-in-from-right-2 hover:border-indigo-500/30 transition-colors">
                                            <span className="text-white font-bold text-sm flex items-center gap-3">
                                                <span className="bg-slate-800 text-slate-400 w-6 h-6 flex items-center justify-center rounded-full text-[10px]">{idx + 1}</span>
                                                <span className="text-indigo-400 text-xl font-black">{phase.dose} <span className="text-xs font-normal text-indigo-300/60">{selectedPatient.medUnit || 'mg'}</span></span> 
                                                <span className="w-px h-4 bg-slate-700 mx-2"></span>
                                                <span className="text-slate-400 text-xs font-mono">{phase.days} days</span>
                                            </span>
                                            <button type="button" onClick={() => handleRemovePhase(idx)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between text-sm font-bold text-slate-400">
                                    <span>Total Duration: <span className="text-white">{phases.reduce((a,b) => a + b.days, 0)} days</span></span>
                                    <span>Total Phases: <span className="text-white">{phases.length}</span></span>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-1 group-focus-within:text-indigo-400 transition-colors">{t('plan_notes')}</label>
                                <textarea 
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-white h-24 outline-none focus:border-indigo-500 transition-all resize-none"
                                    placeholder="Add instructions or comments for the patient..."
                                    value={doctorNote}
                                    onChange={e => setDoctorNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-slate-950/80 backdrop-blur-md flex justify-end gap-4">
                            <Button variant="secondary" onClick={() => setSelectedPatient(null)}>{t('close')}</Button>
                            <Button variant="success" onClick={saveTreatmentPlan} disabled={phases.length === 0} className="shadow-lg shadow-emerald-500/20">
                                <Save size={18} className="mr-2"/> {t('submit_plan')}
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
import React, { useEffect, useState } from 'react';
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
    const { t } = useLanguage();

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

    const filteredAvailable = availableUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredMyPatients = myPatients.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <LayoutContainer>
            <PageHeader 
                title={t('manage_patients_title')} 
                subtitle="Track progress and manage your clinic."
                action={
                    viewMode === 'LIST' ? (
                        <Button onClick={() => { setViewMode('ADD_NEW'); fetchAvailableUsers(); }} variant="primary" className="!rounded-xl shadow-indigo-500/20">
                            <UserPlus size={18} /> {t('add_patient_btn')}
                        </Button>
                    ) : (
                        <Button onClick={() => setViewMode('LIST')} variant="secondary" className="!rounded-xl">
                            <ChevronLeft size={18} /> {t('back_list_btn')}
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
                            <Search className="text-slate-500 group-focus-within:text-indigo-400" />
                            <input 
                                className="bg-transparent w-full text-white outline-none placeholder-slate-600"
                                placeholder={t('search_available_placeholder')}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {filteredAvailable.map(user => (
                                <div key={user.uid} className="flex justify-between items-center p-5 rounded-2xl border border-white/5 bg-slate-900/40 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all group">
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
                                        <UserPlus size={16} className="mr-2"/> {t('add_btn')}
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
                    <div className="flex p-1.5 bg-slate-900/50 rounded-2xl border border-white/10 mb-8 w-fit backdrop-blur-md">
                        <button 
                            onClick={() => setActiveTab('MY_PATIENTS')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'MY_PATIENTS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {t('stat_total_patients')}
                            <Badge color="blue" className="!py-0 !px-1.5 bg-white/20 text-white border-transparent">{myPatients.length}</Badge>
                        </button>
                        
                        <button 
                            onClick={() => setActiveTab('REQUESTS')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'REQUESTS' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
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
                                            <UserCheck size={16} className="mr-2"/> {t('accept_patient')}
                                        </Button>
                                        <Button onClick={() => handleRejectRequest(patient)} variant="danger" className="flex-1 !py-3 !text-xs shadow-rose-500/10">
                                            <UserX size={16} className="mr-2"/> {t('reject_patient')}
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
                                    className="bg-slate-900/60 border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 hover:bg-slate-900/80 cursor-pointer transition-all group relative overflow-hidden backdrop-blur-md shadow-lg"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
                                    
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in">
                    <div className="w-full max-w-6xl h-[90vh] flex flex-col bg-slate-900 border border-white/10 shadow-2xl relative rounded-[2.5rem] overflow-hidden">
                        
                        {/* Header */}
                        <div className="p-8 bg-slate-950/80 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/30">
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white mb-1">{selectedPatient.name}</h2>
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <FileText size={16} className="text-indigo-400"/> 
                                        <span className="text-white font-bold">{selectedPatient.medType || 'General'}</span> 
                                        <span>•</span>
                                        <span>{selectedPatient.medForm}</span>
                                        <span>•</span>
                                        <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">{selectedPatient.medUnit}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPatient(null)} className="p-3 bg-slate-800/50 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-white/5">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 custom-scrollbar bg-slate-900/30">
                            
                            {/* Charts Area */}
                            <div className="lg:col-span-2 space-y-8">
                                <Card className="bg-slate-900/60 border-white/5 p-6 h-[400px] flex flex-col shadow-inner">
                                    <h3 className="text-white font-bold mb-6 flex items-center gap-3 text-lg">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg"><Activity size={20} className="text-indigo-400"/></div>
                                        Adherence & Dosage
                                    </h3>
                                    <div className="flex-1 w-full">
                                        {patientLogs.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={patientLogs.slice(-30)} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
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
                                             <Moon size={20} className="text-blue-400"/> 
                                             {patientLogs.length > 0 ? (patientLogs.reduce((a,b) => a + (b.sleepHours || 0), 0) / patientLogs.length).toFixed(1) : '-'} <span className="text-sm text-slate-600">h</span>
                                         </span>
                                     </div>
                                     <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/5 text-center shadow-lg">
                                         <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-2">{t('mood')}</span>
                                         <span className="text-xl font-bold text-white flex items-center justify-center gap-2 mt-1">
                                             <Smile size={24} className="text-emerald-400"/> Good
                                         </span>
                                     </div>
                                </div>
                                
                                <Card className="bg-slate-900/60 border-white/5 flex-1 max-h-[500px] overflow-hidden flex flex-col !p-0 shadow-lg">
                                    <div className="p-6 border-b border-white/5 bg-slate-900/40">
                                        <h3 className="text-white font-bold flex items-center gap-3">
                                            <Calendar size={20} className="text-amber-400"/> Recent Logs
                                        </h3>
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar flex-1 p-4 space-y-2">
                                        {patientLogs.slice().reverse().map((log, i) => (
                                            <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-slate-950/50 border border-white/5 text-sm hover:bg-slate-800/50 transition-colors">
                                                <span className="text-slate-400 font-mono">{log.date}</span>
                                                <span className="font-bold text-white text-base">{log.doseTaken} <span className="text-xs text-slate-500 font-normal">{selectedPatient.medUnit}</span></span>
                                                <span>
                                                    {log.mood === 'good' ? <Smile size={18} className="text-emerald-500"/> : 
                                                     log.mood === 'bad' ? <Frown size={18} className="text-rose-500"/> : 
                                                     <Meh size={18} className="text-amber-500"/>}
                                                </span>
                                            </div>
                                        ))}
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
import { Activity, Chrome, LogIn, UserPlus, User, Mail, Lock, Ruler, Weight, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { signupWithEmail } = useAuth(); // استخدام دالة الإنشاء الجديدة من السياق

  // حالة التبديل بين الدخول والتسجيل
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // بيانات التسجيل الإضافية
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp) {
        // منطق إنشاء الحساب
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
        // منطق تسجيل الدخول (الموجود مسبقاً)
        await handleLogin(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden" dir={dir}>
      
      {/* خلفية حية */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-float opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] animate-float opacity-50 delay-1000 pointer-events-none"></div>
      
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-lg relative z-10 !bg-slate-900/70 border-white/10 shadow-2xl backdrop-blur-xl" noPadding>
        <div className="p-8 md:p-10">
            
            {/* الشعار والعنوان */}
            <div className="text-center mb-8">
                <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4 animate-in zoom-in">
                    <Activity className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
                    {isSignUp ? (language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account') : "Islam's Guide"}
                </h1>
                <p className="text-slate-400 font-medium text-sm">
                    {isSignUp 
                        ? (language === 'ar' ? 'ابدأ رحلة التعافي الآمنة اليوم' : 'Start your safe recovery journey today') 
                        : t('subtitle')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* حقول التسجيل الإضافية (تظهر فقط عند isSignUp) */}
                {isSignUp && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4">
                        <div className="relative group">
                            <User className="absolute top-3.5 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                            <input 
                                type="text" 
                                placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:bg-slate-900/80 text-white outline-none transition-all placeholder-slate-600"
                            />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10 text-slate-500"><Calendar size={16}/></div>
                                <input type="number" placeholder={language === 'ar' ? 'العمر' : 'Age'} value={age} onChange={(e) => setAge(e.target.value)} className="w-full pl-10 pr-2 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:border-indigo-500 text-white outline-none text-sm text-center" />
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10 text-slate-500"><Weight size={16}/></div>
                                <input type="number" placeholder={language === 'ar' ? 'وزن (kg)' : 'Weight'} value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full pl-10 pr-2 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:border-indigo-500 text-white outline-none text-sm text-center" />
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10 text-slate-500"><Ruler size={16}/></div>
                                <input type="number" placeholder={language === 'ar' ? 'طول (cm)' : 'Height'} value={height} onChange={(e) => setHeight(e.target.value)} className="w-full pl-10 pr-2 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:border-indigo-500 text-white outline-none text-sm text-center" />
                            </div>
                        </div>
                    </div>
                )}

                {/* الحقول الأساسية (البريد وكلمة المرور) */}
                <div className="space-y-4">
                    <div className="relative group">
                        <Mail className="absolute top-3.5 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                        <input 
                            type="email" 
                            placeholder={t('email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:bg-slate-900/80 text-white outline-none transition-all placeholder-slate-600"
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute top-3.5 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                        <input 
                            type="password" 
                            placeholder={t('password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:bg-slate-900/80 text-white outline-none transition-all placeholder-slate-600"
                        />
                    </div>
                </div>
                
                {/* رسائل الخطأ */}
                {loginError && (
                    <div className="text-rose-400 text-xs bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 flex items-center gap-2 animate-in slide-in-from-top-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> {loginError}
                    </div>
                )}
                
                {/* زر الإرسال الرئيسي */}
                <Button className="w-full py-4 text-lg shadow-lg shadow-indigo-500/20" type="submit" isLoading={isLoading}>
                    {isSignUp 
                        ? (language === 'ar' ? 'إنشاء الحساب' : 'Create Account') 
                        : t('login_email')} 
                    {!isLoading && (isSignUp ? <UserPlus size={18} className="ml-2"/> : <LogIn size={18} className="ml-2"/>)}
                </Button>
            </form>

            {/* الفواصل وأزرار التواصل الاجتماعي */}
            <div className="my-6 flex items-center gap-4 text-xs text-slate-600 font-bold uppercase tracking-widest">
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

            {/* التبديل بين الدخول والتسجيل */}
            <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">
                    {isSignUp ? (language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?') : (language === 'ar' ? 'لا تملك حساباً؟' : "Don't have an account?")}
                    <button 
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            loginError = ''; // محاولة لتصفير الخطأ ظاهرياً
                        }}
                        className="text-indigo-400 font-bold hover:text-indigo-300 ml-2 transition-colors underline decoration-indigo-500/30 underline-offset-4"
                    >
                        {isSignUp ? (language === 'ar' ? 'تسجيل الدخول' : 'Sign In') : (language === 'ar' ? 'انضم إلينا' : 'Sign Up')}
                    </button>
                </p>
            </div>

            {/* زر الديمو */}
            {!isSignUp && (
                <div className="mt-6 pt-6 border-t border-white/5 text-center">
                    <button 
                        onClick={setDemoCreds}
                        className="text-slate-600 text-xs font-mono hover:text-slate-400 transition-colors"
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
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Pill, AlertTriangle, ArrowRight, ArrowLeft, 
  Stethoscope, BrainCircuit, FlaskConical, UserPlus, FileText, MapPin, Phone, Award, Search, User, ChevronRight, Activity
} from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

// المكونات
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
        className="absolute top-6 left-6 z-50 p-3 rounded-full glass hover:bg-white/10 text-slate-400 hover:text-white transition-all shadow-lg"
        disabled={loading}
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
      const plan = generatePlan(totalInventory, currentDoseHabit, new Date().toISOString(), 1.0, [], medForm || 'tablet');
      setPreviewPlan(plan);
      setStep('ALGO_PREVIEW');
      setShowSciModal(true);
  };

  // --- RENDERS ---

  // Wrapper with Ambient Background
  const OnboardingWrapper = ({ children }: { children: React.ReactNode }) => (
      <div className="min-h-screen bg-[#020617] p-6 flex flex-col items-center justify-center relative overflow-hidden" dir={dir}>
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full relative z-10">
                 {/* خيار المريض */}
                 <button onClick={() => setStep('USER_PATH_SELECT')} className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden shadow-2xl">
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="w-16 h-16 bg-indigo-500/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20 border border-indigo-500/30">
                        <UserPlus size={32} className="text-indigo-400"/>
                     </div>
                     <h3 className="text-3xl font-bold text-white mb-3">{t('role_patient')}</h3>
                     <p className="text-slate-400 leading-relaxed text-sm font-medium">{t('role_patient_desc')}</p>
                 </button>
                 
                 {/* خيار الطبيب */}
                 <button onClick={() => setStep('DOCTOR_FORM')} className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden shadow-2xl">
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
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_fullname')}</label>
                          <div className="relative">
                              <User className="absolute top-3.5 right-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                              <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all" placeholder={t('doc_fullname')} value={doctorName} onChange={e => setDoctorName(e.target.value)}/>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="group">
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_specialty')}</label>
                              <div className="relative">
                                  <Award className="absolute top-3.5 right-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                  <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all" placeholder={t('doc_specialty')} value={doctorForm.specialty} onChange={e => setDoctorForm({...doctorForm, specialty: e.target.value})}/>
                              </div>
                          </div>
                          <div className="group">
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_license')}</label>
                              <div className="relative">
                                  <FileText className="absolute top-3.5 right-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                  <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all" placeholder={t('doc_license')} value={doctorForm.licenseNumber} onChange={e => setDoctorForm({...doctorForm, licenseNumber: e.target.value})}/>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="group">
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_location')}</label>
                              <div className="relative">
                                  <MapPin className="absolute top-3.5 right-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                  <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all" placeholder={t('doc_location')} value={doctorForm.clinicLocation} onChange={e => setDoctorForm({...doctorForm, clinicLocation: e.target.value})}/>
                              </div>
                          </div>
                          <div className="group">
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_phone')}</label>
                              <div className="relative">
                                  <Phone className="absolute top-3.5 right-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                  <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all" placeholder="+966..." value={doctorForm.phoneNumber} onChange={e => setDoctorForm({...doctorForm, phoneNumber: e.target.value})}/>
                              </div>
                          </div>
                      </div>

                      <div className="group">
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block group-focus-within:text-indigo-400 transition-colors">{t('doc_bio')}</label>
                          <textarea className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none h-24 resize-none transition-all" placeholder={t('doc_bio')} value={doctorForm.bio} onChange={e => setDoctorForm({...doctorForm, bio: e.target.value})}/>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full relative z-10">
                <button onClick={() => {setMedType(null); setStep('ALGO_SETUP_MED');}} className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20 border border-indigo-500/30">
                        <BrainCircuit size={32} className="text-indigo-400"/>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('path_algo')}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm font-medium">{t('path_algo_desc')}</p>
                </button>
                <button onClick={() => setStep('DOCTOR_SELECT')} className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:border-blue-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden shadow-2xl">
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
                    <Search className="absolute top-1/2 right-6 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20}/>
                    <input className="w-full bg-slate-900/70 border border-white/10 rounded-2xl py-4 px-14 text-white outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all shadow-lg" placeholder={t('doc_search_placeholder')} value={searchDoctor} onChange={e => setSearchDoctor(e.target.value)}/>
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
                                            <img src={doc.doctorData.photoUrl} alt="Dr" className="w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-lg" />
                                        ) : (
                                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 font-bold text-lg border border-indigo-500/20">Dr</div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full relative z-10">
                {[
                    { type: 'narcotic', label: t('med_type_narcotic'), icon: AlertTriangle, color: 'rose', desc: t('med_type_narcotic_desc') }, 
                    { type: 'psychiatric', label: t('med_type_psych'), icon: BrainCircuit, color: 'amber', desc: t('med_type_psych_desc') }, 
                    { type: 'normal', label: t('med_type_normal'), icon: CheckCircle, color: 'emerald', desc: t('med_type_normal_desc') }
                ].map((item: any) => (
                    <button key={item.type} onClick={() => handleMedTypeSelect(item.type)} className={`group relative p-8 rounded-[2.5rem] border border-white/10 bg-slate-900/60 backdrop-blur-md hover:bg-slate-900/80 transition-all text-right overflow-hidden hover:border-${item.color}-500/50 hover:shadow-2xl shadow-lg hover:scale-105 duration-300`}>
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
                <div className="grid grid-cols-2 gap-6 mb-10">
                    <button onClick={() => setMedForm('tablet')} className={`p-8 rounded-3xl border transition-all duration-300 group ${medForm === 'tablet' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/30 scale-105' : 'bg-slate-900/60 border-white/10 text-slate-400 hover:bg-slate-800 hover:border-white/20'}`}>
                        <Pill className={`mx-auto mb-4 w-12 h-12 ${medForm === 'tablet' ? 'text-white' : 'text-indigo-400'}`} />
                        <span className="block font-bold text-xl">{t('form_tablet')}</span>
                    </button>
                    <button onClick={() => setMedForm('liquid')} className={`p-8 rounded-3xl border transition-all duration-300 group ${medForm === 'liquid' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/30 scale-105' : 'bg-slate-900/60 border-white/10 text-slate-400 hover:bg-slate-800 hover:border-white/20'}`}>
                        <FlaskConical className={`mx-auto mb-4 w-12 h-12 ${medForm === 'liquid' ? 'text-white' : 'text-indigo-400'}`} />
                        <span className="block font-bold text-xl">{t('form_liquid')}</span>
                    </button>
                </div>
                
                {medForm && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 mb-10">
                        <h2 className="text-xl font-bold text-white mb-4">{t('unit_title')}</h2>
                        <div className="flex justify-center gap-4">
                            {(medForm === 'tablet' ? ['mg', 'g'] : ['ml', 'l', 'mg']).map((u) => (
                                <button key={u} onClick={() => setMedUnit(u as MedUnit)} className={`px-8 py-4 rounded-2xl font-bold text-lg border transition-all ${medUnit === u ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900/50 border-white/10 text-slate-500 hover:text-white hover:bg-slate-800'}`}>
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
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider group-focus-within:text-indigo-400 transition-colors">{t('boxes')} ({formLabel})</label>
                            <input type="number" className="w-full bg-slate-950/60 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none transition-all text-center" placeholder="0" value={inventory.boxes || ''} onChange={(e) => setInventory({...inventory, boxes: parseInt(e.target.value) || 0})} />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider group-focus-within:text-indigo-400 transition-colors">{t('pills_per_box')}</label>
                            <input type="number" className="w-full bg-slate-950/60 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none transition-all text-center" placeholder="0" value={inventory.pillsPerBox || ''} onChange={(e) => setInventory({...inventory, pillsPerBox: parseInt(e.target.value) || 0})} />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider group-focus-within:text-indigo-400 transition-colors">{t('loose_pills')}</label>
                            <input type="number" className="w-full bg-slate-950/60 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none transition-all text-center" placeholder="0" value={inventory.loosePills || ''} onChange={(e) => setInventory({...inventory, loosePills: parseInt(e.target.value) || 0})} />
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center bg-slate-950/30 -mx-8 -mb-8 p-8 rounded-b-[2.5rem]">
                        <span className="text-slate-400 font-bold text-lg">{t('total_balance')}</span>
                        <span className="text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                            {calculateTotalInventory(inventory)} <span className="text-lg text-slate-500">{unitLabel}</span>
                        </span>
                    </div>
                </Card>
                
                <Card className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Activity className="text-amber-400"/> {t('current_habit')} ({unitLabel})
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {[0.5, 1, 2, 5, 10, 20, 50, 100].map(dose => (
                            <button key={dose} onClick={() => setCurrentDoseHabit(dose)} className={`h-14 min-w-[4rem] px-4 rounded-xl font-mono font-bold border transition-all duration-300 ${currentDoseHabit === dose ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105' : 'bg-slate-950/50 border-white/10 text-slate-500 hover:bg-slate-800 hover:text-white'}`}>{dose}</button>
                        ))}
                        <input 
                            type="number" 
                            placeholder="جرعة أخرى..." 
                            className="h-14 min-w-[8rem] bg-slate-950/50 rounded-xl border border-white/10 px-6 font-mono font-bold text-white focus:border-indigo-500 outline-none transition-all text-center placeholder-slate-600" 
                            onChange={(e) => setCurrentDoseHabit(parseFloat(e.target.value))} 
                        />
                    </div>
                </Card>
                
                <Button className="w-full text-2xl py-6 rounded-3xl shadow-2xl shadow-indigo-500/20 animate-pulse-glow" variant="success" disabled={currentDoseHabit === 0 || calculateTotalInventory(inventory) === 0} onClick={generatePreview}>
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
                <h1 className="text-5xl font-black text-white tracking-tight">تم إنشاء الخطة بنجاح!</h1>
                <p className="text-slate-400 text-xl">بناءً على مخزونك الحالي وجرعتك، هذه هي التوقعات:</p>
                
                <div className="grid grid-cols-2 gap-6">
                    <Card className="text-center border-indigo-500/30 bg-slate-900/80">
                        <div className="text-sm text-indigo-300 font-bold uppercase mb-2 tracking-widest">{t('duration_days')}</div>
                        <div className="text-6xl font-black text-white">{previewPlan.length}</div>
                        <div className="text-xs text-slate-500 mt-2 font-bold">يوم حتى التعافي</div>
                    </Card>
                    <Card className="text-center border-emerald-500/30 bg-slate-900/80">
                        <div className="text-sm text-emerald-300 font-bold uppercase mb-2 tracking-widest">تغطية المخزون</div>
                        <div className="text-6xl font-black text-emerald-400">100%</div>
                        <div className="text-xs text-slate-500 mt-2 font-bold">كافٍ تماماً</div>
                    </Card>
                </div>

                <div className="bg-indigo-600/10 p-6 rounded-3xl border border-indigo-500/20 text-indigo-200 text-sm font-medium leading-relaxed backdrop-blur-md">
                    <p>سيتم الآن نقلك إلى لوحة القيادة المركزية. تذكر أن الالتزام اليومي هو مفتاح النجاح. يمكنك دائماً تعديل سرعة الخطة من الإعدادات إذا شعرت بأي تعب.</p>
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
import React, { useState, useEffect } from 'react';
import { 
    Activity, ShieldCheck, Zap, AlertTriangle, Save, Camera, MapPin, Phone, 
    User, Award, Clock, Package, Pill, RefreshCw, Trash2
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
    const { inventory, setInventory } = useData(); 
    const [loading, setLoading] = useState(false);

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

    // مزامنة المخزون (الحل الذكي لمنع التصفير)
    useEffect(() => {
        if (inventory) {
            setLocalInventory(prev => {
                const isPrevEmpty = prev.boxes === 0 && prev.pillsPerBox === 0 && prev.loosePills === 0;
                if (isPrevEmpty) return inventory;
                return prev;
            });
        }
    }, [inventory]);

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

    const handleUpdateInventory = () => {
        const newTotal = (localInventory.boxes * localInventory.pillsPerBox) + localInventory.loosePills;
        const updatedInv = { ...localInventory, totalPills: newTotal };
        setInventory(updatedInv);
        setLocalInventory(updatedInv); // تأكيد التحديث محلياً
        alert(language === 'ar' ? 'تم تحديث المخزون وإعادة حساب الرصيد.' : 'Inventory updated successfully.');
    };

    // --- واجهة الطبيب (بتصميم جديد) ---
    if (userProfile.role === 'doctor') {
        const level = userProfile.doctorData?.doctorLevel || 1;
        const recovered = userProfile.doctorData?.recoveredCount || 0;
        const active = userProfile.doctorData?.activePatients || 0;

        return (
            <LayoutContainer>
                <PageHeader title={t('profile_title')} subtitle={t('nav_settings')} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        {/* بطاقة الهوية للطبيب */}
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
                                    <Badge color="amber">LVL {level}</Badge>
                                    <Badge color={userProfile.doctorData?.accountStatus === 'approved' ? 'green' : 'red'}>
                                        {userProfile.doctorData?.accountStatus.toUpperCase()}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 bg-slate-950/30 -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6">
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
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="h-full border-white/10">
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                                <div className="p-2 bg-indigo-500/10 rounded-lg"><User className="text-indigo-400" size={20} /></div> 
                                {t('edit_profile')}
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('doc_fullname')}</label>
                                    <input 
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('photo_url_label')}</label>
                                    <div className="relative">
                                        <Camera className="absolute top-4 right-4 text-slate-600" size={18} />
                                        <input 
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-10 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all"
                                            placeholder="https://..."
                                            value={formData.photoUrl}
                                            onChange={e => setFormData({...formData, photoUrl: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('doc_phone')}</label>
                                        <div className="relative">
                                            <Phone className="absolute top-4 right-4 text-slate-600" size={18} />
                                            <input 
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-10 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all"
                                                value={formData.phoneNumber}
                                                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('doc_location')}</label>
                                        <div className="relative">
                                            <MapPin className="absolute top-4 right-4 text-slate-600" size={18} />
                                            <input 
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-10 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all"
                                                value={formData.clinicLocation}
                                                onChange={e => setFormData({...formData, clinicLocation: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t('doc_bio')}</label>
                                    <textarea 
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none h-32 resize-none transition-all"
                                        value={formData.bio}
                                        onChange={e => setFormData({...formData, bio: e.target.value})}
                                    />
                                </div>

                                <div className="pt-6 border-t border-white/5 flex justify-end">
                                    <Button onClick={handleSaveProfile} variant="primary" disabled={loading} className="w-full md:w-auto">
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

    // --- واجهة المستخدم العادي / المريض (بتصميم جديد) ---
    return (
        <LayoutContainer>
            <PageHeader title={t('settings_title')} subtitle={t('settings_subtitle')} />
            
            {/* إعدادات السرعة - بطاقات تفاعلية */}
            <Card className="mb-8 border-white/10">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="text-indigo-400" /> {t('pace_control')}
                </h2>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-2xl bg-slate-950/30 p-4 rounded-xl border border-white/5">
                    {t('pace_desc')}
                </p>
                
                {userProfile?.role === 'patient' || userProfile?.planType === 'manual' ? (
                        <div className="p-8 bg-slate-950/50 rounded-[2rem] border border-dashed border-slate-700 text-slate-500 text-center flex flex-col items-center gap-4">
                            <ShieldCheck size={40} className="text-slate-600" />
                            <p className="max-w-md">هذه الخطة مدارة بواسطة {userProfile.role === 'patient' ? 'طبيبك المعالج' : 'النظام اليدوي'}. التعديل التلقائي للسرعة غير متاح.</p>
                        </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* زر بطيء */}
                        <button 
                            onClick={() => updateSpeedSettings(0.8)} 
                            className={`group p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col items-center gap-4 ${userProfile.speedModifier && userProfile.speedModifier < 0.9 ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:bg-slate-900 hover:border-slate-600'}`}
                        >
                            <div className={`p-4 rounded-full transition-colors ${userProfile.speedModifier && userProfile.speedModifier < 0.9 ? 'bg-white/20' : 'bg-slate-900 group-hover:bg-slate-800'}`}>
                                <Clock size={28} />
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-lg">{t('pace_slow')}</span>
                                <span className="text-[10px] opacity-70">تمديد المدة للراحة</span>
                            </div>
                        </button>
                        
                        {/* زر متوازن */}
                        <button 
                            onClick={() => updateSpeedSettings(1.0)} 
                            className={`group p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col items-center gap-4 ${userProfile.speedModifier && userProfile.speedModifier >= 0.9 && userProfile.speedModifier <= 1.1 ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:bg-slate-900 hover:border-slate-600'}`}
                        >
                            <div className={`p-4 rounded-full transition-colors ${userProfile.speedModifier && userProfile.speedModifier >= 0.9 && userProfile.speedModifier <= 1.1 ? 'bg-white/20' : 'bg-slate-900 group-hover:bg-slate-800'}`}>
                                <ShieldCheck size={28} />
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-lg">{t('pace_balanced')}</span>
                                <span className="text-[10px] opacity-70">الوضع القياسي</span>
                            </div>
                        </button>
                        
                        {/* زر سريع */}
                        <button 
                            onClick={() => updateSpeedSettings(1.2)} 
                            className={`group p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col items-center gap-4 ${userProfile.speedModifier && userProfile.speedModifier > 1.1 ? 'bg-rose-600 border-rose-500 text-white shadow-xl shadow-rose-500/20' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:bg-slate-900 hover:border-slate-600'}`}
                        >
                            <div className={`p-4 rounded-full transition-colors ${userProfile.speedModifier && userProfile.speedModifier > 1.1 ? 'bg-white/20' : 'bg-slate-900 group-hover:bg-slate-800'}`}>
                                <Zap size={28} />
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-lg">{t('pace_fast')}</span>
                                <span className="text-[10px] opacity-70">تقليص المدة (مكثف)</span>
                            </div>
                        </button>
                    </div>
                )}
            </Card>

            {/* إعدادات المخزون (للمستخدم العادي) - تصميم جديد */}
            {userProfile?.role === 'normal_user' && (
                <Card className="mb-8 border-white/10">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Package className="text-blue-400" /> {t('inventory_title')}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors group focus-within:border-indigo-500">
                            <label className="text-xs text-slate-500 font-bold block mb-2 uppercase tracking-wider">{t('boxes')}</label>
                            <div className="flex items-center gap-3">
                                <Package className="text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={24} />
                                <input 
                                    type="number" 
                                    className="bg-transparent text-white font-bold text-2xl w-full outline-none placeholder-slate-700"
                                    value={localInventory.boxes || ''} 
                                    onChange={(e) => setLocalInventory({...localInventory, boxes: parseInt(e.target.value) || 0})}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors group focus-within:border-indigo-500">
                            <label className="text-xs text-slate-500 font-bold block mb-2 uppercase tracking-wider">{t('pills_per_box')}</label>
                            <div className="flex items-center gap-3">
                                <span className="text-slate-600 font-bold text-xl group-focus-within:text-indigo-500">x</span>
                                <input 
                                    type="number" 
                                    className="bg-transparent text-white font-bold text-2xl w-full outline-none placeholder-slate-700"
                                    value={localInventory.pillsPerBox || ''}
                                    onChange={(e) => setLocalInventory({...localInventory, pillsPerBox: parseInt(e.target.value) || 0})}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors group focus-within:border-indigo-500">
                            <label className="text-xs text-slate-500 font-bold block mb-2 uppercase tracking-wider">{t('loose_pills')}</label>
                            <div className="flex items-center gap-3">
                                <Pill className="text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={24} />
                                <input 
                                    type="number" 
                                    className="bg-transparent text-white font-bold text-2xl w-full outline-none placeholder-slate-700"
                                    value={localInventory.loosePills || ''}
                                    onChange={(e) => setLocalInventory({...localInventory, loosePills: parseInt(e.target.value) || 0})}
                                    placeholder="0"
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
                </Card>
            )}

            {/* منطقة الخطر - حذف الحساب */}
            <Card className="border-rose-500/20 bg-rose-900/10 hover:bg-rose-900/20 transition-colors">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <AlertTriangle className="text-rose-500" /> {language === 'ar' ? 'منطقة الخطر' : 'Danger Zone'}
                        </h2>
                        <p className="text-rose-200/60 text-sm max-w-md">
                            {language === 'ar' 
                                ? 'هذا الإجراء سيقوم بحذف حسابك وجميع بياناتك نهائياً من النظام. لا يمكن التراجع عن هذه الخطوة.' 
                                : 'This action will permanently delete your account and all data. This cannot be undone.'}
                        </p>
                    </div>
                    <Button variant="danger" onClick={resetAllData} className="w-full md:w-auto whitespace-nowrap !py-3 !px-6 shadow-lg shadow-rose-900/20">
                        <Trash2 size={18} className="mr-2"/> {language === 'ar' ? 'حذف الحساب نهائياً' : 'Delete Account'}
                    </Button>
                </div>
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
import { Smile, Activity, Zap, Moon, Shield, Award, TrendingUp } from 'lucide-react';

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
    const correlationData = useMemo(() => {
        return logs.slice(-14).map(log => ({ // آخر 14 يوم فقط للوضوح
            date: log.date.slice(5),
            dose: log.doseTaken,
            sleep: log.sleepHours || 0,
            moodScore: log.mood === 'good' ? 10 : log.mood === 'normal' ? 5 : 2
        }));
    }, [logs]);

    // 3. منطق الأوسمة (Gamification)
    const badges = [
        {
            id: 'warrior',
            title: t('badge_7days'),
            icon: Shield,
            color: 'indigo',
            achieved: logs.length >= 7,
            desc: "7 أيام متواصلة"
        },
        {
            id: 'halfway',
            title: t('badge_halfway'),
            icon: Zap,
            color: 'amber',
            achieved: logs.length > 0 && plan.length > 0 && logs[logs.length-1].doseTaken <= (plan[0].plannedDose / 2),
            desc: "نصف الكمية"
        },
        {
            id: 'sleep',
            title: t('badge_sleep'),
            icon: Moon,
            color: 'blue',
            achieved: logs.length >= 3 && (logs.slice(-3).reduce((acc, l) => acc + (l.sleepHours || 0), 0) / 3) >= 7,
            desc: "نوم مستقر"
        },
        {
            id: 'stable',
            title: t('badge_stable'),
            icon: Smile,
            color: 'emerald',
            achieved: logs.length >= 3 && logs.slice(-3).every(l => l.mood === 'good'),
            desc: "مزاج ممتاز"
        }
    ];

    return (
      <LayoutContainer>
          <PageHeader 
            title={t('nav_stats')}
            subtitle={language === 'ar' ? "تحليل عميق لأدائك الحيوي ومسار التعافي." : "Deep analysis of your vitals and recovery path."}
          />

          {/* Badges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {badges.map((badge) => (
                  <div key={badge.id} className={`relative p-6 rounded-[2rem] border overflow-hidden transition-all duration-500 group ${badge.achieved ? `bg-${badge.color}-500/10 border-${badge.color}-500/30 shadow-lg shadow-${badge.color}-900/20` : 'bg-slate-900/40 border-white/5 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                      {/* الخلفية المضيئة للوسام */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-${badge.color}-500/0 via-${badge.color}-500/0 to-${badge.color}-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                      
                      <div className="relative z-10 flex flex-col items-center text-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6 ${badge.achieved ? `bg-gradient-to-tr from-${badge.color}-600 to-${badge.color}-400` : 'bg-slate-800'}`}>
                              <badge.icon size={28} strokeWidth={1.5} />
                          </div>
                          <div>
                              <span className={`text-sm font-bold block mb-1 ${badge.achieved ? 'text-white' : 'text-slate-400'}`}>{badge.title}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider bg-slate-950/50 px-2 py-1 rounded-lg">
                                  {badge.achieved ? badge.desc : "مغلق"}
                              </span>
                          </div>
                      </div>
                      
                      {badge.achieved && (
                          <div className="absolute top-3 right-3 text-yellow-400 animate-pulse">
                              <Award size={16} />
                          </div>
                      )}
                  </div>
              ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* 1. Smart Correlation Chart (Dose vs Sleep) */}
              <Card className="min-h-[400px] flex flex-col lg:col-span-2 border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                              <Activity className="w-5 h-5"/>
                          </div>
                           تأثير الجرعة على النوم
                      </h3>
                      <div className="flex gap-4 text-xs font-bold mt-4 md:mt-0 bg-slate-950/50 p-2 rounded-xl border border-white/5">
                          <span className="flex items-center gap-2 text-indigo-300"><span className="w-3 h-3 rounded bg-indigo-500"></span> الجرعة ({unitLabel})</span>
                          <span className="flex items-center gap-2 text-emerald-300"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> ساعات النوم</span>
                      </div>
                  </div>
                  
                  <div className="flex-1 h-[300px] w-full">
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
                                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                  <YAxis yAxisId="left" stroke="#6366f1" fontSize={10} axisLine={false} tickLine={false} label={{ value: 'الجرعة', angle: -90, position: 'insideLeft', fill: '#6366f1', fontSize: 10 }} />
                                  <YAxis yAxisId="right" orientation="right" stroke="#34d399" fontSize={10} axisLine={false} tickLine={false} domain={[0, 12]} label={{ value: 'ساعات', angle: 90, position: 'insideRight', fill: '#34d399', fontSize: 10 }} />
                                  <Tooltip 
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'}}
                                      itemStyle={{color: '#fff', fontSize: '12px'}}
                                      labelStyle={{color: '#94a3b8', marginBottom: '8px', fontSize: '10px'}}
                                  />
                                  <Bar yAxisId="left" dataKey="dose" barSize={20} fill="url(#colorDoseBar)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                                  <Line yAxisId="right" type="monotone" dataKey="sleep" stroke="#34d399" strokeWidth={3} dot={{r: 4, fill: '#0f172a', strokeWidth: 2}} activeDot={{r: 6}} animationDuration={2000} />
                              </ComposedChart>
                          </ResponsiveContainer>
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">
                              <TrendingUp size={48} className="opacity-20 mb-4"/>
                              <p>سجل بياناتك لمدة 3 أيام لتبدأ التحليلات الذكية بالعمل.</p>
                          </div>
                      )}
                  </div>
              </Card>

              {/* 2. Mood Distribution (Donut Chart Style) */}
              <Card className="min-h-[350px] flex flex-col border-white/10">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                          <Smile className="w-5 h-5"/>
                      </div>
                      الحالة المزاجية العامة
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
                           <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-medium">
                               لا توجد بيانات كافية
                           </div>
                       )}
                  </div>
              </Card>

              {/* 3. Sleep Quality Histogram */}
              <Card className="min-h-[350px] flex flex-col border-white/10">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                          <Moon className="w-5 h-5"/>
                      </div>
                       استقرار النوم (آخر 7 أيام)
                  </h3>
                  <div className="flex-1 mt-4">
                      {logs.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={logs.slice(-7)}> 
                                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                  <XAxis dataKey="date" tickFormatter={(str) => str.slice(8)} stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                  <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} domain={[0, 12]} />
                                  <Tooltip 
                                      cursor={{fill: '#1e293b', opacity: 0.5}}
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                      itemStyle={{color: '#fff'}}
                                      formatter={(val) => [`${val} ساعة`, 'النوم']}
                                  />
                                  <ReferenceLine y={7} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'الهدف (7h)', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
                                  <Bar dataKey="sleepHours" radius={[6, 6, 0, 0]} barSize={24}>
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
import { LifeBuoy, Plus, MessageSquare, Send, CheckCircle, Lock, X, Pill, FlaskConical, User, Stethoscope, ChevronRight } from 'lucide-react';

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
    const { t, language } = useLanguage();
    
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
                    <Button onClick={() => setShowCreateModal(true)} variant="primary" className="!rounded-xl shadow-indigo-500/20">
                        <Plus size={18} /> {t('new_ticket') || "New Ticket"}
                    </Button>
                }
            />

            {/* Context Banner - Glass Style */}
            <div className="mb-8 bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-white/10 p-5 rounded-3xl flex items-center justify-between backdrop-blur-xl shadow-xl animate-in slide-in-from-top-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-900/20">
                        {user.role === 'doctor' ? <Stethoscope size={24}/> : 
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
                {/* LIST COLUMN */}
                <Card className={`md:col-span-4 flex flex-col overflow-hidden bg-slate-900/80 border-white/10 !p-0 ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/50 backdrop-blur-md">
                        <h3 className="font-bold text-white text-lg">{t('my_tickets') || "My Tickets"}</h3>
                        <Badge color="indigo">{tickets.length}</Badge>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
                        {tickets.length === 0 && (
                            <div className="text-center py-12 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-2xl m-2 flex flex-col items-center">
                                <LifeBuoy className="mb-3 opacity-30" size={32}/>
                                {t('no_tickets') || "No previous tickets."}
                            </div>
                        )}
                        {tickets.map(ticket => (
                            <div 
                                key={ticket.id}
                                onClick={() => setActiveTicket(ticket)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 group ${
                                    activeTicket?.id === ticket.id 
                                    ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-900/20' 
                                    : 'bg-slate-950/30 border-transparent hover:bg-slate-800 hover:border-white/5'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className={`font-bold text-sm truncate max-w-[70%] ${activeTicket?.id === ticket.id ? 'text-indigo-300' : 'text-slate-200'}`}>
                                        {ticket.subject}
                                    </h4>
                                    <Badge color={ticket.status === 'resolved' ? 'green' : ticket.status === 'open' ? 'rose' : 'amber'} className="!text-[9px] !px-2 !py-0.5">
                                        {getStatusLabel(ticket.status)}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-end text-[10px] text-slate-500">
                                    <span className="font-mono">{new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                                    <ChevronRight size={14} className={`transition-transform duration-300 ${activeTicket?.id === ticket.id ? 'text-indigo-400 translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* CHAT COLUMN */}
                <Card className={`md:col-span-8 flex flex-col overflow-hidden bg-slate-900/60 border-white/10 relative !p-0 ${!activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    {!activeTicket ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 opacity-50 shadow-inner border border-white/5">
                                <LifeBuoy size={48} />
                            </div>
                            <p className="text-lg font-medium">{t('select_ticket_prompt') || "Select a ticket to view details"}</p>
                        </div>
                    ) : (
                        <>
                            {/* Ticket Header */}
                            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl absolute top-0 left-0 right-0 z-20">
                                <div>
                                    <button type="button" onClick={() => setActiveTicket(null)} className="md:hidden text-slate-400 mr-2 mb-2 flex items-center gap-1 text-xs hover:text-white transition-colors">
                                        <ChevronRight size={14} className={language === 'ar' ? 'rotate-180' : 'rotate-0'}/> {t('close')}
                                    </button>
                                    <h3 className="font-bold text-white flex items-center gap-3 text-lg">
                                        <div className="p-1.5 bg-emerald-500/10 rounded-lg"><Lock size={16} className="text-emerald-500"/></div>
                                        {activeTicket.subject}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-mono mt-1 ml-9">Ref: {activeTicket.id}</p>
                                </div>
                                {activeTicket.status === 'resolved' && (
                                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-2">
                                        <CheckCircle size={14} /> {t('status_resolved') || "Resolved"}
                                    </div>
                                )}
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 pt-28 space-y-6 custom-scrollbar bg-slate-900/30">
                                {activeTicket.messages?.map((msg, idx) => {
                                    const isMe = !msg.isAdmin; 
                                    return (
                                        <div key={idx} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'} animate-in slide-in-from-bottom-2`}>
                                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                                                isMe 
                                                ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5' 
                                                : 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20'
                                            }`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-slate-500 mt-2 px-1 flex items-center gap-1 font-bold uppercase tracking-wider">
                                                {isMe ? (t('me') || "Me") : (t('support_team') || "Support")} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Reply Input */}
                            <div className="p-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl z-20">
                                {activeTicket.status === 'resolved' ? (
                                    <div className="text-center text-sm text-emerald-400 font-bold bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 shadow-lg">
                                        {t('ticket_closed_msg') || "This ticket is closed."}
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <input 
                                            className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 focus:bg-slate-900 outline-none transition-all placeholder-slate-600 shadow-inner"
                                            placeholder={t('write_reply') || "Write your reply..."}
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && sendReply()}
                                        />
                                        <button 
                                            onClick={sendReply} 
                                            disabled={!newMessage.trim()}
                                            className="p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 active:scale-95"
                                        >
                                            <Send size={20} />
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
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <Card className="w-full max-w-md bg-slate-900 border-white/10 relative shadow-2xl overflow-hidden">
                        {/* Header Background */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-600/20 to-transparent pointer-events-none"></div>
                        
                        <button type="button" onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all z-20"><X size={20}/></button>
                        
                        <div className="relative z-10 p-2">
                            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                                <div className="p-3 bg-indigo-500/20 rounded-xl"><LifeBuoy className="text-indigo-400" size={24}/></div>
                                {t('new_ticket_title') || "New Request"}
                            </h3>
                            
                            <div className="space-y-5">
                                <div className="group">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{t('ticket_subject') || "Subject"}</label>
                                    <input 
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all placeholder-slate-700" 
                                        value={newSubject} 
                                        onChange={e => setNewSubject(e.target.value)} 
                                        placeholder="Briefly describe the issue..." 
                                    />
                                </div>
                                <div className="group">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1 group-focus-within:text-indigo-400 transition-colors">{t('ticket_details') || "Details"}</label>
                                    <textarea 
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none h-40 resize-none transition-all placeholder-slate-700" 
                                        value={newMessage} 
                                        onChange={e => setNewMessage(e.target.value)} 
                                        placeholder="Provide more details here..." 
                                    />
                                </div>
                                <Button onClick={createTicket} variant="primary" className="w-full py-4 text-lg shadow-lg shadow-indigo-500/20" disabled={!newSubject || !newMessage}>
                                    {t('send_request') || "Submit Request"}
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
        setCurrentView(AppView.DASHBOARD);
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
    <div className="min-h-screen bg-[#020617] text-slate-200 relative overflow-x-hidden selection:bg-indigo-500/30" dir={dir}>
      
      {/* --- Ambient Background Effects (The New Magic) --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-float opacity-50"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] animate-float opacity-40 delay-1000"></div>
      </div>

      {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-2 border border-white/10">
              <Check size={18} /> {toastMessage}
          </div>
      )}

      {/* REJECTION SCREEN - DOCTOR */}
      {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'rejected' && (
          <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 animate-in zoom-in relative z-10">
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
          <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 animate-in zoom-in relative z-10">
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
              
              <div className="md:mr-80 p-4 md:p-12 pb-24 md:pb-12 transition-all duration-500 relative z-10">
                
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
        isOwner(userId) || 
        (resource.data.role == 'doctor' && resource.data.doctorData.accountStatus == 'approved') ||
        (isApprovedDoctor() && (resource.data.role == 'normal_user' || resource.data.role == 'patient')) ||
        (isApprovedDoctor() && resource.data.patientData.assignedDoctorId == request.auth.uid)
      );

      // Create: Anyone
      allow create: if isSignedIn() && isOwner(userId);

      // Update
      allow update: if isSignedIn() && (
        (isOwner(userId) && 
         request.resource.data.role != 'admin' &&
         (resource.data.isBanned == false || request.resource.data.isBanned == resource.data.isBanned)
        ) ||
        (isApprovedDoctor() && resource.data.patientData.assignedDoctorId == request.auth.uid) ||
        (isApprovedDoctor() && (resource.data.patientData == null || resource.data.patientData.assignedDoctorId == null))
      );
      
      // التعديل الجديد هنا: السماح للمستخدم بحذف حسابه
      allow delete: if isSignedIn() && isOwner(userId);
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
  :root {
    --primary-glow: conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg);
  }

  body {
    @apply bg-[#020617] text-slate-200 antialiased selection:bg-indigo-500/30 selection:text-indigo-200;
    /* تحسين عرض الخطوط العربية */
    font-family: 'Tajawal', 'Inter', sans-serif;
    font-feature-settings: "ss01", "ss02", "cv01", "cv02";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden; /* منع التمرير الأفقي غير المرغوب فيه */
  }

  /* تحسين شكل شريط التمرير الافتراضي للمتصفح */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #0f172a; 
  }
  ::-webkit-scrollbar-thumb {
    background: #334155; 
    border-radius: 4px;
    border: 2px solid #0f172a; /* يعطي شكلاً أنحف */
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #475569; 
  }
}

@layer components {
  /* فئة الزجاج الموحدة - خفيفة على المعالج */
  .glass {
    @apply bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-lg;
  }
  
  .glass-heavy {
    @apply bg-slate-950/80 backdrop-blur-xl border border-white/5;
  }

  /* تأثير التفاعل */
  .glass-hover {
    @apply transition-all duration-300 hover:bg-slate-800/60 hover:border-indigo-500/30 hover:shadow-indigo-500/10 hover:shadow-xl;
  }
}

@layer utilities {
  /* إخفاء شريط التمرير مع الحفاظ على الوظيفة (للموبايل) */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* شريط تمرير مخصص ونحيف للقوائم الجانبية والدردشة */
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

  /* نصوص متدرجة احترافية */
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400;
  }
}

/* === مكتبة الرسوم المتحركة (Optimized Animations) === */

/* ظهور ناعم للعناصر */
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

/* حركة عائمة للخلفية (خفيفة جداً) */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* نبض خفيف للتنبيهات */
@keyframes pulse-glow {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
  50% { opacity: .8; box-shadow: 0 0 20px 0 rgba(99, 102, 241, 0.3); }
}

.animate-in {
  animation: fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: transform, opacity; /* تحسين الأداء بإخبار المتصفح */
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* فئات مساعدة للحركة */
.slide-in-from-bottom-4 { --tw-enter-translate-y: 1rem; }
.slide-in-from-right-4 { --tw-enter-translate-x: 1rem; }
.zoom-in { --tw-enter-scale: 0.95; }

/* تحسين الطباعة */
@media print {
  body {
    background-color: white;
    color: black;
  }
  .no-print {
    display: none;
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
  
  // --- بيانات فيزيائية جديدة (التعديل هنا) ---
  age?: number;
  weight?: number; // kg
  height?: number; // cm
  // ---------------------------

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
- Total Characters: 461145
- Estimated Tokens: ~115.287 (GPT-4 Context)
