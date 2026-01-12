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