import React, { useState } from 'react';
import { Activity, Chrome, LogIn, UserPlus, User, Mail, Lock, Ruler, Weight, Calendar, CheckSquare, Square, KeyRound, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
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
    <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500" dir={dir}>
      
      <div className="absolute -top-16 right-0 z-50">
        <LanguageSwitcher />
      </div>

      <div className="relative">
        {/* Glow Effect behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        <Card className="!bg-[#0f172a]/80 border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden relative rounded-[2.5rem]" noPadding>
            
            {/* Top Decor */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="p-8 md:p-10 relative z-10">
                
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-[#1e293b] to-[#0f172a] shadow-lg shadow-indigo-500/10 mb-5 ring-1 ring-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {isResetMode ? <KeyRound className="w-10 h-10 text-indigo-400 relative z-10" /> : <Activity className="w-10 h-10 text-indigo-400 relative z-10" />}
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                        {isResetMode ? (language === 'ar' ? 'استعادة الحساب' : 'Account Recovery') : 
                        isSignUp ? (language === 'ar' ? 'انضم إلينا' : 'Join Us') : "Islam's Guide"}
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
                                <div className="absolute top-3.5 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none"><User size={20} /></div>
                                <input 
                                    id="fullname"
                                    type="text" 
                                    name="name"
                                    autoComplete="name"
                                    placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-[#020617]/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:bg-[#020617] focus:ring-1 focus:ring-indigo-500/50 text-white outline-none transition-all placeholder-slate-600"
                                    required
                                />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10 text-slate-500 pointer-events-none group-focus-within:text-indigo-400 transition-colors"><Calendar size={16}/></div>
                                    <input id="age" type="number" name="age" placeholder={language === 'ar' ? 'العمر' : 'Age'} value={age} onChange={(e) => setAge(e.target.value)} className="w-full pl-10 pr-2 py-3 bg-[#020617]/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-white outline-none text-sm text-center transition-all" required min="18" max="99"/>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10 text-slate-500 pointer-events-none group-focus-within:text-indigo-400 transition-colors"><Weight size={16}/></div>
                                    <input id="weight" type="number" name="weight" placeholder="kg" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full pl-10 pr-2 py-3 bg-[#020617]/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-white outline-none text-sm text-center transition-all" required />
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10 text-slate-500 pointer-events-none group-focus-within:text-indigo-400 transition-colors"><Ruler size={16}/></div>
                                    <input id="height" type="number" name="height" placeholder="cm" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full pl-10 pr-2 py-3 bg-[#020617]/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-white outline-none text-sm text-center transition-all" required />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Common Fields */}
                    <div className="space-y-4">
                        <div className="relative group">
                            <label htmlFor="email" className="sr-only">{t('email')}</label>
                            <div className="absolute top-3.5 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none"><Mail size={20} /></div>
                            <input 
                                id="email"
                                type="email" 
                                name="email"
                                autoComplete="email"
                                placeholder={t('email')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-[#020617]/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:bg-[#020617] focus:ring-1 focus:ring-indigo-500/50 text-white outline-none transition-all placeholder-slate-600"
                                required
                            />
                        </div>
                        {!isResetMode && (
                            <div className="relative group animate-in slide-in-from-bottom-2">
                                <label htmlFor="password" className="sr-only">{t('password')}</label>
                                <div className="absolute top-3.5 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none"><Lock size={20} /></div>
                                <input 
                                    id="password"
                                    type="password" 
                                    name="password"
                                    autoComplete={isSignUp ? "new-password" : "current-password"}
                                    placeholder={t('password')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-[#020617]/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:bg-[#020617] focus:ring-1 focus:ring-indigo-500/50 text-white outline-none transition-all placeholder-slate-600"
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
                                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                            >
                                {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                            </button>
                        </div>
                    )}

                    {/* Privacy Consent Checkbox */}
                    {isSignUp && !isResetMode && (
                        <div className="flex items-start gap-3 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 animate-in slide-in-from-bottom-2 cursor-pointer hover:bg-indigo-500/10 transition-colors" onClick={() => setHasConsented(!hasConsented)}>
                            <div className={`mt-0.5 shrink-0 transition-colors ${hasConsented ? 'text-indigo-400' : 'text-slate-500'}`}>
                                {hasConsented ? <CheckSquare size={18} /> : <Square size={18} />}
                            </div>
                            <label className="text-[10px] text-slate-400 leading-relaxed cursor-pointer select-none">
                                {language === 'ar' 
                                    ? 'أوافق على الشروط والأحكام. هذا التطبيق أداة مساعدة وليس بديلاً طبياً.'
                                    : 'I agree to terms. This app is a tool, not a medical substitute.'}
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
                    <div className="flex gap-3 pt-2">
                        {isResetMode && (
                            <Button 
                                variant="secondary"
                                onClick={() => { setIsResetMode(false); setResetStatus(null); }}
                                className="px-4 !rounded-xl"
                                disabled={isLoading}
                            >
                                {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                            </Button>
                        )}
                        <Button 
                            className="flex-1 py-4 text-lg shadow-lg shadow-indigo-500/20 !rounded-xl" 
                            type="submit" 
                            isLoading={isLoading}
                            disabled={isSignUp && !hasConsented}
                        >
                            {isResetMode 
                                ? (language === 'ar' ? 'إرسال الرابط' : 'Send Link')
                                : isSignUp 
                                    ? (language === 'ar' ? 'إنشاء حساب' : 'Sign Up') 
                                    : t('login_email')} 
                            {!isLoading && !isResetMode && (isSignUp ? <UserPlus size={18} className="ml-2"/> : <LogIn size={18} className="ml-2"/>)}
                        </Button>
                    </div>
                </form>

                {/* Separator & Social Login */}
                {!isResetMode && (
                    <>
                        <div className="my-6 flex items-center gap-4 text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">
                            <div className="h-px bg-white/5 flex-1"></div>
                            {t('or')}
                            <div className="h-px bg-white/5 flex-1"></div>
                        </div>

                        <Button 
                            onClick={handleGoogleLogin}
                            variant="secondary"
                            className="w-full py-3 !bg-white !text-slate-900 hover:!bg-slate-200 border-0 flex items-center justify-center gap-2 font-bold !rounded-xl shadow-lg"
                        >
                            <Chrome className="w-5 h-5" />
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
                                className="text-indigo-400 font-bold hover:text-indigo-300 ml-2 transition-colors focus:outline-none underline decoration-indigo-500/30 underline-offset-4"
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
                            className="text-slate-600 text-xs font-mono hover:text-indigo-400 transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <Sparkles size={12} /> {t('demo_account')}
                        </button>
                    </div>
                )}
            </div>
        </Card>
      </div>
    </div>
  );
};