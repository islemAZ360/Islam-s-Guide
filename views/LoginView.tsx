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