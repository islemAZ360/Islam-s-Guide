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