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