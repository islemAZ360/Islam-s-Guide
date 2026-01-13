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