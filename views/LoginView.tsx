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