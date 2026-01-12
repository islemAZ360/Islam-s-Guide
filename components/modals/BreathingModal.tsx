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