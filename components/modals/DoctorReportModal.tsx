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