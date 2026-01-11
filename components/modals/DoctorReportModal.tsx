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