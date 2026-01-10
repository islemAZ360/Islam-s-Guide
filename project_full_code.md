# Project Code Dump
Generated: 10/1/2026, 08:25:30

## 🌳 Project Structure
```text
├── components
  ├── MobileNav.tsx
  ├── Sidebar.tsx
  └── UI.tsx
├── contexts
  └── LanguageContext.tsx
├── services
  ├── adminServices.ts
  ├── firebase.ts
  ├── taperingEngine.ts
  └── translations.ts
├── views
  ├── AdminView.tsx
  ├── ArticlesView.tsx
  ├── CalendarStatsView.tsx
  ├── CalendarView.tsx
  ├── CommunityView.tsx
  ├── DashboardView.tsx
  ├── DoctorDashboardView.tsx
  ├── DoctorPatientsView.tsx
  ├── LoginView.tsx
  ├── OnboardingView.tsx
  ├── StatsView.tsx
  └── SupportView.tsx
├── App.tsx
├── firestore.rules
├── index.css
├── index.html
├── index.tsx
├── metadata.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── types.ts
└── vite.config.ts
```

## 📄 File Contents

### File: `components\MobileNav.tsx`
```tsx
import React from 'react';
import { 
  LayoutDashboard, Calendar as CalendarIcon, Activity, Settings, Users, 
  LifeBuoy, BookOpen, ShieldAlert, MessageSquare 
} from 'lucide-react';
import { AppView, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface MobileNavProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  userProfile?: UserProfile | null;
}

export const MobileNav = ({ currentView, setCurrentView, userProfile }: MobileNavProps) => {
  const { t } = useLanguage();

  const getMenuItems = () => {
    const role = userProfile?.role;
    const items = [];

    // 1. ADMIN MENU
    if (role === 'admin') {
       items.push(
        { id: AppView.ADMIN, icon: ShieldAlert, label: 'Admin' },
        { id: AppView.COMMUNITY, icon: Users, label: 'Users' },
        { id: AppView.SUPPORT, icon: LifeBuoy, label: 'Tickets' },
       );
    } 
    // 2. DOCTOR MENU
    else if (role === 'doctor') {
        items.push(
            { id: AppView.DOCTOR_DASHBOARD, icon: LayoutDashboard, label: 'Dash' },
            { id: AppView.DOCTOR_PATIENTS, icon: Users, label: 'Patients' },
            { id: AppView.COMMUNITY, icon: MessageSquare, label: 'Chat' },
            // Articles & Support can be accessed via sidebar or specific pages linked internally
        );
    } 
    // 3. PATIENT / NORMAL USER MENU
    else {
        // Patient Waiting for Plan
        if (role === 'patient' && !userProfile?.patientData?.isPlanAssigned) {
             items.push(
                { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
                { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
             );
        } else {
             // Standard User
             items.push(
                { id: AppView.DASHBOARD, icon: LayoutDashboard, label: t('nav_dashboard') },
                { id: AppView.CALENDAR, icon: CalendarIcon, label: t('nav_calendar') },
                { id: AppView.STATS, icon: Activity, label: t('nav_stats') },
                { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
             );
        }
    }
    
    // Common settings icon at the end
    items.push({ id: AppView.SETTINGS, icon: Settings, label: t('nav_settings') });
    
    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 h-20 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-50 animate-in slide-in-from-bottom-20 duration-700">
      
      <div className="flex items-center justify-between px-4 h-full overflow-x-auto scrollbar-hide pb-1 gap-2">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex-shrink-0 min-w-[60px] flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group ${
                  isActive ? 'text-indigo-400 -translate-y-3' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`p-3 rounded-full transition-all duration-300 ${
                  isActive 
                  ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-[0_8px_20px_rgba(99,102,241,0.4)] ring-4 ring-[#020617]' 
                  : 'bg-transparent group-hover:bg-white/5'
              }`}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              <span className={`absolute -bottom-5 text-[9px] font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${
                  isActive ? 'opacity-100 translate-y-0 text-white' : 'opacity-0 -translate-y-2 text-slate-500'
              }`}>
                  {item.label}
              </span>
              
              {isActive && (
                  <span className="absolute -bottom-7 w-1 h-1 bg-indigo-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
```
---

### File: `components\Sidebar.tsx`
```tsx
import React from 'react';
import { 
  LayoutDashboard, Calendar as CalendarIcon, Activity, Settings, LogOut, 
  Users, ShieldAlert, User as UserIcon, LifeBuoy, BookOpen, Stethoscope, 
  MessageSquare
} from 'lucide-react';
import { AppView, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './UI';

interface SidebarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  handleLogout: () => void;
  userProfile?: UserProfile | null;
}

export const Sidebar = ({ currentView, setCurrentView, handleLogout, userProfile }: SidebarProps) => {
  const { t } = useLanguage();

  // تحديد القوائم بناءً على الدور
  const getMenuItems = () => {
    const role = userProfile?.role;
    const items = [];

    // 1. ADMIN MENU
    if (role === 'admin') {
      items.push(
        { id: AppView.ADMIN, icon: ShieldAlert, label: t('nav_admin') }, // الرئيسية للأدمن
        { id: AppView.COMMUNITY, icon: Users, label: 'إدارة المجتمع' },
        { id: AppView.ARTICLES, icon: BookOpen, label: 'إدارة المحتوى' },
        { id: AppView.SUPPORT, icon: LifeBuoy, label: 'تذاكر الدعم' },
      );
    }
    
    // 2. DOCTOR MENU
    else if (role === 'doctor') {
      items.push(
        { id: AppView.DOCTOR_DASHBOARD, icon: LayoutDashboard, label: 'لوحة القيادة' },
        { id: AppView.DOCTOR_PATIENTS, icon: Users, label: 'ملفات المرضى' },
        { id: AppView.ARTICLES, icon: BookOpen, label: 'نشر مقال' },
        { id: AppView.COMMUNITY, icon: MessageSquare, label: 'غرف الدردشة' },
        { id: AppView.SUPPORT, icon: LifeBuoy, label: 'الدعم الفني' },
      );
    }

    // 3. PATIENT / NORMAL USER MENU
    else {
      // إذا كان مريضاً وينتظر الخطة، نعرض له المجتمع والدعم فقط
      if (role === 'patient' && !userProfile?.patientData?.isPlanAssigned) {
         items.push(
            { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
            { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
         );
      } else {
         // القائمة القياسية للمستخدم العادي والمريض المعتمد
         items.push(
            { id: AppView.DASHBOARD, icon: LayoutDashboard, label: t('nav_dashboard') },
            { id: AppView.CALENDAR, icon: CalendarIcon, label: t('nav_calendar') },
            { id: AppView.STATS, icon: Activity, label: t('nav_stats') },
            { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
            { id: AppView.ARTICLES, icon: BookOpen, label: t('nav_articles') },
            { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
         );
      }
    }

    // Settings is common for everyone
    items.push({ id: AppView.SETTINGS, icon: Settings, label: t('nav_settings') });

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="hidden md:flex flex-col w-80 bg-slate-950/80 backdrop-blur-2xl border-l border-white/5 h-screen fixed right-0 top-0 overflow-y-auto z-50 shadow-2xl transition-all">
      {/* Header */}
      <div className="p-10 border-b border-white/5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none"></div>
        
        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Activity className="w-6 h-6 text-white" />
          </div>
          Islam's Guide
        </h2>
        
        <div className="mr-[3.25rem] mt-2">
            {userProfile?.role === 'doctor' && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    نسخة الأطباء
                </span>
            )}
            {userProfile?.role === 'admin' && (
                <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    لوحة الإدارة
                </span>
            )}
            {(userProfile?.role === 'patient' || userProfile?.role === 'normal_user') && (
                <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                    Smart Edition <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </span>
            )}
        </div>
      </div>
      
      {/* Menu */}
      <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
              currentView === item.id 
              ? 'bg-gradient-to-r from-indigo-600/10 to-transparent text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]' 
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            {currentView === item.id && (
              <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_indigo]"></div>
            )}
            <item.icon className={`w-5 h-5 transition-transform duration-300 ${currentView === item.id ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-slate-600 group-hover:text-slate-400'}`} />
            <span className="font-bold text-lg tracking-wide">{item.label}</span>
            
            {item.id === AppView.ADMIN && (
                <span className="mr-auto w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
            )}
          </button>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="p-6 border-t border-white/5 shrink-0 space-y-6">
        <LanguageSwitcher />
        
        <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 flex items-center gap-3 group hover:border-indigo-500/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                {userProfile?.role === 'doctor' ? <Stethoscope size={18} /> : (userProfile?.name?.charAt(0).toUpperCase() || <UserIcon size={18} />)}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{userProfile?.name || 'Guest'}</p>
                <p className="text-[10px] text-slate-500 truncate">{userProfile?.role?.toUpperCase()}</p>
            </div>
            <button 
                onClick={handleLogout} 
                className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                title={t('logout')}
            >
                <LogOut size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};
```
---

### File: `components\UI.tsx`
```tsx
import React, { useEffect, useState } from 'react';
import { Globe, X, Printer, FileText, ArrowRight, Snowflake, Eye, ShieldCheck, Wind, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile, DailyLog, PlanDay } from '../types';

// --- Language Switcher ---
export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex bg-slate-800/40 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-lg">
      {(['ar', 'en', 'ru'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-300 ${
            language === lang 
              ? 'bg-indigo-600/90 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
};

// --- Doctor Report Modal (Smart Update) ---
export const DoctorReportModal = ({ 
  isOpen, onClose, userProfile, logs, plan 
}: { 
  isOpen: boolean, 
  onClose: () => void,
  userProfile: UserProfile | null,
  logs: DailyLog[],
  plan: PlanDay[]
}) => {
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

// --- SOS MODAL (Breathing) ---
export const BreathingModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
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

// --- Standard UI Components ---

export const LayoutContainer = ({ children, className = '' }: any) => (
  <div className={`max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${className}`}>
    {children}
  </div>
);

export const PageHeader = ({ title, subtitle, action }: { title: string, subtitle?: string, action?: React.ReactNode }) => (
  <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-6 md:pb-8 relative">
    <div className="relative z-10 w-full lg:w-auto">
      <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg">{title}</h1>
      {subtitle && <p className="text-slate-400 font-medium text-sm md:text-lg max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
    {action && (
      <div className="flex flex-wrap gap-3 md:gap-4 relative z-10 w-full lg:w-auto justify-start lg:justify-end">
        {action}
      </div>
    )}
    <div className="absolute left-0 top-0 w-64 h-64 bg-indigo-500/10 blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen"></div>
  </header>
);

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "relative overflow-hidden px-6 py-4 rounded-2xl font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale group select-none cursor-pointer";
  const variants: any = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-indigo-400/20",
    secondary: "bg-slate-800/40 backdrop-blur-md text-slate-300 border border-white/5 hover:bg-slate-700/50 hover:text-white hover:border-white/10",
    danger: "bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.4)]",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.3)] border border-emerald-400/20",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
    panic: "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === 'primary' && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300 mix-blend-overlay"></div>}
    </button>
  );
};

export const Card = ({ children, className = '', noPadding = false }: any) => (
  <div className={`bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:border-white/10 transition-all duration-500 ${!noPadding ? 'p-6 md:p-10' : ''} ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
    {children}
  </div>
);

export const Badge = ({ children, color = 'indigo', className = '' }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    red: 'bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
  };
  const selectedColor = colors[color] || colors.indigo;
  return (
    <span className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold border ${selectedColor} backdrop-blur-md flex items-center gap-1.5 animate-in fade-in zoom-in duration-300 whitespace-nowrap w-fit ${className}`}>{children}</span>
  );
};

export const ProgressRing = ({ radius, stroke, progress, totalSteps }: { radius: number, stroke: number, progress: number, totalSteps: number }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const { t } = useLanguage();
  return (
    <div className="relative flex items-center justify-center group cursor-default">
      <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg] transform transition-transform duration-700 group-hover:scale-105">
        <circle stroke="#1e293b" strokeWidth={stroke} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} className="opacity-50" />
        <circle stroke="url(#gradient)" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} strokeLinecap="round" fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
        <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#818cf8" /></linearGradient></defs>
      </svg>
      <div className="absolute flex flex-col items-center text-center animate-in fade-in zoom-in duration-700 pointer-events-none">
        <span className="text-3xl md:text-4xl font-black text-white tracking-tighter drop-shadow-lg">{Math.round(progress)}%</span>
        <span className="text-[9px] md:text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">تعافي</span>
        <span className="text-[9px] md:text-[10px] text-slate-400 mt-2 bg-slate-800/80 px-2 py-1 rounded-full border border-slate-700">{totalSteps} {t('days_left').split(' ')[0]}</span>
      </div>
    </div>
  );
};
```
---

### File: `contexts\LanguageContext.tsx`
```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../services/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string; // Type-safe translation keys
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children?: React.ReactNode }) => {
  // 1. Initialize Language State
  const [language, setLanguageState] = useState<Language>(() => {
    // A. Check Local Storage first
    const saved = localStorage.getItem('app_lang');
    if (saved && ['ar', 'en', 'ru'].includes(saved)) {
        return saved as Language;
    }
    
    // B. Check Browser Language preference
    if (typeof navigator !== 'undefined') {
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'ar') return 'ar';
        if (browserLang === 'ru') return 'ru';
    }

    // C. Default fallback (Arabic for this specific audience)
    return 'ar'; 
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
    
    // Update HTML attributes for accessibility and CSS
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  };

  // The translation function
  const t = (key: keyof typeof translations['en']) => {
    // Fallback to English if key missing in current lang, then fallback to key string
    return translations[language][key] || translations['en'][key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Effect to sync direction on mount/change
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
```
---

### File: `services\adminServices.ts`
```ts
import { 
    collection, addDoc, updateDoc, doc, getDocs, query, orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { AuditLog, Ticket, Article, UserProfile } from '../types';

// --- Audit Logger (نظام المراقبة) ---
// يسجل كل حركة يقوم بها الأدمن لضمان عدم التلاعب
export const logAdminAction = async (adminUser: UserProfile, action: string, details: string, targetId?: string) => {
    if (adminUser.role !== 'admin' || !adminUser.uid) return;
    
    try {
        await addDoc(collection(db, 'audit_logs'), {
            adminId: adminUser.uid,
            adminName: adminUser.name,
            action,
            details,
            targetId: targetId || null,
            timestamp: Date.now()
        } as AuditLog);
    } catch (e) {
        console.error("Failed to log audit:", e);
    }
};

// --- User Management (إدارة المستخدمين) ---

// وضع علامة "خطر" على المستخدم لمراقبته
export const flagUser = async (admin: UserProfile, targetUid: string, isFlagged: boolean) => {
    await updateDoc(doc(db, 'users', targetUid), { isFlagged });
    await logAdminAction(admin, 'FLAG_USER', `Set flagged status to ${isFlagged}`, targetUid);
};

// حفظ ملاحظات سرية عن المستخدم (لا يراها المستخدم)
export const saveDoctorNotes = async (targetUid: string, notes: string) => {
    // نستخدم حقل doctorNotes لهذا الغرض، سواء كتبها طبيب أو أدمن
    await updateDoc(doc(db, 'users', targetUid), { doctorNotes: notes });
};

// --- CMS (نظام إدارة المحتوى) ---

export const publishArticle = async (admin: UserProfile, article: Omit<Article, 'id' | 'createdAt' | 'authorName' | 'authorId' | 'authorRole'>) => {
    if (!admin.uid) return;
    
    await addDoc(collection(db, 'articles'), {
        ...article,
        createdAt: Date.now(),
        authorName: admin.name,
        authorId: admin.uid,
        authorRole: 'admin',
        isPublished: true
    });
    await logAdminAction(admin, 'CREATE_ARTICLE', `Published article: ${article.title}`);
};

export const fetchArticles = async () => {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Article));
};

// --- Support Tickets (نظام الدعم الفني) ---

export const fetchAllTickets = async () => {
    const q = query(collection(db, 'tickets'), orderBy('lastUpdate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Ticket));
};

export const updateTicketStatus = async (admin: UserProfile, ticketId: string, status: string) => {
    await updateDoc(doc(db, 'tickets', ticketId), { 
        status,
        lastUpdate: Date.now()
    });
    await logAdminAction(admin, 'UPDATE_TICKET', `Changed ticket status to ${status}`, ticketId);
};

export const replyToTicket = async (admin: UserProfile, ticketId: string, text: string, currentMessages: any[]) => {
    if (!admin.uid) return;

    const newMessage = {
        senderId: admin.uid,
        senderName: admin.name,
        text,
        timestamp: Date.now(),
        isAdmin: true // This flags the message as coming from Support/Admin
    };
    
    await updateDoc(doc(db, 'tickets', ticketId), {
        messages: [...currentMessages, newMessage],
        lastUpdate: Date.now(),
        status: 'pending' // انتظار رد المستخدم
    });
};
```
---

### File: `services\firebase.ts`
```ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// --- إعدادات الاتصال ---
// يجب استبدال هذه القيم بالقيم الخاصة بمشروعك من Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyB9_8yeOazYKhzHiHvyzBaIoDQiNduMnS0", // Placeholder Key
  authDomain: "islam-s-guide.firebaseapp.com",
  projectId: "islam-s-guide",
  storageBucket: "islam-s-guide.firebasestorage.app",
  messagingSenderId: "176137497336",
  appId: "1:176137497336:web:d763f34c2c632f1317e90d",
  measurementId: "G-VNVJGFXLN4"
};

// تهيئة المتغيرات
let app;
let auth: Auth | undefined;
let db: Firestore; 
const googleProvider = new GoogleAuthProvider();

try {
  // محاولة تهيئة التطبيق
  app = initializeApp(firebaseConfig);
  
  // تهيئة خدمات المصادقة وقاعدة البيانات
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log("Firebase initialized successfully.");
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // في حالة فشل الاتصال، يمكن هنا تفعيل "وضع عدم الاتصال" أو إظهار رسالة خطأ
  // لكن بما أن التطبيق يعتمد كلياً على البيانات السحابية الآن، سنكتفي بتسجيل الخطأ
}

// تصدير الخدمات لاستخدامها في باقي الملفات
export { auth, db, googleProvider };
```
---

### File: `services\taperingEngine.ts`
```ts
import { Inventory, PlanDay, DailyLog, ManualPhase } from '../types';

/**
 * Helper to add days safely to a date string
 */
const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Calculates total inventory based on form type (Pills or Liquid)
 */
export const calculateTotalInventory = (inv: Inventory): number => {
  // If pillsPerBox is 0, we assume raw count in loosePills or boxes
  const total = (inv.boxes * (inv.pillsPerBox || 1)) + inv.loosePills;
  return Math.max(0, total);
};

// Minimum cut unit. For tablets usually 0.5 or 0.25. For liquid 0.1.
const MIN_SPLIT = 0.1; 

const roundToSplit = (num: number): number => {
  if (num <= 0.05) return 0;
  return Math.round(num * 10) / 10;
};

/**
 * --- 1. MANUAL PLAN GENERATOR (For Doctors) ---
 * Converts doctor's phases (e.g., "5mg for 7 days", "2.5mg for 7 days")
 * into a full calendar array.
 */
export const generateManualPlan = (
  phases: ManualPhase[], 
  startDateStr: string = new Date().toISOString()
): PlanDay[] => {
  const plan: PlanDay[] = [];
  let currentDate = startDateStr.split('T')[0];

  phases.forEach(phase => {
    for (let i = 0; i < phase.days; i++) {
      plan.push({
        date: currentDate,
        plannedDose: phase.dose,
        isPast: false
      });
      // Move to next day
      currentDate = addDays(currentDate, 1);
    }
  });

  return plan;
};

/**
 * --- 2. SMART INTELLIGENT ALGORITHM (For Normal Users) ---
 * Philosophy:
 * 1. "Safety First": Always reserve pills for the 'Tail' (Stopping Phase).
 * 2. If Inventory is LOW: Shorten the high-dose duration, but keep the tail long.
 * 3. If Inventory is HIGH: Extend the tail (add skip-3-days, skip-4-days cycles).
 */
export const generatePlan = (
  totalPills: number, 
  startDose: number, 
  startDateStr: string,
  speedModifier: number = 1.0 // 0.8 (Slow), 1.0 (Normal), 1.2 (Fast)
): PlanDay[] => {
  
  if (totalPills <= 0 || startDose <= 0) return [];

  // --- A. SETUP & DEFINITIONS ---
  let currentDose = roundToSplit(startDose);
  
  // Define the "Tail Unit" (The smallest dose before stopping)
  // Usually 0.5mg for tablets, or equal to current dose if already small.
  const tailUnit = currentDose <= 0.5 ? currentDose : 0.5;

  // Base duration for a phase (e.g., 2 weeks), scaled by user preference.
  // Slower speed (0.8) means LONGER duration.
  // Faster speed (1.2) means SHORTER duration.
  const basePhaseDuration = Math.max(7, Math.round(14 / speedModifier));

  // --- B. RESERVE INVENTORY FOR THE "ESSENTIAL TAIL" ---
  // We MUST guarantee these phases exist to prevent shock.
  // Phase T1: Every Other Day (1 On, 1 Off) -> Needs (basePhaseDuration / 2) pills
  // Phase T2: Every 3rd Day (1 On, 2 Off)   -> Needs (basePhaseDuration / 3) pills
  
  const cyclesT1 = Math.ceil(basePhaseDuration / 2); // Count of doses needed
  const cyclesT2 = Math.ceil(basePhaseDuration / 3); // Count of doses needed
  
  const pillsForEssentialTail = (cyclesT1 * tailUnit) + (cyclesT2 * tailUnit);
  
  // Calculate what's left for the "Descent" (coming down from high dose)
  let inventoryForDescent = totalPills - pillsForEssentialTail;
  
  // If we are critically low, we still prioritize tail, but maybe shorten it slightly
  // rather than cutting the descent entirely.
  let isCriticalLow = false;
  if (inventoryForDescent < 0) {
      isCriticalLow = true;
      inventoryForDescent = 0; // We will just use whatever we have for the tail
  }

  // --- C. BUILD THE DESCENTS (From StartDose down to TailUnit) ---
  let descentPlan: { dose: number, days: number }[] = [];
  
  // Only calculate descent if we are above the tail unit
  if (currentDose > tailUnit && !isCriticalLow) {
      // Reduction rate per step (e.g. 10%)
      const reductionRate = 0.10 * speedModifier; 
      
      while (currentDose > tailUnit) {
          // Calculate cost for one full phase at this dose
          const costForFullPhase = currentDose * basePhaseDuration;
          
          // Determine actual days we can afford at this dose
          let actualDays = basePhaseDuration;
          
          // Smart Logic: If pills are tight, shrink high-dose days to save them for later
          if (inventoryForDescent < costForFullPhase) {
              actualDays = Math.floor(inventoryForDescent / currentDose);
          }
          
          if (actualDays > 0) {
              descentPlan.push({ dose: currentDose, days: actualDays });
              inventoryForDescent -= (currentDose * actualDays);
          } 
          
          // Calculate Next Dose
          let nextDose = roundToSplit(currentDose * (1 - reductionRate));
          // Ensure we don't get stuck or go up
          if (nextDose >= currentDose) nextDose = roundToSplit(currentDose - MIN_SPLIT);
          // Don't go below tail unit in the descent phase
          if (nextDose < tailUnit) nextDose = tailUnit;
          
          // Break loop if we hit the tail unit
          if (currentDose === tailUnit) break;
          currentDose = nextDose;
      }
  } else if (currentDose > tailUnit && isCriticalLow) {
      // Critical Scenario: User has high dose but NO pills. 
      // Strategy: Immediate drop to Tail Unit to stretch supplies (Emergency Mode)
      currentDose = tailUnit; 
  }

  // --- D. BUILD THE TAIL (Smart Extension) ---
  // Now we use ALL remaining pills to build the best possible tail.
  
  // Re-calculate true remaining (Total - Used in Descent)
  const usedInDescent = descentPlan.reduce((acc, p) => acc + (p.dose * p.days), 0);
  let remainingForTail = totalPills - usedInDescent;
  
  const tailPlan: { dose: number, days: number }[] = [];
  
  if (remainingForTail > 0) {
      // A. Stabilization at lowest dose (Daily)
      // Only if we have surplus. If critical, skip straight to spacing.
      const costForDaily = tailUnit * basePhaseDuration;
      if (remainingForTail > (pillsForEssentialTail + costForDaily)) {
          // We have plenty! Do a full daily phase
          tailPlan.push({ dose: tailUnit, days: basePhaseDuration });
          remainingForTail -= costForDaily;
      } else if (remainingForTail > pillsForEssentialTail) {
          // We have some extra, do a partial daily phase
          const affordableDays = Math.floor((remainingForTail - pillsForEssentialTail) / tailUnit);
          if (affordableDays > 0) {
               tailPlan.push({ dose: tailUnit, days: affordableDays });
               remainingForTail -= (tailUnit * affordableDays);
          }
      }

      // B. Level 1: Skip 1 Day (1 On, 1 Off)
      // Loop until we reach base duration OR run out
      let daysCount1 = 0;
      while (remainingForTail >= tailUnit && daysCount1 < basePhaseDuration) {
          tailPlan.push({ dose: tailUnit, days: 1 });
          tailPlan.push({ dose: 0, days: 1 });
          remainingForTail -= tailUnit;
          daysCount1 += 2; 
      }

      // C. Level 2: Skip 2 Days (1 On, 2 Off)
      let daysCount2 = 0;
      while (remainingForTail >= tailUnit && daysCount2 < basePhaseDuration) {
          tailPlan.push({ dose: tailUnit, days: 1 });
          tailPlan.push({ dose: 0, days: 2 });
          remainingForTail -= tailUnit;
          daysCount2 += 3;
      }

      // D. Level 3 (Extended): Skip 3 Days (1 On, 3 Off) - ONLY IF SURPLUS
      while (remainingForTail >= tailUnit) {
          tailPlan.push({ dose: tailUnit, days: 1 });
          tailPlan.push({ dose: 0, days: 3 });
          remainingForTail -= tailUnit;
          
          // E. Level 4 (Super Extended): Skip 4 Days - If HUGE surplus
          if (remainingForTail >= tailUnit) {
             tailPlan.push({ dose: tailUnit, days: 1 });
             tailPlan.push({ dose: 0, days: 4 });
             remainingForTail -= tailUnit;
          }
      }
  }

  // --- E. ASSEMBLE FINAL PLAN ---
  const finalSteps = [...descentPlan, ...tailPlan];
  const plan: PlanDay[] = [];
  let currDate = startDateStr.split('T')[0];

  finalSteps.forEach(step => {
    for (let i = 0; i < step.days; i++) {
      plan.push({
        date: currDate,
        plannedDose: step.dose,
        isPast: false
      });
      currDate = addDays(currDate, 1);
    }
  });

  return plan;
};

/**
 * --- 3. RE-CALCULATE DYNAMICALLY ---
 * Used by the algorithm to adjust the future based on real usage.
 */
export const adjustPlan = (
  originalPlan: PlanDay[],
  logs: DailyLog[],
  totalInitialInventory: number, 
  speedModifier: number = 1.0 
): PlanDay[] => {
  
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Base Case: No logs yet
  if (sortedLogs.length === 0) {
      if (originalPlan.length === 0) return [];
      return generatePlan(totalInitialInventory, originalPlan[0].plannedDose, originalPlan[0].date, speedModifier);
  }

  const lastLog = sortedLogs[sortedLogs.length - 1];
  const lastLogDate = lastLog.date;

  // Calculate REAL remaining inventory based on what was actually taken
  const totalUsed = sortedLogs.reduce((acc, log) => acc + log.doseTaken, 0);
  const remainingInventory = Math.max(0, totalInitialInventory - totalUsed);

  // Preserve History (Past days remain as they were logged/planned)
  const historyDays = originalPlan
    .filter(day => day.date <= lastLogDate)
    .map(day => {
        const log = sortedLogs.find(l => l.date === day.date);
        return {
            ...day,
            isPast: true,
            log: log || undefined,
        };
    });
  
  // Generate Future from TOMORROW
  let newStartDose = lastLog.doseTaken;
  
  // If last dose was 0 (skip day), find the last active dose to know our level
  if (newStartDose === 0) {
      const lastActive = [...sortedLogs].reverse().find(l => l.doseTaken > 0);
      newStartDose = lastActive ? lastActive.doseTaken : (originalPlan[0]?.plannedDose || 0);
  }

  const nextDayStr = addDays(lastLogDate, 1);

  const futureDays = generatePlan(
      remainingInventory,
      newStartDose,
      nextDayStr,
      speedModifier
  );

  return [...historyDays, ...futureDays];
};
```
---

### File: `services\translations.ts`
```ts
export type Language = 'ar' | 'en' | 'ru';

export const translations = {
  ar: {
    // Auth
    welcome: "مرحباً بك",
    subtitle: "نظام التعافي الذكي القائم على علم الأعصاب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    login_email: "تسجيل الدخول",
    login_google: "دخول عبر Google",
    demo_account: "حساب تجريبي",
    error_prefix: "تنبيه: ",
    or: "أو",
    banned_msg: "تم تعليق حسابك. يرجى مراجعة الدعم الفني.",
    
    // Sidebar & Nav
    nav_dashboard: "الرئيسية",
    nav_calendar: "الجدول الزمني",
    nav_stats: "التحليلات",
    nav_settings: "الإعدادات",
    nav_community: "المجتمع",
    nav_admin: "الإدارة",
    nav_support: "الدعم الفني",
    nav_articles: "المعرفة",
    logout: "تسجيل خروج",
    create_room: "إنشاء غرفة",
    room_name: "اسم الغرفة",
    type_msg: "اكتب رسالتك...",
    comm_rooms: "غرف الدردشة",
    comm_leaderboard: "لوحة المتصدرين",

    // Dashboard
    daily_report: "المتابعة اليومية",
    days_left: "أيام متبقية",
    status_stable: "الحالة مستقرة",
    safety_active: "نظام الأمان نشط",
    safety_desc: "رصدت الخوارزمية تذبذباً في مؤشراتك الحيوية. تم تفعيل بروتوكول التثبيت مؤقتاً لحمايتك من الأعراض الانسحابية.",
    freeze_plan_btn: "تجميد الخطة (راحة 3 أيام)",
    target_dose: "الجرعة المستهدفة لليوم",
    documented: "تم التوثيق بنجاح",
    dose: "الجرعة",
    mood: "المزاج",
    excellent: "ممتاز",
    stable: "جيد",
    bad: "متعب",
    step_1: "الجرعة الفعلية",
    step_2: "المؤشرات الحيوية",
    confirm_log: "تأكيد وتحديث المخزون",
    algo_active: "المحلل الذكي يعمل",
    algo_desc: "نظام آمن يحسب التخفيض بناءً على الكمية المتوفرة.",
    recovery_path: "مسار التعافي المتوقع",
    sos_button: "طوارئ (SOS)",
    export_report: "تقرير للطبيب",
    print: "طباعة التقرير", 
    
    // Inventory
    inv_status_ok: "المخزون كافٍ",
    inv_status_low: "نقص في المخزون",
    inv_alert_desc: "بناءً على وتيرتك الحالية، قد ينفد المخزون قبل انتهاء فترة التثبيت النهائية. يوصى بتقليل السرعة أو توفير المزيد.",
    inventory_title: "جرد المخزون",
    boxes: "عدد العبوات الكاملة",
    pills_per_box: "الكمية داخل العبوة",
    loose_pills: "الكمية المفردة (فراط)",
    total_balance: "الرصيد الكلي",
    current_habit: "جرعتك الحالية",
    analyze_plan: "تحليل وإنشاء الخطة",
    guest: "زائر",

    // Toasts
    toast_log_success: "تم حفظ البيانات وإعادة حساب المتبقي",
    toast_freeze_success: "تم تفعيل وضع الراحة لمدة 3 أيام",
    toast_speed_updated: "تم تعديل وتيرة الخطة العلاجية بنجاح",

    // Features
    sleep_label: "ساعات النوم",
    symptoms_label: "هل تشعر بأي مما يلي؟",
    sym_insomnia: "أرق",
    sym_anxiety: "قلق",
    sym_sweating: "تعرق",
    sym_shake: "رجفة",
    sym_nausea: "غثيان",
    sym_headache: "صداع",
    
    // Badges
    badges_title: "الإنجازات",
    badge_7days: "محارب الأسبوع",
    badge_halfway: "منتصف الطريق",
    badge_sleep: "نوم منتظم",
    badge_stable: "ثبات انفعالي",

    // SOS
    sos_title: "بروتوكول الطوارئ",
    sos_phase_1_title: "توقف.",
    sos_phase_1_text: "أنت بأمان. هذا شعور كيميائي مؤقت سيعبر.",
    sos_btn_ground: "التالي",
    sos_phase_2_title: "الوعي الحسي",
    sos_phase_2_text: "انظر حولك. سمِّ 5 أشياء زرقاء.",
    sos_btn_next: "تم",
    sos_phase_3_title: "صدمة حرارية",
    sos_phase_3_text: "اغسل وجهك بماء بارد جداً لتفعيل العصب الحائر.",
    sos_btn_breathe: "تمارين التنفس",
    sos_phase_4_title: "تنفس",
    sos_phase_4_subtitle: "شهيق عميق... زفير بطيء.",
    breathe_in: "شهيق",
    breathe_hold: "إمساك",
    breathe_out: "زفير",
    close: "إنهاء",

    // Settings
    settings_title: "إعدادات النظام",
    settings_subtitle: "التحكم في الخوارزمية",
    pace_control: "وتيرة التعافي",
    pace_desc: "يمكنك تعديل سرعة الخطة في أي وقت. النظام سيقوم بإعادة توزيع المخزون تلقائياً لضمان عدم انقطاع الدواء.",
    pace_slow: "مريح (تمديد)",
    pace_balanced: "متوازن (قياسي)",
    pace_fast: "سريع (مكثف)",
    danger_zone: "منطقة الخطر",
    factory_reset_btn: "إعادة ضبط المصنع (حذف البيانات)",
  },
  en: {
    welcome: "Welcome",
    subtitle: "Neuro-Scientific Recovery System",
    email: "Email",
    password: "Password",
    login_email: "Login",
    login_google: "Google Login",
    demo_account: "Demo Access",
    error_prefix: "Error: ",
    or: "OR",
    banned_msg: "Account suspended.",
    
    nav_dashboard: "Dashboard",
    nav_calendar: "Schedule",
    nav_stats: "Analytics",
    nav_settings: "Settings",
    nav_community: "Community",
    nav_admin: "Admin",
    nav_support: "Support",
    nav_articles: "Knowledge",
    logout: "Logout",
    create_room: "Create Room",
    room_name: "Room Name",
    type_msg: "Type a message...",
    comm_rooms: "Chat Rooms",
    comm_leaderboard: "Leaderboard",

    daily_report: "Daily Check-in",
    days_left: "Days Left",
    status_stable: "Stable",
    safety_active: "Safety Guard Active",
    safety_desc: "Biometric instability detected. Doses stabilized temporarily.",
    freeze_plan_btn: "Freeze (3 Days Rest)",
    target_dose: "Target Dose",
    documented: "Logged Successfully",
    dose: "Dose",
    mood: "Mood",
    excellent: "Great",
    stable: "Good",
    bad: "Bad",
    step_1: "Actual Dose",
    step_2: "Vitals",
    confirm_log: "Confirm & Update Inventory",
    algo_active: "Smart Engine Active",
    algo_desc: "Safety-first tapering system.",
    recovery_path: "Projected Path",
    sos_button: "SOS",
    export_report: "Doctor Report",
    print: "Print Report",

    inv_status_ok: "Inventory Sufficient",
    inv_status_low: "Low Inventory",
    inv_alert_desc: "Current pace may deplete inventory before tapering ends. Consider slowing down.",
    inventory_title: "Inventory Check",
    boxes: "Full Boxes",
    pills_per_box: "Qty per Box",
    loose_pills: "Loose Qty",
    total_balance: "Total Balance",
    current_habit: "Current Dose",
    analyze_plan: "Generate Plan",
    guest: "Guest",

    toast_log_success: "Log saved. Plan recalculated.",
    toast_freeze_success: "Plan frozen for 3 days.",
    toast_speed_updated: "Pace updated successfully.",

    sleep_label: "Sleep Hours",
    symptoms_label: "Symptoms",
    sym_insomnia: "Insomnia",
    sym_anxiety: "Anxiety",
    sym_sweating: "Sweating",
    sym_shake: "Tremors",
    sym_nausea: "Nausea",
    sym_headache: "Headache",
    
    badges_title: "Milestones",
    badge_7days: "Week Warrior",
    badge_halfway: "Halfway Point",
    badge_sleep: "Sleep Restored",
    badge_stable: "Emotional Stability",

    sos_title: "Emergency Protocol",
    sos_phase_1_title: "STOP.",
    sos_phase_1_text: "You are safe. This is just chemistry.",
    sos_btn_ground: "Next",
    sos_phase_2_title: "Grounding",
    sos_phase_2_text: "Name 5 blue objects.",
    sos_btn_next: "Done",
    sos_phase_3_title: "Thermal Shock",
    sos_phase_3_text: "Use ice water on your face.",
    sos_btn_breathe: "Breathe",
    sos_phase_4_title: "Breathe",
    sos_phase_4_subtitle: "Deep inhale... slow exhale.",
    breathe_in: "Inhale",
    breathe_hold: "Hold",
    breathe_out: "Exhale",
    close: "Close",

    settings_title: "System Settings",
    settings_subtitle: "Algorithm Control",
    pace_control: "Tapering Pace",
    pace_desc: "Adjust speed anytime. The system auto-recalculates to ensure supply lasts.",
    pace_slow: "Relaxed (Extend)",
    pace_balanced: "Balanced",
    pace_fast: "Fast (Intense)",
    danger_zone: "Danger Zone",
    factory_reset_btn: "Factory Reset",
  },
  ru: {
    welcome: "Добро пожаловать",
    subtitle: "Нейро-система восстановления",
    email: "Email",
    password: "Пароль",
    login_email: "Войти",
    login_google: "Google",
    demo_account: "Демо",
    error_prefix: "Ошибка: ",
    or: "ИЛИ",
    banned_msg: "Аккаунт заблокирован.",
    nav_dashboard: "Главная",
    nav_calendar: "График",
    nav_stats: "Аналитика",
    nav_settings: "Настройки",
    nav_community: "Сообщество",
    nav_admin: "Админ",
    nav_support: "Поддержка",
    nav_articles: "Статьи",
    logout: "Выход",
    create_room: "Создать чат",
    room_name: "Название",
    type_msg: "Сообщение...",
    comm_rooms: "Чаты",
    comm_leaderboard: "Лидеры",

    daily_report: "Отчет",
    days_left: "Дней",
    status_stable: "Стабильно",
    safety_active: "Защита активна",
    safety_desc: "Обнаружена нестабильность. Доза зафиксирована.",
    freeze_plan_btn: "Заморозить (3 дня)",
    target_dose: "Цель",
    documented: "Записано",
    dose: "Доза",
    mood: "Настрой",
    excellent: "Отлично",
    stable: "Норм",
    bad: "Плохо",
    step_1: "Доза",
    step_2: "Симптомы",
    confirm_log: "Подтвердить",
    algo_active: "Смарт-система",
    algo_desc: "Безопасная система.",
    recovery_path: "Прогноз",
    sos_button: "SOS",
    export_report: "Отчет врачу",
    print: "Печать",
    inv_status_ok: "Запас в норме",
    inv_status_low: "Мало запасов",
    inv_alert_desc: "Риск нехватки. Снизьте темп.",
    inventory_title: "Инвентарь",
    boxes: "Пачки",
    pills_per_box: "Шт в пачке",
    loose_pills: "Остаток",
    total_balance: "Всего",
    current_habit: "Текущая доза",
    analyze_plan: "Создать план",
    guest: "Гость",
    toast_log_success: "Сохранено.",
    toast_freeze_success: "План заморожен.",
    toast_speed_updated: "Скорость обновлена.",
    sleep_label: "Сон",
    symptoms_label: "Симптомы",
    sym_insomnia: "Бессонница",
    sym_anxiety: "Тревога",
    sym_sweating: "Пот",
    sym_shake: "Дрожь",
    sym_nausea: "Тошнота",
    sym_headache: "Голова",
    badges_title: "Достижения",
    badge_7days: "Начало",
    badge_halfway: "Половина",
    badge_sleep: "Сон",
    badge_stable: "Стабильность",
    sos_title: "SOS",
    sos_phase_1_title: "СТОП.",
    sos_phase_1_text: "Вы в безопасности.",
    sos_btn_ground: "Далее",
    sos_phase_2_title: "Осознание",
    sos_phase_2_text: "Назовите 5 синих вещей.",
    sos_btn_next: "Ок",
    sos_phase_3_title: "Холод",
    sos_phase_3_text: "Умойтесь холодной водой.",
    sos_btn_breathe: "Дышать",
    sos_phase_4_title: "Дыхание",
    sos_phase_4_subtitle: "Вдох... выдох.",
    breathe_in: "Вдох",
    breathe_hold: "Держать",
    breathe_out: "Выдох",
    close: "Закрыть",
    settings_title: "Настройки",
    settings_subtitle: "Управление",
    pace_control: "Темп",
    pace_desc: "Измените скорость в любой момент.",
    pace_slow: "Медленно",
    pace_balanced: "Баланс",
    pace_fast: "Быстро",
    danger_zone: "Опасно",
    factory_reset_btn: "Сброс",
  }
};
```
---

### File: `views\AdminView.tsx`
```tsx
import React, { useEffect, useState, useMemo } from 'react';
import { 
    collection, getDocs, updateDoc, doc, addDoc, query, orderBy, deleteDoc, where 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Article, ArticleCategory } from '../types';
import { PageHeader, LayoutContainer, Card, Badge, Button } from '../components/UI';
import { 
    Ban, Activity, Search, Users, Lock, Eye, Save, Plus, X, Flag, FileText, LifeBuoy, Stethoscope, CheckCircle, XCircle, Trash2
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';

export const AdminView = () => {
    // -- Global State --
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'users' | 'cms'>('overview');
    const [loading, setLoading] = useState(false);
    
    // -- Data Stores --
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);

    // -- CMS State --
    const [showArticleModal, setShowArticleModal] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'tip' as ArticleCategory });

    // -- Search --
    const [searchTerm, setSearchTerm] = useState("");

    // -- 1. FETCH DATA --
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, "users"));
            const fetched: UserProfile[] = [];
            snap.forEach(d => fetched.push({ uid: d.id, ...d.data() } as UserProfile));
            setUsers(fetched);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const fetchArticles = async () => {
        const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() } as Article)));
    };

    useEffect(() => {
        if (activeTab === 'users' || activeTab === 'doctors' || activeTab === 'overview') fetchUsers();
        if (activeTab === 'cms') fetchArticles();
    }, [activeTab]);

    // -- DOCTOR MANAGEMENT ACTIONS --
    
    const approveDoctor = async (docUid: string) => {
        if (!confirm("هل أنت متأكد من اعتماد هذا الطبيب؟ سيتمكن من الوصول لبيانات المرضى.")) return;
        
        try {
            await updateDoc(doc(db, "users", docUid), {
                "doctorData.accountStatus": "approved"
            });
            // تحديث القائمة محلياً
            setUsers(prev => prev.map(u => u.uid === docUid ? {
                ...u, doctorData: { ...u.doctorData!, accountStatus: 'approved' }
            } : u));
            alert("تم اعتماد الطبيب بنجاح.");
        } catch (e) { console.error(e); }
    };

    const rejectDoctor = async (docUid: string) => {
        if (!confirm("رفض الطلب سيمنع الطبيب من الدخول.")) return;
        try {
            await updateDoc(doc(db, "users", docUid), {
                "doctorData.accountStatus": "rejected"
            });
            setUsers(prev => prev.map(u => u.uid === docUid ? {
                ...u, doctorData: { ...u.doctorData!, accountStatus: 'rejected' }
            } : u));
        } catch (e) { console.error(e); }
    };

    // -- USER MANAGEMENT ACTIONS --

    const toggleBan = async (user: UserProfile) => {
        if (!user.uid) return;
        const newVal = !user.isBanned;
        if(confirm(newVal ? "حظر هذا المستخدم؟" : "فك الحظر عن المستخدم؟")) {
            await updateDoc(doc(db, "users", user.uid), { isBanned: newVal });
            setUsers(users.map(u => u.uid === user.uid ? {...u, isBanned: newVal} : u));
        }
    }

    // -- CMS ACTIONS --

    const publishArticle = async () => {
        if (!newArticle.title || !newArticle.content) return;
        try {
            await addDoc(collection(db, "articles"), {
                ...newArticle,
                isPublished: true,
                createdAt: Date.now(),
                authorName: "System Admin",
                authorRole: "admin",
                authorId: "ADMIN"
            });
            setShowArticleModal(false);
            setNewArticle({ title: '', content: '', category: 'tip' });
            fetchArticles();
        } catch (e) { console.error(e); }
    };

    const deleteArticle = async (id: string) => {
        if(confirm("حذف هذا المقال؟")) {
            await deleteDoc(doc(db, "articles", id));
            setArticles(prev => prev.filter(a => a.id !== id));
        }
    }

    // -- DERIVED DATA --
    
    const doctorsList = users.filter(u => u.role === 'doctor');
    const pendingDoctors = doctorsList.filter(d => d.doctorData?.accountStatus === 'pending');
    const approvedDoctors = doctorsList.filter(d => d.doctorData?.accountStatus === 'approved');
    
    const normalUsers = users.filter(u => u.role === 'normal_user' || u.role === 'patient');
    const recoveredUsers = users.filter(u => u.patientData?.isRecovered);

    // Stats for Overview
    const stats = useMemo(() => {
        return [
            { name: 'إجمالي المرضى', value: normalUsers.length, color: '#6366f1' },
            { name: 'أطباء معتمدين', value: approvedDoctors.length, color: '#10b981' },
            { name: 'حالات تعافي', value: recoveredUsers.length, color: '#f59e0b' },
            { name: 'طلبات أطباء', value: pendingDoctors.length, color: '#f43f5e' },
        ];
    }, [users]);

    return (
        <LayoutContainer>
            <PageHeader title="غرفة التحكم المركزية" subtitle="نظام الإدارة المتكامل (Admin Dashboard)" />

            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 custom-scrollbar">
                {[
                    { id: 'overview', icon: Activity, label: 'نظرة عامة' },
                    { id: 'doctors', icon: Stethoscope, label: 'إدارة الأطباء' },
                    { id: 'users', icon: Users, label: 'المستخدمين' },
                    { id: 'cms', icon: FileText, label: 'إدارة المحتوى' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                            activeTab === tab.id 
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' 
                            : 'bg-slate-900 text-slate-500 border-white/5 hover:bg-slate-800'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {tab.id === 'doctors' && pendingDoctors.length > 0 && (
                             <span className="ml-2 bg-rose-500 text-white text-[10px] px-1.5 rounded-full animate-pulse">{pendingDoctors.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* --- TAB: OVERVIEW --- */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {stats.map((stat, idx) => (
                            <Card key={idx} className="bg-slate-900 border-white/5 p-6 flex flex-col justify-between">
                                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">{stat.name}</h3>
                                <div className="text-4xl font-black" style={{color: stat.color}}>{stat.value}</div>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-slate-900 border-white/5 min-h-[300px]">
                            <h3 className="text-white font-bold mb-4">توزيع المستخدمين</h3>
                            <ResponsiveContainer width="100%" height="250px">
                                <BarChart data={stats}>
                                    <XAxis dataKey="name" stroke="#475569" fontSize={10} tick={false} />
                                    <Tooltip contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px'}} cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                        {stats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                        
                        {/* Pending Approvals Quick View */}
                        <Card className="bg-slate-900 border-white/5">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Lock size={16} className="text-amber-500"/> طلبات الانضمام المعلقة
                            </h3>
                            {pendingDoctors.length === 0 ? (
                                <div className="text-center text-slate-500 py-10">لا توجد طلبات معلقة حالياً.</div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingDoctors.slice(0, 3).map(doc => (
                                        <div key={doc.uid} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-white/5">
                                            <div>
                                                <div className="font-bold text-white text-sm">{doc.name}</div>
                                                <div className="text-xs text-slate-500">{doc.doctorData?.specialty}</div>
                                            </div>
                                            <Button onClick={() => setActiveTab('doctors')} variant="secondary" className="!py-1 !px-3 !text-xs">مراجعة</Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            )}

            {/* --- TAB: DOCTORS MANAGEMENT --- */}
            {activeTab === 'doctors' && (
                <div className="animate-in fade-in space-y-8">
                     {/* 1. Pending Approvals */}
                     {pendingDoctors.length > 0 && (
                         <div className="space-y-4">
                             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                 <Lock className="text-amber-500" /> طلبات الاعتماد الجديدة
                             </h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingDoctors.map(doc => (
                                    <div key={doc.uid} className="bg-slate-900 border border-amber-500/50 p-6 rounded-2xl relative shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                                        <Badge color="amber" className="absolute top-4 left-4">قيد المراجعة</Badge>
                                        
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 text-xl font-bold">Dr</div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{doc.name}</h3>
                                                <p className="text-sm text-slate-400">{doc.doctorData?.specialty}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-950 p-3 rounded-lg text-xs text-slate-400 space-y-2 mb-6">
                                            <div className="flex justify-between border-b border-white/5 pb-1"><span>الترخيص:</span> <span className="text-white font-mono">{doc.doctorData?.licenseNumber}</span></div>
                                            <div className="flex justify-between border-b border-white/5 pb-1"><span>الهاتف:</span> <span className="text-white font-mono">{doc.doctorData?.phoneNumber}</span></div>
                                            <div className="flex justify-between"><span>الموقع:</span> <span className="text-white">{doc.doctorData?.clinicLocation}</span></div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button onClick={() => doc.uid && approveDoctor(doc.uid)} variant="success" className="flex-1 !py-2">
                                                <CheckCircle size={16} className="mr-2"/> اعتماد
                                            </Button>
                                            <Button onClick={() => doc.uid && rejectDoctor(doc.uid)} variant="danger" className="flex-1 !py-2">
                                                <XCircle size={16} className="mr-2"/> رفض
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                         </div>
                     )}

                     {/* 2. Active Doctors List & Stats */}
                     <div>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                             <Stethoscope className="text-emerald-500" /> قائمة الأطباء المعتمدين
                        </h2>
                        <Card className="bg-slate-900 border-white/5 overflow-hidden !p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-sm text-slate-400">
                                    <thead className="bg-slate-950 text-slate-500 uppercase font-bold text-xs">
                                        <tr>
                                            <th className="p-4">الطبيب</th>
                                            <th className="p-4">التخصص</th>
                                            <th className="p-4 text-center">المرضى الحاليين</th>
                                            <th className="p-4 text-center">حالات التعافي</th>
                                            <th className="p-4 text-center">المستوى</th>
                                            <th className="p-4">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {approvedDoctors.map(doc => {
                                            // حساب إحصائيات مع استخدام ?. لتجنب الأخطاء
                                            const patientCount = users.filter(u => u.patientData?.assignedDoctorId === doc.uid && !u.patientData?.isRecovered).length;
                                            const recoveredCount = users.filter(u => u.patientData?.assignedDoctorId === doc.uid && u.patientData?.isRecovered).length;
                                            
                                            // حساب المستوى
                                            const level = Math.floor(recoveredCount / 5) + 1;

                                            return (
                                                <tr key={doc.uid} className="hover:bg-slate-800/50 transition-colors">
                                                    <td className="p-4 font-bold text-white">{doc.name}</td>
                                                    <td className="p-4">{doc.doctorData?.specialty}</td>
                                                    <td className="p-4 text-center text-indigo-400 font-bold">{patientCount}</td>
                                                    <td className="p-4 text-center text-emerald-400 font-bold">{recoveredCount}</td>
                                                    <td className="p-4 text-center">
                                                        <Badge color="amber">LVL {level}</Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <Button variant="danger" className="!py-1 !px-2 !text-xs" onClick={() => toggleBan(doc)}>
                                                            {doc.isBanned ? 'فك الحظر' : 'حظر'}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                     </div>
                </div>
            )}

            {/* --- TAB: USERS MANAGEMENT --- */}
            {activeTab === 'users' && (
                <div className="space-y-4 animate-in fade-in">
                    <div className="flex bg-slate-900 p-4 rounded-2xl border border-white/5 mb-4">
                        <Search className="text-slate-500 ml-4" size={20} />
                        <input 
                            className="bg-transparent w-full text-white outline-none"
                            placeholder="بحث عن مستخدم..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {normalUsers
                            .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(user => (
                            <div key={user.uid} className="bg-slate-900/80 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-2">
                                            {user.name} 
                                            {user.isBanned && <Ban size={12} className="text-rose-500"/>}
                                        </h4>
                                        <div className="flex gap-2 mt-1">
                                            <Badge color="blue" className="!text-[9px] !px-1.5 !py-0.5">{user.role === 'patient' ? 'مريض' : 'مستخدم عادي'}</Badge>
                                            {user.patientData?.assignedDoctorName && (
                                                <span className="text-[9px] text-slate-500 flex items-center">طبيب: {user.patientData.assignedDoctorName}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button variant="secondary" className="!p-2 text-rose-500 hover:text-white hover:bg-rose-500" onClick={() => toggleBan(user)}>
                                    <Ban size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TAB: CONTENT MANAGEMENT (CMS) --- */}
            {activeTab === 'cms' && (
                <div className="animate-in fade-in space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">إدارة المحتوى</h2>
                        <Button onClick={() => setShowArticleModal(true)} variant="primary" className="!py-2 !px-4 !text-sm"><Plus size={16}/> مقال جديد</Button>
                    </div>

                    {showArticleModal && (
                         <Card className="bg-slate-900 border-indigo-500/30 mb-6">
                             <div className="space-y-4">
                                 <input 
                                     className="w-full bg-slate-950 p-3 rounded-lg text-white border border-white/10 outline-none focus:border-indigo-500" 
                                     placeholder="العنوان" 
                                     value={newArticle.title} 
                                     onChange={e => setNewArticle({...newArticle, title: e.target.value})} 
                                 />
                                 
                                 <div>
                                     <label className="text-xs text-slate-500 mb-2 block font-bold uppercase">التصنيف</label>
                                     <div className="flex gap-2">
                                         {(['medical', 'motivation', 'tip', 'news'] as const).map(cat => (
                                             <button 
                                                key={cat}
                                                onClick={() => setNewArticle({...newArticle, category: cat})}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${newArticle.category === cat ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                             >
                                                 {cat.toUpperCase()}
                                             </button>
                                         ))}
                                     </div>
                                 </div>

                                 <textarea 
                                     className="w-full bg-slate-950 p-3 rounded-lg text-white border border-white/10 h-32 outline-none focus:border-indigo-500" 
                                     placeholder="المحتوى..." 
                                     value={newArticle.content} 
                                     onChange={e => setNewArticle({...newArticle, content: e.target.value})} 
                                 />
                                 
                                 <div className="flex justify-end gap-2">
                                     <Button variant="secondary" onClick={() => setShowArticleModal(false)}>إلغاء</Button>
                                     <Button variant="success" onClick={publishArticle}>نشر</Button>
                                 </div>
                             </div>
                         </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {articles.map(art => (
                            <div key={art.id} className="bg-slate-900 p-5 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all group relative">
                                <button 
                                    onClick={() => art.id && deleteArticle(art.id)}
                                    className="absolute top-4 left-4 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16}/>
                                </button>

                                <Badge color="blue" className="mb-3">{art.category}</Badge>
                                <h3 className="font-bold text-white mb-2 line-clamp-1">{art.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-3 mb-4">{art.content}</p>
                                <div className="text-[10px] text-slate-600 font-mono">
                                    {new Date(art.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `views\ArticlesView.tsx`
```tsx
import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Article, UserProfile, ArticleCategory } from '../types';
import { PageHeader, LayoutContainer, Card, Badge, Button } from '../components/UI';
import { BookOpen, Lightbulb, Heart, Stethoscope, X, ArrowRight, Plus, PenTool } from 'lucide-react';

interface ArticlesViewProps {
    userProfile?: UserProfile | null; // نحتاج البروفايل لمعرفة الصلاحيات
}

export const ArticlesView = ({ userProfile }: ArticlesViewProps) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<'all' | ArticleCategory>('all');
    const [readingArticle, setReadingArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    // -- Create Mode State --
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'tip' as ArticleCategory });

    // -- Fetch Articles --
    const fetchArticles = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "articles"), 
                where("isPublished", "==", true),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
            setArticles(fetched);
        } catch (e) {
            console.error("Error fetching articles", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    // -- Publish Action --
    const handlePublish = async () => {
        // FIX: Store currentUser in a const to ensure it doesn't change (Typescript null check fix)
        const currentUser = auth.currentUser;

        if (!currentUser || !userProfile) return;
        if (!newArticle.title.trim() || !newArticle.content.trim()) return;

        try {
            await addDoc(collection(db, "articles"), {
                title: newArticle.title,
                content: newArticle.content,
                category: newArticle.category,
                isPublished: true,
                createdAt: Date.now(),
                authorId: currentUser.uid, // Use the constant variable
                authorName: userProfile.name,
                authorRole: userProfile.role // 'doctor' or 'admin'
            });
            
            // Reset and Refresh
            setShowCreateModal(false);
            setNewArticle({ title: '', content: '', category: 'tip' });
            fetchArticles();
            alert("تم نشر المقال بنجاح!");
        } catch (e) {
            console.error("Error publishing article:", e);
            alert("حدث خطأ أثناء النشر.");
        }
    };

    // -- Helpers --
    const filteredArticles = selectedCategory === 'all' 
        ? articles 
        : articles.filter(a => a.category === selectedCategory);

    const getCategoryIcon = (cat: string) => {
        switch(cat) {
            case 'medical': return <Stethoscope size={16} />;
            case 'motivation': return <Heart size={16} />;
            default: return <Lightbulb size={16} />;
        }
    };

    const getCategoryColor = (cat: string) => {
        switch(cat) {
            case 'medical': return 'indigo';
            case 'motivation': return 'rose';
            default: return 'amber';
        }
    };

    // هل المستخدم يملك صلاحية النشر؟
    const canPublish = userProfile?.role === 'admin' || (userProfile?.role === 'doctor' && userProfile?.doctorData?.accountStatus === 'approved');

    return (
        <LayoutContainer>
            <PageHeader 
                title="مركز المعرفة" 
                subtitle="مقالات طبية ونصائح يومية لمساعدتك في رحلة التعافي."
                action={
                    canPublish && (
                        <Button onClick={() => setShowCreateModal(true)} variant="primary" className="!py-2 !px-4 !text-sm">
                            <PenTool size={16} /> نشر مقال جديد
                        </Button>
                    )
                }
            />

            {/* Category Filters */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                {[
                    { id: 'all', label: 'الكل', icon: BookOpen },
                    { id: 'medical', label: 'طبي وعلمي', icon: Stethoscope },
                    { id: 'motivation', label: 'دعم نفسي', icon: Heart },
                    { id: 'tip', label: 'نصائح عملية', icon: Lightbulb },
                ].map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as any)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                            selectedCategory === cat.id 
                            ? 'bg-white text-slate-900 border-white shadow-lg shadow-white/10' 
                            : 'bg-slate-900 text-slate-500 border-white/5 hover:border-white/10 hover:text-white'
                        }`}
                    >
                        <cat.icon size={16} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Articles Grid */}
            {loading ? (
                <div className="text-center py-20 text-slate-500 animate-pulse">جاري تحميل المحتوى...</div>
            ) : filteredArticles.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                    <BookOpen size={48} className="mx-auto text-slate-700 mb-4"/>
                    <p className="text-slate-500">لا توجد مقالات في هذا القسم حالياً.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map(article => (
                        <div 
                            key={article.id}
                            onClick={() => setReadingArticle(article)}
                            className="group bg-slate-900 border border-white/5 rounded-[2rem] p-6 hover:border-indigo-500/30 hover:bg-slate-800 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-${getCategoryColor(article.category)}-500/10 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
                            
                            <div className="mb-4 relative z-10">
                                <Badge color={getCategoryColor(article.category) as any} className="mb-3 w-fit flex items-center gap-1">
                                    {getCategoryIcon(article.category)} {article.category.toUpperCase()}
                                </Badge>
                                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors">
                                    {article.title}
                                </h3>
                            </div>
                            
                            <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">
                                {article.content}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold">
                                        {article.authorName} {article.authorRole === 'doctor' && '(Dr)'}
                                    </span>
                                    <span className="text-[9px] text-slate-600 font-mono">
                                        {new Date(article.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <span className="flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                                    قراءة <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Article Modal (For Admins & Doctors) */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-2xl bg-slate-900 border-white/10 shadow-2xl relative">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20}/></button>
                        
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <PenTool className="text-indigo-400"/> نشر مقال جديد
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">عنوان المقال</label>
                                <input 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
                                    value={newArticle.title}
                                    onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                                    placeholder="اكتب عنواناً جذاباً..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">التصنيف</label>
                                <div className="flex gap-2">
                                    {[
                                        { id: 'medical', label: 'معلومة طبية' },
                                        { id: 'motivation', label: 'دعم نفسي' },
                                        { id: 'tip', label: 'نصيحة عملية' },
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setNewArticle({...newArticle, category: cat.id as ArticleCategory})}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                                                newArticle.category === cat.id 
                                                ? 'bg-indigo-600 border-indigo-500 text-white' 
                                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">المحتوى</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 h-40 resize-none"
                                    value={newArticle.content}
                                    onChange={e => setNewArticle({...newArticle, content: e.target.value})}
                                    placeholder="اكتب محتوى المقال هنا..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>إلغاء</Button>
                                <Button variant="success" onClick={handlePublish} disabled={!newArticle.title || !newArticle.content}>
                                    نشر الآن
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Reading Modal */}
            {readingArticle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border-white/10 shadow-2xl relative overflow-hidden !p-0">
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 bg-slate-950 border-b border-white/5 relative">
                            <button 
                                onClick={() => setReadingArticle(null)}
                                className="absolute top-6 left-6 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <Badge color={getCategoryColor(readingArticle.category) as any} className="mb-4">
                                {readingArticle.category.toUpperCase()}
                            </Badge>
                            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-2">
                                {readingArticle.title}
                            </h2>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span>بقلم: {readingArticle.authorName}</span>
                                {readingArticle.authorRole === 'doctor' && <Badge color="blue" className="!py-0 !px-1.5 !text-[9px]">طبيب</Badge>}
                                {readingArticle.authorRole === 'admin' && <Badge color="rose" className="!py-0 !px-1.5 !text-[9px]">أدمن</Badge>}
                                <span>•</span>
                                <span>{new Date(readingArticle.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-900">
                            <article className="prose prose-invert prose-lg max-w-none">
                                <p className="text-slate-300 leading-loose whitespace-pre-wrap">
                                    {readingArticle.content}
                                </p>
                            </article>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-white/5 bg-slate-950 flex justify-between items-center">
                            <p className="text-xs text-slate-600">مركز المعرفة - Islam's Guide</p>
                            <Button variant="secondary" onClick={() => setReadingArticle(null)} className="!py-2 !px-4 !text-xs">
                                إغلاق
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `views\CalendarStatsView.tsx`
```tsx
import React from 'react';
import { Card } from '../components/UI';
import { PlanDay, DailyLog } from '../types';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Smile, Activity } from 'lucide-react';

interface CalendarViewProps {
    plan: PlanDay[];
    logs: DailyLog[];
    todayDate: string;
}

export const CalendarView = ({ plan, logs, todayDate }: CalendarViewProps) => {
    const startDate = new Date(plan[0]?.date || new Date());
    const startDayIndex = (startDate.getDay() + 1) % 7;
    const blanks = Array.from({ length: startDayIndex });

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <h1 className="text-4xl font-black text-white tracking-tight">الجدول الزمني الشامل</h1>
        <Card className="overflow-hidden p-0 border-0 bg-transparent shadow-none !p-0">
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'].map(d => (
              <div key={d} className="bg-slate-900/60 p-4 text-center text-xs font-black text-slate-500 uppercase rounded-2xl">{d}</div>
            ))}
            
            {blanks.map((_, i) => <div key={`blank-${i}`} />)}

            {plan.map((day, idx) => {
              const isToday = day.date === todayDate;
              const log = logs.find(l => l.date === day.date);
              
              let bgClass = "bg-slate-900/40 border-white/5";
              if (isToday) bgClass = "bg-indigo-600 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] transform scale-105 z-10";
              else if (day.isPast) bgClass = "bg-slate-950/80 border-slate-900 opacity-40 grayscale";

              return (
                <div key={idx} className={`${bgClass} border rounded-3xl p-4 min-h-[120px] flex flex-col justify-between transition-all duration-300 hover:border-indigo-500/30 relative overflow-hidden group hover:bg-slate-900`}>
                   {isToday && <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full m-3 animate-ping"></div>}
                   {log && <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${log.mood === 'good' ? 'bg-emerald-500' : log.mood === 'bad' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>}
                  
                  <div className="flex justify-between items-start z-10">
                    <span className={`text-xs font-bold ${isToday ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                      {day.date.slice(8)}
                    </span>
                    {log && (
                      <span className="text-xl animate-in zoom-in">{log.mood === 'good' ? '🤩' : log.mood === 'bad' ? '😖' : '😐'}</span>
                    )}
                  </div>
                  <div className="text-center z-10 mt-2">
                    <span className={`text-3xl font-black ${isToday ? 'text-white' : 'text-slate-300'}`}>
                      {day.plannedDose}
                    </span>
                    <span className={`text-[9px] block uppercase tracking-wider font-bold ${isToday ? 'text-indigo-200' : 'text-slate-600'}`}>mg</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
};

interface StatsViewProps {
    logs: DailyLog[];
}

export const StatsView = ({ logs }: StatsViewProps) => {
    const moodData = [
        { name: 'ممتاز', value: logs.filter(l => l.mood === 'good').length, color: '#10b981' },
        { name: 'مستقر', value: logs.filter(l => l.mood === 'normal').length, color: '#f59e0b' },
        { name: 'سيء', value: logs.filter(l => l.mood === 'bad').length, color: '#f43f5e' },
    ].filter(d => d.value > 0);

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
          <h1 className="text-4xl font-black text-white tracking-tight">التحليل البياني</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mood Distribution */}
              <Card className="min-h-[450px] flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Smile className="w-5 h-5"/>
                      </div>
                      الحالة المزاجية العامة
                  </h3>
                  <div className="flex-1 relative">
                       {moodData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={moodData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={80}
                                      outerRadius={140}
                                      paddingAngle={8}
                                      dataKey="value"
                                      stroke="none"
                                      cornerRadius={12}
                                  >
                                      {moodData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                  </Pie>
                                  <Tooltip 
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'}}
                                      itemStyle={{color: '#fff', fontWeight: 'bold'}}
                                  />
                              </PieChart>
                          </ResponsiveContainer>
                       ) : (
                           <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-medium">
                               لا توجد بيانات كافية
                           </div>
                       )}
                  </div>
                  <div className="flex justify-center gap-8 mt-6">
                      {moodData.map((d, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-400">
                              <div className="w-4 h-4 rounded-full shadow-lg" style={{backgroundColor: d.color, boxShadow: `0 0 10px ${d.color}40`}}></div>
                              {d.name}
                          </div>
                      ))}
                  </div>
              </Card>

              {/* Adherence Chart */}
              <Card className="min-h-[450px] flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Activity className="w-5 h-5"/>
                      </div>
                       سجل الجرعات
                  </h3>
                  <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={logs.slice(-14)}> {/* Last 14 logs */}
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="date" tickFormatter={(str) => str.slice(8)} stroke="#475569" tick={{fill: '#475569', fontSize: 10}} axisLine={false} tickLine={false} dy={10} />
                              <YAxis stroke="#475569" tick={{fill: '#475569', fontSize: 10}} axisLine={false} tickLine={false} dx={-10} />
                              <Tooltip 
                                  cursor={{fill: '#1e293b', opacity: 0.5}}
                                  contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px'}}
                              />
                              <Bar dataKey="doseTaken" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={28}>
                                {logs.slice(-14).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="url(#colorGradientBar)" />
                                ))}
                              </Bar>
                              <defs>
                                <linearGradient id="colorGradientBar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#818cf8" />
                                </linearGradient>
                              </defs>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </Card>
          </div>
      </div>
    );
};
```
---

### File: `views\CalendarView.tsx`
```tsx
import React from 'react';
import { Card, PageHeader, LayoutContainer, Badge } from '../components/UI';
import { PlanDay, DailyLog, UserProfile } from '../types';
import { Check, X, Stethoscope, BrainCircuit, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
    plan: PlanDay[];
    logs: DailyLog[];
    todayDate: string;
    userProfile?: UserProfile | null; 
}

export const CalendarView = ({ plan, logs, todayDate, userProfile }: CalendarViewProps) => {
    // تحديد تاريخ البداية لحساب الفراغات في التقويم
    const startDate = new Date(plan[0]?.date || new Date());
    const startDayIndex = (startDate.getDay() + 1) % 7; // ضبط الترتيب ليبدأ من السبت
    const blanks = Array.from({ length: startDayIndex });

    // تحديد الوحدة بناءً على الملف الشخصي
    const unitLabel = userProfile?.medUnit || 'mg';
    
    // هل الخطة طبية أم خوارزمية؟
    const isDoctorPlan = userProfile?.planType === 'manual';

    return (
      <LayoutContainer>
        <PageHeader 
            title="الجدول الزمني"
            subtitle="خارطة الطريق نحو التعافي."
            action={
                <div className="flex gap-2">
                    {isDoctorPlan ? (
                        <Badge color="indigo" className="!text-sm !py-2 !px-4">
                            <Stethoscope size={16} className="mr-2" /> خطة الطبيب المعالج
                        </Badge>
                    ) : (
                        <Badge color="emerald" className="!text-sm !py-2 !px-4">
                            <BrainCircuit size={16} className="mr-2" /> الخوارزمية الذكية
                        </Badge>
                    )}
                </div>
            }
        />
        
        <Card className="overflow-hidden bg-slate-900/50 border border-white/5 shadow-2xl !p-6">
          {/* Legend / مفتاح الخريطة */}
          <div className="flex flex-wrap gap-4 mb-6 text-xs text-slate-400 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-600"></div> اليوم الحالي</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> تم الالتزام</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div> لم يتم الالتزام</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-800 border border-white/10"></div> القادم</div>
          </div>

          {/* ترويسة أيام الأسبوع */}
          <div className="grid grid-cols-7 gap-2 md:gap-4 mb-3">
            {['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'].map(d => (
              <div key={d} className="bg-slate-950/50 p-2 md:p-3 text-center text-[10px] md:text-xs font-bold text-slate-500 rounded-xl">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {/* الأيام الفارغة في بداية الشهر/الجدول */}
            {blanks.map((_, i) => <div key={`blank-${i}`} className="min-h-[80px]" />)}

            {plan.map((day, idx) => {
              const isToday = day.date === todayDate;
              const log = logs.find(l => l.date === day.date);
              const isPast = day.date < todayDate;
              
              // منطق الألوان
              let bgClass = "bg-slate-900/40 border-white/5";
              let textClass = "text-slate-500";
              let borderClass = "border-white/5";

              if (isToday) {
                  bgClass = "bg-indigo-600/10";
                  borderClass = "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]";
                  textClass = "text-white";
              } else if (log) {
                  // إذا تم تسجيل اليوم
                  if (log.doseTaken <= day.plannedDose) { // التزام جيد
                      bgClass = "bg-emerald-900/10";
                      borderClass = "border-emerald-500/30";
                  } else { // تجاوز الجرعة
                      bgClass = "bg-rose-900/10";
                      borderClass = "border-rose-500/30";
                  }
              } else if (isPast) {
                  // يوم ماضي بدون تسجيل
                  bgClass = "bg-slate-950/30";
                  textClass = "text-slate-600";
                  borderClass = "border-dashed border-slate-700";
              }

              return (
                <div key={idx} className={`${bgClass} border ${borderClass} rounded-2xl p-2 md:p-3 min-h-[80px] md:min-h-[110px] flex flex-col justify-between transition-all duration-300 relative group`}>
                   {/* Header: Day & Status Icon */}
                   <div className="flex justify-between items-start">
                        <span className={`text-[10px] md:text-xs font-bold ${textClass}`}>
                            {day.date.slice(8)}
                        </span>
                        
                        {log && (
                            <span className={log.doseTaken <= day.plannedDose ? "text-emerald-400" : "text-rose-400"}>
                                {log.doseTaken <= day.plannedDose ? <Check size={14} /> : <X size={14} />}
                            </span>
                        )}
                        {isToday && !log && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>}
                   </div>
                  
                  {/* Content: Dose */}
                  <div className="text-center mt-1">
                    <span className={`text-lg md:text-2xl font-black ${isToday ? 'text-white' : isPast && !log ? 'text-slate-600' : 'text-slate-300'}`}>
                      {day.plannedDose}
                    </span>
                    <span className="text-[8px] md:text-[10px] block uppercase text-slate-600 font-bold">
                        {unitLabel}
                    </span>
                  </div>

                  {/* Mood Indicator (Bottom Bar) */}
                  {log && (
                      <div className={`h-1 w-full rounded-full mt-2 ${
                          log.mood === 'good' ? 'bg-emerald-500' : 
                          log.mood === 'bad' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </LayoutContainer>
    );
};
```
---

### File: `views\CommunityView.tsx`
```tsx
import React, { useEffect, useState, useRef } from 'react';
import { 
    collection, query, orderBy, limit, onSnapshot, addDoc, doc, deleteDoc, where 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, ChatRoom, ChatMessage } from '../types';
import { LayoutContainer, Card, Button, Badge } from '../components/UI';
import { useLanguage } from '../contexts/LanguageContext';
import { 
    Trophy, Users, MessageCircle, Plus, Trash2, Send, Globe, Crown, 
    ShieldCheck, Pill, FlaskConical, Zap, Stethoscope, Lock 
} from 'lucide-react';

interface CommunityViewProps {
    currentUser: UserProfile;
}

export const CommunityView = ({ currentUser }: CommunityViewProps) => {
    const { t } = useLanguage();
    const [tab, setTab] = useState<'rooms' | 'leaderboard'>('rooms');
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
    
    // Create Room State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");

    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    // 1. جلب غرف الدردشة (Smart Filtering)
    useEffect(() => {
        const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allRooms: ChatRoom[] = [];
            snapshot.forEach((doc) => allRooms.push({ id: doc.id, ...doc.data() } as ChatRoom));
            
            // تصفية الغرف بناءً على الصلاحيات
            const filteredRooms = allRooms.filter(room => {
                // الأدمن يرى كل شيء
                if (currentUser.role === 'admin') return true;

                // الغرف العامة تظهر للكل
                if (!room.isDoctorRoom) return true;

                // غرف الأطباء الخاصة
                if (currentUser.role === 'doctor') {
                    // الطبيب يرى غرفته الخاصة فقط
                    return room.doctorId === currentUser.uid;
                }

                if (currentUser.role === 'patient') {
                    // المريض يرى غرفة طبيبه المعالج فقط
                    return room.doctorId === currentUser.patientData?.assignedDoctorId;
                }

                // المستخدم العادي لا يرى غرف الأطباء
                return false;
            });

            setRooms(filteredRooms);
        });
        return () => unsubscribe();
    }, [currentUser]);

    // 2. جلب لوحة المتصدرين (Top 20 by Progress)
    useEffect(() => {
        if (tab === 'leaderboard') {
            const q = query(collection(db, "users"), orderBy("progress", "desc"), limit(20));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const u: UserProfile[] = [];
                snapshot.forEach((doc) => u.push({ ...doc.data(), uid: doc.id } as UserProfile));
                setLeaderboard(u);
            });
            return () => unsubscribe();
        }
    }, [tab]);

    // 3. جلب الرسائل عند دخول غرفة
    useEffect(() => {
        if (!activeRoom) return;
        const q = query(collection(db, "rooms", activeRoom.id, "messages"), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const m: ChatMessage[] = [];
            snapshot.forEach((doc) => m.push({ id: doc.id, ...doc.data() } as ChatMessage));
            setMessages(m);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });
        return () => unsubscribe();
    }, [activeRoom]);

    // --- Actions ---

    const createRoom = async () => {
        if (!newRoomName.trim()) return;
        
        const isDoctor = currentUser.role === 'doctor';
        
        await addDoc(collection(db, "rooms"), {
            name: newRoomName,
            createdBy: currentUser.uid,
            creatorName: currentUser.name,
            language: 'mixed',
            createdAt: Date.now(),
            // Doctor logic
            isDoctorRoom: isDoctor,
            doctorId: isDoctor ? currentUser.uid : null
        });
        
        setNewRoomName("");
        setShowCreateModal(false);
    };

    const deleteRoom = async (roomId: string) => {
        if (confirm("هل أنت متأكد من حذف هذه الغرفة؟ سيتم حذف جميع الرسائل.")) {
            await deleteDoc(doc(db, "rooms", roomId));
            if (activeRoom?.id === roomId) setActiveRoom(null);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeRoom) return;
        
        await addDoc(collection(db, "rooms", activeRoom.id, "messages"), {
            text: newMessage,
            senderId: currentUser.uid,
            senderName: currentUser.name,
            timestamp: Date.now(),
            // Flags for UI styling
            role: currentUser.role,
            isDoctor: currentUser.role === 'doctor',
            isAdmin: currentUser.role === 'admin'
        });
        setNewMessage("");
    };

    return (
            <LayoutContainer className="h-[calc(100vh-140px)] flex flex-col">
            {/* Tabs */}
            <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-white/5 mb-4 shrink-0">
                <button 
                    onClick={() => {setTab('rooms'); setActiveRoom(null);}} 
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'rooms' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <MessageCircle size={18} /> {t('comm_rooms')}
                </button>
                <button 
                    onClick={() => setTab('leaderboard')} 
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'leaderboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <Trophy size={18} /> {t('comm_leaderboard')}
                </button>
            </div>

            {/* LEADERBOARD TAB */}
            {tab === 'leaderboard' && (
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                    {leaderboard.map((user, idx) => {
                        let rankColor = 'bg-slate-800 text-slate-400';
                        let borderClass = 'border-white/5';
                        if (idx === 0) { rankColor = 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-amber-500/20 shadow-lg'; borderClass = 'border-amber-500/30'; }
                        else if (idx === 1) { rankColor = 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-500/20 shadow-lg'; borderClass = 'border-slate-400/30'; }
                        else if (idx === 2) { rankColor = 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-orange-500/20 shadow-lg'; borderClass = 'border-orange-500/30'; }

                        const MedIcon = user.medForm === 'liquid' ? FlaskConical : Pill;

                        return (
                            <div key={idx} className={`flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border ${borderClass} relative overflow-hidden group`}>
                                {idx < 3 && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-black text-xl ${rankColor}`}>
                                        {idx === 0 ? <Crown size={24} /> : idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white flex items-center gap-2">
                                            {user.name} 
                                            {user.role === 'admin' && <ShieldCheck size={14} className="text-rose-400" />}
                                            {user.role === 'doctor' && <Stethoscope size={14} className="text-blue-400" />}
                                        </p>
                                        <div className="flex gap-2 mt-1">
                                            {user.medType && (
                                                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 flex items-center gap-1">
                                                    <MedIcon size={10} /> {user.medType}
                                                </span>
                                            )}
                                            {user.streak ? (
                                                <span className="text-[10px] text-amber-500 flex items-center gap-1 font-bold">
                                                    <Zap size={10} /> {user.streak} days
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right relative z-10">
                                    <span className="text-2xl font-black text-white">{Math.round(user.progress || 0)}<span className="text-sm text-slate-500">%</span></span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ROOMS TAB (List) */}
            {tab === 'rooms' && !activeRoom && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Globe size={20} className="text-indigo-400"/> الغرف المتاحة</h2>
                        {/* فقط الأدمن والطبيب يمكنهم إنشاء غرف */}
                        {(currentUser.role === 'admin' || currentUser.role === 'doctor') && (
                            <Button variant="success" onClick={() => setShowCreateModal(true)} className="!py-2 !px-4 !text-xs !rounded-full">
                                <Plus size={16} /> {t('create_room')}
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pb-20 custom-scrollbar pr-1">
                        {rooms.map(room => (
                            <div key={room.id} onClick={() => setActiveRoom(room)} className={`bg-slate-900 border p-5 rounded-2xl hover:bg-slate-800 transition-all cursor-pointer group relative flex flex-col justify-between h-32 ${room.isDoctorRoom ? 'border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-white/5'}`}>
                                <div className="flex justify-between items-start">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${room.isDoctorRoom ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                                        {room.isDoctorRoom ? <Stethoscope size={20} /> : <MessageCircle size={20} />}
                                    </div>
                                    {(currentUser.uid === room.createdBy || currentUser.role === 'admin') && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                                            className="p-2 hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 rounded-full transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white truncate flex items-center gap-2">
                                        {room.name}
                                        {room.isDoctorRoom && <Lock size={12} className="text-indigo-400"/>}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                        {room.isDoctorRoom ? 'عيادة خاصة' : `By ${room.creatorName}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Create Room Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                            <Card className="w-full max-w-sm bg-slate-900 border-white/10 shadow-2xl">
                                <h3 className="text-lg font-bold text-white mb-4">
                                    {currentUser.role === 'doctor' ? 'إنشاء غرفة للمرضى' : t('create_room')}
                                </h3>
                                <input 
                                    className="w-full bg-slate-950 p-4 rounded-xl border border-white/10 text-white mb-4 outline-none focus:border-indigo-500"
                                    placeholder={t('room_name')}
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                />
                                {currentUser.role === 'doctor' && (
                                    <p className="text-xs text-indigo-400 mb-4 bg-indigo-500/10 p-2 rounded-lg">
                                        * سيتمكن جميع مرضاك الحاليين والمستقبليين من دخول هذه الغرفة تلقائياً.
                                    </p>
                                )}
                                <div className="flex gap-2 justify-end">
                                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>{t('close')}</Button>
                                    <Button variant="primary" onClick={createRoom}>{t('create_room')}</Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* CHAT INTERFACE */}
            {tab === 'rooms' && activeRoom && (
                <div className="flex-1 flex flex-col h-full bg-slate-900 rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/80 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${activeRoom.isDoctorRoom ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                                {activeRoom.isDoctorRoom ? <Stethoscope size={16}/> : <MessageCircle size={16} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">{activeRoom.name}</h3>
                                <span className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online</span>
                            </div>
                        </div>
                        <Button variant="secondary" className="!py-1.5 !px-3 !text-xs !rounded-full" onClick={() => setActiveRoom(null)}>
                            {t('close')}
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 pt-20 space-y-4 custom-scrollbar">
                        {messages.map((msg, i) => {
                            const isMe = msg.senderId === currentUser.uid;
                            const showAvatar = i === 0 || messages[i-1].senderId !== msg.senderId;
                            
                            // Styling based on role
                            let bubbleClass = 'bg-slate-800 text-slate-200';
                            if (isMe) bubbleClass = 'bg-indigo-600 text-white';
                            else if (msg.isDoctor || msg.role === 'doctor') bubbleClass = 'bg-blue-900/40 border border-blue-500/30 text-blue-100';
                            else if (msg.isAdmin || msg.role === 'admin') bubbleClass = 'bg-rose-900/40 border border-rose-500/30 text-rose-100';

                            return (
                                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${showAvatar ? (isMe ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300') : 'opacity-0'}`}>
                                        {msg.senderName.charAt(0).toUpperCase()}
                                    </div>

                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                        {showAvatar && !isMe && (
                                            <span className="text-[10px] text-slate-500 mb-1 ml-1 flex items-center gap-1">
                                                {msg.senderName}
                                                {msg.role === 'doctor' && <Badge color="blue" className="!text-[8px] !px-1.5 !py-0">DR</Badge>}
                                                {msg.role === 'admin' && <Badge color="rose" className="!text-[8px] !px-1.5 !py-0">ADMIN</Badge>}
                                            </span>
                                        )}
                                        
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${bubbleClass} ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[9px] text-slate-600 mt-1 px-1 opacity-70">
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-slate-950/80 border-t border-white/5 flex gap-2 backdrop-blur-md">
                        <input 
                            className="flex-1 bg-slate-900 border border-white/10 rounded-full px-5 py-3 text-white text-sm outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all placeholder-slate-600"
                            placeholder={t('type_msg')}
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        />
                        <button 
                            onClick={sendMessage} 
                            disabled={!newMessage.trim()}
                            className="p-3 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `views\DashboardView.tsx`
```tsx
import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle, AlertTriangle, Smile, Meh, Frown, Clock, HeartPulse, Moon, FileText, PauseCircle,
  FlaskConical, Pill, Edit3, Stethoscope, Info
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Button, Card, ProgressRing, PageHeader, LayoutContainer, BreathingModal, DoctorReportModal, LanguageSwitcher, Badge } from '../components/UI';
import { UserProfile, PlanDay, DailyLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardViewProps {
  userProfile: UserProfile | null;
  plan: PlanDay[];
  logs: DailyLog[];
  todayPlan: PlanDay | undefined;
  todayLog: DailyLog | undefined;
  progressPercentage: number;
  totalDays: number;
  daysCompleted: number;
  showDoctorWarning: boolean;
  selectedDose: number | null;
  setSelectedDose: (n: number | null) => void;
  selectedMood: 'bad' | 'normal' | 'good' | null;
  setSelectedMood: (m: 'bad' | 'normal' | 'good' | null) => void;
  submitDailyLog: (sleep: number, symptoms: string[]) => void;
  handleFreezePlan: () => void;
}

export const DashboardView = ({
  userProfile, plan, logs, todayPlan, todayLog, progressPercentage, 
  totalDays, daysCompleted, showDoctorWarning, 
  selectedDose, setSelectedDose, selectedMood, setSelectedMood, submitDailyLog,
  handleFreezePlan
}: DashboardViewProps) => {
  const { t } = useLanguage();
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // Custom Dose Input State
  const [isCustomDose, setIsCustomDose] = useState(false);
  const [customDoseValue, setCustomDoseValue] = useState<string>('');
  
  const [sleepHours, setSleepHours] = useState(7);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Derived Values
  const unitLabel = userProfile?.medUnit || 'mg';
  const isLiquid = userProfile?.medForm === 'liquid';
  
  // هل المستخدم يتبع طبيباً؟
  const isPatient = userProfile?.role === 'patient';
  const isManualPlan = userProfile?.planType === 'manual';
  const doctorName = userProfile?.patientData?.assignedDoctorName;

  const toggleSymptom = (sym: string) => {
      if (selectedSymptoms.includes(sym)) {
          setSelectedSymptoms(prev => prev.filter(s => s !== sym));
      } else {
          setSelectedSymptoms(prev => [...prev, sym]);
      }
  };

  const symptomOptions = [
      { id: 'insomnia', label: t('sym_insomnia') },
      { id: 'anxiety', label: t('sym_anxiety') },
      { id: 'sweating', label: t('sym_sweating') },
      { id: 'shake', label: t('sym_shake') },
      { id: 'nausea', label: t('sym_nausea') },
      { id: 'headache', label: t('sym_headache') },
  ];

  // Generate dose options smart based on current plan
  const target = todayPlan?.plannedDose || 0;
  
  const baseStep = isLiquid ? 0.1 : 0.5; 
  
  // Create a range of options around the target dose
  const doseOptions = Array.from({ length: 7 }, (_, i) => {
      const val = target - (3 * baseStep) + (i * baseStep);
      return Math.max(0, parseFloat(val.toFixed(2))); 
  }).filter((v, i, a) => a.indexOf(v) === i && v >= 0); 

  if (!doseOptions.includes(target)) doseOptions.push(target);
  doseOptions.sort((a,b) => a - b);

  return (
    <LayoutContainer>
      <BreathingModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
      <DoctorReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        userProfile={userProfile} 
        logs={logs} 
        plan={plan} 
      />
      
      <PageHeader 
        title={t('daily_report')}
        subtitle={`${t('welcome')} ${userProfile?.name}`}
        action={
            <div className="flex flex-wrap gap-4 items-center">
                <div className="hidden md:block"><LanguageSwitcher /></div>
                <Button onClick={() => setIsReportOpen(true)} variant="secondary" className="!py-2 !px-4 !text-sm !rounded-full">
                    <FileText size={16} /> {t('export_report')}
                </Button>
                <Button variant="panic" onClick={() => setIsSosOpen(true)} className="!py-2 !px-4 !text-sm !rounded-full">
                    <HeartPulse size={16} /> {t('sos_button')}
                </Button>
            </div>
        }
      />

      {/* Patient Specific Banner - يظهر فقط للمرضى التابعين لطبيب */}
      {isPatient && (
          <div className="bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between mb-6 backdrop-blur-md animate-in slide-in-from-top-2">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 ring-1 ring-indigo-500/40">
                      <Stethoscope size={24} />
                  </div>
                  <div>
                      <p className="text-xs text-indigo-300 font-bold uppercase mb-1">تحت إشراف طبي</p>
                      <p className="text-white font-bold text-lg flex items-center gap-2">
                          د. {doctorName}
                          <Badge color="blue" className="!text-[10px] !py-0">معتمد</Badge>
                      </p>
                  </div>
              </div>
              <div className="text-left hidden md:block">
                  <span className="text-[10px] text-slate-400 block">نوع الخطة</span>
                  <span className="text-xs font-bold text-white">جدول طبي مخصص</span>
              </div>
          </div>
      )}

      {/* Safety Warning & Freeze Option */}
      {/* يظهر فقط لمستخدمي الخوارزمية، لأن المريض يجب أن يراجع طبيبه في حالات الخطر */}
      {showDoctorWarning && !isManualPlan && (
        <div className="bg-rose-500/5 border border-rose-500/20 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md animate-in zoom-in duration-500 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500/20 p-4 rounded-full ring-1 ring-rose-500/30"><AlertTriangle className="text-rose-500 w-6 h-6" /></div>
            <div>
                <h3 className="font-bold text-rose-400 text-lg mb-1">{t('safety_active')}</h3>
                <p className="text-rose-200/70 text-sm max-w-lg">{t('safety_desc')}</p>
            </div>
          </div>
          <Button onClick={handleFreezePlan} className="!bg-rose-500 hover:!bg-rose-600 !border-rose-400 w-full md:w-auto">
             <PauseCircle size={18} /> {t('freeze_plan_btn')}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Action Card */}
        <Card className="lg:col-span-8 bg-gradient-to-br from-[#0f172a] via-[#101626] to-indigo-950/20 min-h-[550px] flex flex-col justify-between !p-8 md:!p-10 border-indigo-500/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            {/* Top Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> {t('target_dose')}
                    </h2>
                    <div className="flex items-baseline gap-2 group cursor-default">
                        <span className="text-7xl md:text-9xl font-black text-white tracking-tighter drop-shadow-2xl group-hover:text-indigo-100 transition-colors duration-500">
                            {todayPlan ? todayPlan.plannedDose : 0}
                        </span>
                        <span className="text-2xl text-slate-600 font-bold group-hover:text-slate-500 transition-colors">{unitLabel}</span>
                    </div>
                </div>
                
                <div className="hidden md:block scale-110">
                     <ProgressRing radius={70} stroke={8} progress={progressPercentage} totalSteps={totalDays - daysCompleted} />
                </div>
            </div>

            {/* Interaction Section */}
            {todayLog ? (
              <div className="mt-8 bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2rem] flex items-center justify-between backdrop-blur-md animate-in zoom-in slide-in-from-bottom-4 duration-700">
                <div>
                  <p className="text-emerald-400 font-bold text-2xl mb-2">{t('documented')}</p>
                  <div className="space-y-1 text-sm">
                     <p className="text-slate-400 font-medium">{t('dose')}: <span className="text-white font-mono font-bold">{todayLog.doseTaken}{unitLabel}</span></p>
                     <p className="text-slate-400 font-medium">{t('mood')}: <span className="text-white">{todayLog.mood === 'good' ? t('excellent') : todayLog.mood === 'normal' ? t('stable') : t('bad')}</span></p>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-full flex items-center justify-center ring-4 ring-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="text-emerald-500 w-8 h-8" />
                </div>
              </div>
            ) : (
              <div className="mt-8 space-y-8">
                 {/* Step 1: Dose Selector */}
                 <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${selectedDose ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>1</span>
                        {t('step_1')}
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {/* Standard Options */}
                        {!isCustomDose && doseOptions.map(val => (
                        <button 
                            key={val}
                            onClick={() => setSelectedDose(val)}
                            className={`min-w-[5rem] h-16 rounded-xl border transition-all font-mono font-bold text-lg flex items-center justify-center relative group overflow-hidden ${
                                selectedDose === val 
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105 z-10' 
                                : 'bg-slate-800/30 border-white/5 text-slate-500 hover:bg-slate-800 hover:border-indigo-500/30 hover:text-indigo-300'
                            }`}
                        >
                            <span className="relative z-10">{val}</span>
                            {val === todayPlan?.plannedDose && (
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_10px_indigo]"></span>
                            )}
                        </button>
                        ))}
                        
                        {/* Custom Input Toggle */}
                        <button 
                             onClick={() => setIsCustomDose(!isCustomDose)}
                             className={`min-w-[5rem] h-16 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1 transition-all ${
                                 isCustomDose 
                                 ? 'bg-slate-800 border-indigo-500 text-indigo-400' 
                                 : 'bg-transparent border-slate-700 text-slate-600 hover:border-slate-500'
                             }`}
                        >
                            <Edit3 size={18} />
                        </button>

                        {/* Custom Input Field */}
                        {isCustomDose && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                                <input 
                                    type="number" 
                                    className="w-20 h-16 bg-slate-800 border border-indigo-500 rounded-xl text-center text-lg font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="0.0"
                                    value={customDoseValue}
                                    onChange={(e) => {
                                        setCustomDoseValue(e.target.value);
                                        const val = parseFloat(e.target.value);
                                        if(!isNaN(val)) setSelectedDose(val);
                                    }}
                                />
                                <span className="text-slate-500 font-bold text-xs">{unitLabel}</span>
                            </div>
                        )}
                    </div>
                 </div>
                 
                 {/* Step 2: Mental & Physical State */}
                 <div className={`transition-all duration-700 transform ${selectedDose ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-8 pointer-events-none blur-sm'}`}>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${selectedMood ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>2</span>
                        {t('step_2')}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                            { id: 'bad', label: t('bad'), icon: Frown, color: 'rose' },
                            { id: 'normal', label: t('stable'), icon: Meh, color: 'amber' },
                            { id: 'good', label: t('excellent'), icon: Smile, color: 'emerald' }
                        ].map((m: any) => (
                            <button 
                                key={m.id}
                                onClick={() => setSelectedMood(m.id)}
                                className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${
                                    selectedMood === m.id
                                    ? `bg-${m.color}-500/10 border-${m.color}-500/50 text-${m.color}-400 shadow-lg scale-105`
                                    : 'bg-slate-800/30 border-white/5 text-slate-600 hover:bg-slate-800'
                                }`}
                            >
                                <m.icon className={`w-6 h-6 ${selectedMood === m.id ? 'fill-current' : ''}`} />
                                <span className="text-[9px] font-bold uppercase">{m.label}</span>
                            </button>
                        ))}
                    </div>

                    {selectedMood && (
                        <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-2">
                                    <Moon size={12} /> {t('sleep_label')}: <span className="text-white text-sm font-mono">{sleepHours}h</span>
                                </label>
                                <input 
                                    type="range" min="0" max="12" step="0.5" 
                                    value={sleepHours} 
                                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {symptomOptions.map(sym => (
                                    <button 
                                        key={sym.id}
                                        onClick={() => toggleSymptom(sym.label)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                            selectedSymptoms.includes(sym.label) 
                                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' 
                                            : 'bg-slate-800 text-slate-500 border-transparent hover:border-slate-600'
                                        }`}
                                    >
                                        {sym.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                 </div>

                 {/* Step 3: Confirm Button */}
                 <div className={`transition-all duration-700 ${selectedDose && selectedMood ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                     <Button 
                        variant="success" 
                        className="w-full py-4 text-lg rounded-2xl shadow-emerald-500/20"
                        onClick={() => submitDailyLog(sleepHours, selectedSymptoms)}
                     >
                        {t('confirm_log')}
                     </Button>
                 </div>
              </div>
            )}
          </div>
        </Card>

        {/* Side Info Cards */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="flex flex-col items-center justify-center text-center py-10 bg-slate-900/40">
                 <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center mb-4 relative border border-white/5">
                     <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping duration-[3000ms]"></div>
                     {isLiquid ? (
                        <FlaskConical className="w-8 h-8 text-indigo-400" />
                     ) : (
                        <Clock className="w-8 h-8 text-indigo-400" />
                     )}
                 </div>
                 
                 {isPatient ? (
                     <>
                        <h3 className="text-white font-bold text-lg mb-1">الخطة العلاجية الحالية</h3>
                        <p className="text-slate-500 text-xs px-4 leading-relaxed mb-3">
                            هذه الخطة تم وضعها بواسطة <strong>د. {doctorName}</strong>. أي تغيير في الجرعات يجب أن يتم بعد استشارته.
                        </p>
                        <Badge color="indigo" className="mx-auto">Fixed Plan</Badge>
                     </>
                 ) : (
                     <>
                        <h3 className="text-white font-bold text-lg mb-1">{t('algo_active')}</h3>
                        <p className="text-slate-500 text-xs px-4 leading-relaxed">
                          {t('algo_desc')}
                        </p>
                     </>
                 )}
            </Card>

            <Card className="min-h-[250px] relative overflow-hidden bg-indigo-950/10" noPadding>
                <div className="p-6 pb-0 relative z-10">
                   <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                       {t('recovery_path')} <Info size={12} className="text-slate-500"/>
                   </h2>
                   <p className="text-[10px] text-indigo-300/60 uppercase tracking-widest font-bold">Projection</p>
                </div>
                <div className="absolute inset-x-0 bottom-0 top-16 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={plan.slice(0, 14)}>
                        <defs>
                        <linearGradient id="colorDose" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <Area 
                            type="monotone" 
                            dataKey="plannedDose" 
                            stroke="#818cf8" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorDose)" 
                            animationDuration={2000}
                        />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
      </div>
    </LayoutContainer>
  );
};
```
---

### File: `views\DoctorDashboardView.tsx`
```tsx
import React, { useEffect, useState } from 'react';
import { 
    collection, query, where, getDocs, updateDoc, doc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, DailyLog } from '../types';
import { LayoutContainer, PageHeader, Card, Button, Badge } from '../components/UI';
import { 
    Users, Search, UserPlus, FileText, Activity, Moon, Smile, Frown, Meh, Calendar, ChevronLeft, X 
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export const DoctorPatientsView = () => {
    // -- State --
    const [myPatients, setMyPatients] = useState<UserProfile[]>([]);
    const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    
    // -- UI State --
    const [viewMode, setViewMode] = useState<'LIST' | 'ADD_NEW'>('LIST');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
    const [patientLogs, setPatientLogs] = useState<DailyLog[]>([]);
    
    // -- Fetch Doctor's Patients --
    const fetchMyPatients = async () => {
        // خطوة 1: تخزين المستخدم في متغير ثابت
        const currentUser = auth.currentUser;

        // خطوة 2: التحقق من المتغير
        if (!currentUser) return;
        
        setLoading(true);
        try {
            const q = query(
                collection(db, "users"), 
                // خطوة 3: استخدام المتغير currentUser.uid بدلاً من auth.currentUser.uid
                where("patientData.assignedDoctorId", "==", currentUser.uid)
            );
            const snapshot = await getDocs(q);
            const list: UserProfile[] = [];
            snapshot.forEach(d => list.push({ uid: d.id, ...d.data() } as UserProfile));
            setMyPatients(list);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        fetchMyPatients();
    }, []);

    // -- Fetch Available Users (For Adding) --
    const fetchAvailableUsers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "users")); 
            const snapshot = await getDocs(q);
            const list: UserProfile[] = [];
            
            snapshot.forEach(d => {
                const data = d.data() as UserProfile;
                const hasDoctor = data.patientData?.assignedDoctorId;
                const isStaff = data.role === 'doctor' || data.role === 'admin';
                
                if (!hasDoctor && !isStaff) {
                    list.push({ uid: d.id, ...data });
                }
            });
            setAvailableUsers(list);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleAddPatient = async (user: UserProfile) => {
        // نفس الإصلاح هنا
        const currentUser = auth.currentUser;

        if (!currentUser || !user.uid) return;
        
        if (!confirm(`هل تريد ضم المستخدم ${user.name} إلى قائمة مرضاك؟`)) return;

        try {
            await updateDoc(doc(db, "users", user.uid), {
                role: 'patient',
                patientData: {
                    // استخدام currentUser.uid هنا
                    assignedDoctorId: currentUser.uid,
                    assignedDoctorName: currentUser.displayName || 'Doctor',
                    isPlanAssigned: false, 
                    isRecovered: false
                },
            });
            
            setAvailableUsers(prev => prev.filter(u => u.uid !== user.uid));
            setMyPatients(prev => [...prev, { 
                ...user, 
                role: 'patient', 
                patientData: { 
                    // استخدام currentUser.uid هنا أيضاً
                    assignedDoctorId: currentUser.uid, 
                    assignedDoctorName: currentUser.displayName || 'Doctor', 
                    isPlanAssigned: false, 
                    isRecovered: false 
                } 
            }]);
            
            alert("تم إضافة المريض بنجاح.");
            setViewMode('LIST');
        } catch (e) {
            console.error("Error adding patient:", e);
        }
    };

    // -- Inspect Patient Details --
    const openPatientDetails = async (patient: UserProfile) => {
        if (!patient.uid) return;
        setSelectedPatient(patient);
        setPatientLogs([]); 
        
        try {
            const d = await getDoc(doc(db, "users", patient.uid));
            if (d.exists()) {
                const data = d.data();
                setPatientLogs(data.logs || []);
            }
        } catch (e) { console.error(e); }
    };

    // -- Filtering --
    const filteredAvailable = availableUsers.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredMyPatients = myPatients.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <LayoutContainer>
            <PageHeader 
                title="إدارة ملفات المرضى" 
                subtitle="متابعة الحالات وإضافة مرضى جدد للعيادة."
                action={
                    viewMode === 'LIST' ? (
                        <Button onClick={() => { setViewMode('ADD_NEW'); fetchAvailableUsers(); }} variant="primary">
                            <UserPlus size={18} /> ضم مريض جديد
                        </Button>
                    ) : (
                        <Button onClick={() => setViewMode('LIST')} variant="secondary">
                            <ChevronLeft size={18} /> العودة للقائمة
                        </Button>
                    )
                }
            />

            {/* --- ADD NEW PATIENT MODE --- */}
            {viewMode === 'ADD_NEW' && (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <Card className="bg-slate-900 border-white/5 mb-6">
                        <h3 className="text-xl font-bold text-white mb-4">البحث عن مستخدمين لضمهم</h3>
                        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-white/5 mb-6">
                            <Search className="text-slate-500" />
                            <input 
                                className="bg-transparent w-full text-white outline-none placeholder-slate-600"
                                placeholder="بحث عن مستخدم بالاسم أو البريد..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {filteredAvailable.length === 0 && (
                                <p className="text-slate-500 text-center col-span-2 py-8">لا يوجد مستخدمين متاحين للبحث الحالي.</p>
                            )}
                            {filteredAvailable.map(user => (
                                <div key={user.uid} className="flex justify-between items-center p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{user.name}</h4>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                            <div className="flex gap-2 mt-1">
                                                <Badge color="blue" className="!text-[9px] !py-0">{user.medType || 'غير محدد'}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button onClick={() => handleAddPatient(user)} variant="success" className="!py-2 !px-3 !text-xs">
                                        <UserPlus size={14} className="mr-1"/> ضم
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* --- MY PATIENTS LIST MODE --- */}
            {viewMode === 'LIST' && (
                <div className="animate-in fade-in">
                    <div className="mb-6 relative">
                         <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500" size={18} />
                         <input 
                            className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-12 text-white outline-none focus:border-indigo-500 transition-all"
                            placeholder="بحث في مرضاك..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                         />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredMyPatients.map(patient => (
                            <div 
                                key={patient.uid} 
                                onClick={() => openPatientDetails(patient)}
                                className="bg-slate-900 border border-white/5 p-6 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800 cursor-pointer transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 font-bold text-xl">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{patient.name}</h3>
                                            <p className="text-sm text-slate-500">{patient.email}</p>
                                        </div>
                                    </div>
                                    <Badge color={patient.patientData?.isRecovered ? 'green' : patient.patientData?.isPlanAssigned ? 'indigo' : 'amber'}>
                                        {patient.patientData?.isRecovered ? 'متعافي' : patient.patientData?.isPlanAssigned ? 'نشط' : 'بانتظار الخطة'}
                                    </Badge>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                    <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
                                        <span className="block text-[10px] text-slate-500 uppercase">التقدم</span>
                                        <span className="block font-bold text-indigo-400">{Math.round(patient.progress || 0)}%</span>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
                                        <span className="block text-[10px] text-slate-500 uppercase">المراحل</span>
                                        <span className="block font-bold text-white">{patient.patientData?.isPlanAssigned ? 'جارية' : '-'}</span>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
                                        <span className="block text-[10px] text-slate-500 uppercase">آخر ظهور</span>
                                        <span className="block font-bold text-slate-300 text-[10px] mt-1">
                                            {patient.lastActive ? new Date(patient.lastActive).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- PATIENT DETAILS MODAL (FULL STATS) --- */}
            {selectedPatient && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-5xl h-[90vh] flex flex-col bg-slate-900 border-white/10 shadow-2xl relative !p-0 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 bg-slate-950 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedPatient.name}</h2>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <FileText size={12}/> {selectedPatient.medType || 'غير محدد'} • {selectedPatient.medForm} • {selectedPatient.medUnit}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPatient(null)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 custom-scrollbar">
                            {/* LEFT COLUMN: CHARTS */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="bg-slate-950 border-white/5">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Activity size={16} className="text-indigo-400"/> سجل الالتزام بالجرعات</h3>
                                    <div className="h-64 w-full">
                                        {patientLogs.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={patientLogs.slice(-30)}>
                                                    <defs>
                                                        <linearGradient id="colorDoseP" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                    <XAxis dataKey="date" hide />
                                                    <YAxis stroke="#475569" fontSize={10} />
                                                    <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b'}} />
                                                    <Area type="monotone" dataKey="doseTaken" stroke="#6366f1" fill="url(#colorDoseP)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-slate-600">لا توجد سجلات متاحة</div>
                                        )}
                                    </div>
                                </Card>
                            </div>

                            {/* RIGHT COLUMN: STATS & LOGS */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-slate-950 p-4 rounded-xl border border-white/5 text-center">
                                         <span className="text-xs text-slate-500 uppercase block mb-1">متوسط النوم</span>
                                         <span className="text-xl font-bold text-white flex items-center justify-center gap-1">
                                             <Moon size={16} className="text-blue-400"/> 
                                             {patientLogs.length > 0 
                                                ? (patientLogs.reduce((a,b) => a + (b.sleepHours || 0), 0) / patientLogs.length).toFixed(1) 
                                                : '-'}h
                                         </span>
                                     </div>
                                     <div className="bg-slate-950 p-4 rounded-xl border border-white/5 text-center">
                                         <span className="text-xs text-slate-500 uppercase block mb-1">المزاج العام</span>
                                         <span className="text-xl font-bold text-white flex items-center justify-center gap-1">
                                             <Smile size={16} className="text-emerald-400"/>
                                             Good
                                         </span>
                                     </div>
                                </div>

                                <Card className="bg-slate-900 border-white/5 flex-1 max-h-[400px] overflow-hidden flex flex-col">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 sticky top-0 bg-slate-950 pb-2"><Calendar size={16} className="text-indigo-400"/> السجل اليومي</h3>
                                    <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2 pr-2">
                                        {patientLogs.slice().reverse().map((log, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-900 border border-white/5 text-xs">
                                                <span className="text-slate-400">{log.date}</span>
                                                <span className="font-bold text-white">{log.doseTaken} {selectedPatient.medUnit}</span>
                                                <span>
                                                    {log.mood === 'good' ? <Smile size={14} className="text-emerald-500"/> : 
                                                     log.mood === 'bad' ? <Frown size={14} className="text-rose-500"/> : 
                                                     <Meh size={14} className="text-amber-500"/>}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `views\DoctorPatientsView.tsx`
```tsx
import React, { useEffect, useState } from 'react';
import { 
    collection, query, where, getDocs, updateDoc, doc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, DailyLog, PlanDay } from '../types';
import { LayoutContainer, PageHeader, Card, Button, Badge } from '../components/UI';
import { 
    Users, Search, UserPlus, FileText, Activity, Moon, Smile, Frown, Meh, Calendar, ChevronLeft, ChevronRight, X 
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export const DoctorPatientsView = () => {
    // -- State --
    const [myPatients, setMyPatients] = useState<UserProfile[]>([]);
    const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    
    // -- UI State --
    const [viewMode, setViewMode] = useState<'LIST' | 'ADD_NEW'>('LIST');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
    const [patientLogs, setPatientLogs] = useState<DailyLog[]>([]);
    
    // -- Fetch Doctor's Patients --
    const fetchMyPatients = async () => {
        if (!auth.currentUser) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, "users"), 
                where("patientData.assignedDoctorId", "==", auth.currentUser.uid)
            );
            const snapshot = await getDocs(q);
            const list: UserProfile[] = [];
            snapshot.forEach(d => list.push({ uid: d.id, ...d.data() } as UserProfile));
            setMyPatients(list);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        fetchMyPatients();
    }, []);

    // -- Fetch Available Users (For Adding) --
    // يجلب المستخدمين الذين ليس لديهم طبيب وليسوا أطباء أو أدمن
    const fetchAvailableUsers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "users")); 
            const snapshot = await getDocs(q);
            const list: UserProfile[] = [];
            
            snapshot.forEach(d => {
                const data = d.data() as UserProfile;
                // الشرط: ليس لديه طبيب، وليس طبيباً، وليس أدمناً
                const hasDoctor = data.patientData?.assignedDoctorId;
                const isStaff = data.role === 'doctor' || data.role === 'admin';
                
                // نقبل المستخدم العادي، أو المريض الذي لم يحدد له طبيب بعد (نظرياً)
                if (!hasDoctor && !isStaff) {
                    list.push({ uid: d.id, ...data });
                }
            });
            setAvailableUsers(list);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleAddPatient = async (user: UserProfile) => {
        if (!auth.currentUser || !user.uid) return;
        if (!confirm(`هل تريد ضم المستخدم ${user.name} إلى قائمة مرضاك؟`)) return;

        try {
            // تحديث بيانات المستخدم ليصبح مريضاً تابعاً لهذا الطبيب
            await updateDoc(doc(db, "users", user.uid), {
                role: 'patient',
                patientData: {
                    assignedDoctorId: auth.currentUser.uid,
                    assignedDoctorName: auth.currentUser.displayName || 'Doctor',
                    isPlanAssigned: false, // يحتاج خطة (سيظهر في الداشبورد كطلب معلق)
                    isRecovered: false
                },
                // نحتفظ ببياناته الطبية كما هي ليراها الطبيب
            });
            
            // تحديث القوائم محلياً
            setAvailableUsers(prev => prev.filter(u => u.uid !== user.uid));
            setMyPatients(prev => [...prev, { 
                ...user, 
                role: 'patient', 
                patientData: { 
                    assignedDoctorId: auth.currentUser!.uid, 
                    assignedDoctorName: auth.currentUser!.displayName || 'Doctor', 
                    isPlanAssigned: false, 
                    isRecovered: false 
                } 
            }]);
            
            alert("تم إضافة المريض بنجاح. يرجى الذهاب للوحة القيادة (Dashboard) لإنشاء خطة علاجية له.");
            setViewMode('LIST');
        } catch (e) {
            console.error("Error adding patient:", e);
        }
    };

    // -- Inspect Patient Details --
    const openPatientDetails = async (patient: UserProfile) => {
        if (!patient.uid) return;
        setSelectedPatient(patient);
        setPatientLogs([]); // Reset
        
        // Fetch specific logs for charts
        try {
            const d = await getDoc(doc(db, "users", patient.uid));
            if (d.exists()) {
                const data = d.data();
                setPatientLogs(data.logs || []);
            }
        } catch (e) { console.error(e); }
    };

    // -- Filtering --
    const filteredAvailable = availableUsers.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredMyPatients = myPatients.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <LayoutContainer>
            <PageHeader 
                title="إدارة ملفات المرضى" 
                subtitle="متابعة الحالات وإضافة مرضى جدد للعيادة."
                action={
                    viewMode === 'LIST' ? (
                        <Button onClick={() => { setViewMode('ADD_NEW'); fetchAvailableUsers(); }} variant="primary">
                            <UserPlus size={18} /> ضم مريض جديد
                        </Button>
                    ) : (
                        <Button onClick={() => setViewMode('LIST')} variant="secondary">
                            <ChevronLeft size={18} /> العودة للقائمة
                        </Button>
                    )
                }
            />

            {/* --- ADD NEW PATIENT MODE --- */}
            {viewMode === 'ADD_NEW' && (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <Card className="bg-slate-900 border-white/5 mb-6">
                        <h3 className="text-xl font-bold text-white mb-4">البحث عن مستخدمين لضمهم</h3>
                        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-white/5 mb-6">
                            <Search className="text-slate-500" />
                            <input 
                                className="bg-transparent w-full text-white outline-none placeholder-slate-600"
                                placeholder="بحث عن مستخدم بالاسم أو البريد..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {filteredAvailable.length === 0 && (
                                <p className="text-slate-500 text-center col-span-2 py-8">لا يوجد مستخدمين متاحين للبحث الحالي.</p>
                            )}
                            {filteredAvailable.map(user => (
                                <div key={user.uid} className="flex justify-between items-center p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{user.name}</h4>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                            <div className="flex gap-2 mt-1">
                                                <Badge color="blue" className="!text-[9px] !py-0">{user.medType || 'غير محدد'}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button onClick={() => handleAddPatient(user)} variant="success" className="!py-2 !px-3 !text-xs">
                                        <UserPlus size={14} className="mr-1"/> ضم
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* --- MY PATIENTS LIST MODE --- */}
            {viewMode === 'LIST' && (
                <div className="animate-in fade-in">
                    <div className="mb-6 relative">
                         <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500" size={18} />
                         <input 
                            className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-12 text-white outline-none focus:border-indigo-500 transition-all"
                            placeholder="بحث في مرضاك..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                         />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredMyPatients.map(patient => (
                            <div 
                                key={patient.uid} 
                                onClick={() => openPatientDetails(patient)}
                                className="bg-slate-900 border border-white/5 p-6 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800 cursor-pointer transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 font-bold text-xl">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{patient.name}</h3>
                                            <p className="text-sm text-slate-500">{patient.email}</p>
                                        </div>
                                    </div>
                                    <Badge color={patient.patientData?.isRecovered ? 'green' : patient.patientData?.isPlanAssigned ? 'indigo' : 'amber'}>
                                        {patient.patientData?.isRecovered ? 'متعافي' : patient.patientData?.isPlanAssigned ? 'نشط' : 'بانتظار الخطة'}
                                    </Badge>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                    <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
                                        <span className="block text-[10px] text-slate-500 uppercase">التقدم</span>
                                        <span className="block font-bold text-indigo-400">{Math.round(patient.progress || 0)}%</span>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
                                        <span className="block text-[10px] text-slate-500 uppercase">المراحل</span>
                                        <span className="block font-bold text-white">{patient.patientData?.isPlanAssigned ? 'جارية' : '-'}</span>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
                                        <span className="block text-[10px] text-slate-500 uppercase">آخر ظهور</span>
                                        <span className="block font-bold text-slate-300 text-[10px] mt-1">
                                            {patient.lastActive ? new Date(patient.lastActive).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- PATIENT DETAILS MODAL (FULL STATS) --- */}
            {selectedPatient && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in">
                    <Card className="w-full max-w-5xl h-[90vh] flex flex-col bg-slate-900 border-white/10 shadow-2xl relative !p-0 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 bg-slate-950 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedPatient.name}</h2>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <FileText size={12}/> {selectedPatient.medType || 'غير محدد'} • {selectedPatient.medForm} • {selectedPatient.medUnit}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPatient(null)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 custom-scrollbar">
                            {/* LEFT COLUMN: CHARTS */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="bg-slate-950 border-white/5">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Activity size={16} className="text-indigo-400"/> سجل الالتزام بالجرعات</h3>
                                    <div className="h-64 w-full">
                                        {patientLogs.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={patientLogs.slice(-30)}>
                                                    <defs>
                                                        <linearGradient id="colorDoseP" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                    <XAxis dataKey="date" hide />
                                                    <YAxis stroke="#475569" fontSize={10} />
                                                    <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b'}} />
                                                    <Area type="monotone" dataKey="doseTaken" stroke="#6366f1" fill="url(#colorDoseP)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-slate-600">لا توجد سجلات متاحة</div>
                                        )}
                                    </div>
                                </Card>
                            </div>

                            {/* RIGHT COLUMN: STATS & LOGS */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-slate-950 p-4 rounded-xl border border-white/5 text-center">
                                         <span className="text-xs text-slate-500 uppercase block mb-1">متوسط النوم</span>
                                         <span className="text-xl font-bold text-white flex items-center justify-center gap-1">
                                             <Moon size={16} className="text-blue-400"/> 
                                             {patientLogs.length > 0 
                                                ? (patientLogs.reduce((a,b) => a + (b.sleepHours || 0), 0) / patientLogs.length).toFixed(1) 
                                                : '-'}h
                                         </span>
                                     </div>
                                     <div className="bg-slate-950 p-4 rounded-xl border border-white/5 text-center">
                                         <span className="text-xs text-slate-500 uppercase block mb-1">المزاج العام</span>
                                         <span className="text-xl font-bold text-white flex items-center justify-center gap-1">
                                             <Smile size={16} className="text-emerald-400"/>
                                             Good
                                         </span>
                                     </div>
                                </div>

                                <Card className="bg-slate-900 border-white/5 flex-1 max-h-[400px] overflow-hidden flex flex-col">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 sticky top-0 bg-slate-950 pb-2"><Calendar size={16} className="text-indigo-400"/> السجل اليومي</h3>
                                    <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2 pr-2">
                                        {patientLogs.slice().reverse().map((log, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-900 border border-white/5 text-xs">
                                                <span className="text-slate-400">{log.date}</span>
                                                <span className="font-bold text-white">{log.doseTaken} {selectedPatient.medUnit}</span>
                                                <span>
                                                    {log.mood === 'good' ? <Smile size={14} className="text-emerald-500"/> : 
                                                     log.mood === 'bad' ? <Frown size={14} className="text-rose-500"/> : 
                                                     <Meh size={14} className="text-amber-500"/>}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `views\LoginView.tsx`
```tsx
import React from 'react';
import { Activity, Chrome, LogIn } from 'lucide-react';
import { Button, Card, LanguageSwitcher } from '../components/UI';
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
```
---

### File: `views\OnboardingView.tsx`
```tsx
import React, { useState, useEffect } from 'react';
import { 
  Activity, CheckCircle, Pill, AlertTriangle, ArrowRight, ArrowLeft, 
  Stethoscope, BrainCircuit, FlaskConical, UserPlus, FileText, MapPin, Phone, Award, Search
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Button, Card, LanguageSwitcher, Badge } from '../components/UI';
import { UserProfile, Inventory, PlanDay, MedForm, MedUnit, DoctorProfileData } from '../types';
import { calculateTotalInventory, generatePlan } from '../services/taperingEngine';
import { useLanguage } from '../contexts/LanguageContext';

// --- Types ---
interface OnboardingViewProps {
  userProfile: UserProfile; 
  setUserProfile: (p: UserProfile | null) => void;
  inventory: Inventory;
  setInventory: (i: Inventory) => void;
  currentDoseHabit: number;
  setCurrentDoseHabit: (n: number) => void;
  startPlan: (customPlan: PlanDay[], speed: number, type: 'algorithm' | 'manual') => void;
  email: string;
  handleLogout?: () => void;
}

type OnboardingStep = 
  | 'ROLE_SELECT' 
  | 'DOCTOR_FORM' 
  | 'USER_PATH_SELECT' 
  | 'DOCTOR_SELECT' 
  | 'ALGO_SETUP_MED' 
  | 'ALGO_SETUP_FORM' 
  | 'ALGO_SETUP_INV' 
  | 'ALGO_PREVIEW';

export const OnboardingView = ({ 
  userProfile, setUserProfile, inventory, setInventory, 
  currentDoseHabit, setCurrentDoseHabit, startPlan, email, handleLogout
}: OnboardingViewProps) => {
  const { t, dir } = useLanguage();
  
  // -- Navigation State --
  const [step, setStep] = useState<OnboardingStep>('ROLE_SELECT');
  
  // -- Doctor Form State --
  const [doctorForm, setDoctorForm] = useState<Partial<DoctorProfileData>>({
      specialty: '', licenseNumber: '', clinicLocation: '', phoneNumber: '', bio: ''
  });

  // -- Patient Selection State --
  const [availableDoctors, setAvailableDoctors] = useState<UserProfile[]>([]);
  const [searchDoctor, setSearchDoctor] = useState('');

  // -- Algo Setup State --
  const [medForm, setMedForm] = useState<MedForm | null>(null);
  const [medUnit, setMedUnit] = useState<MedUnit | null>(null);
  const [medType, setMedType] = useState<'narcotic' | 'psychiatric' | 'normal' | null>(null);
  const [blockedState, setBlockedState] = useState(false);
  const [psychWarning, setPsychWarning] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<PlanDay[]>([]);
  
  // Helpers
  const totalInventory = calculateTotalInventory(inventory);
  
  const NavBackBtn = ({ to }: { to?: OnboardingStep }) => (
      <button 
        onClick={() => to ? setStep(to) : handleLogout?.()}
        className="absolute top-6 left-6 z-20 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
      >
        {dir === 'rtl' ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
      </button>
  );

  // --- Actions ---

  // 1. Submit Doctor Application
  const handleDoctorSubmit = async () => {
      if (!doctorForm.specialty || !doctorForm.licenseNumber || !doctorForm.phoneNumber) return;
      
      const newProfile: UserProfile = {
          ...userProfile,
          role: 'doctor',
          setupComplete: true, 
          doctorData: {
              specialty: doctorForm.specialty!,
              licenseNumber: doctorForm.licenseNumber!,
              clinicLocation: doctorForm.clinicLocation || '',
              phoneNumber: doctorForm.phoneNumber!,
              bio: doctorForm.bio || '',
              accountStatus: 'pending', // Important: Waiting for Admin Approval
              totalPatients: 0,
              activePatients: 0,
              recoveredCount: 0,
              doctorLevel: 1
          },
          durationMonths: 0,
          medType: null
      };
      // Trigger App.tsx to show "Waiting Approval" screen
      setUserProfile(newProfile);
  };

  // 2. Fetch Doctors for Patient
  useEffect(() => {
      if (step === 'DOCTOR_SELECT') {
          const fetchDocs = async () => {
              try {
                  const q = query(collection(db, "users"), where("role", "==", "doctor"));
                  const snapshot = await getDocs(q);
                  // Filter approved doctors only
                  const docs = snapshot.docs
                      .map(d => ({...d.data(), uid: d.id} as UserProfile))
                      .filter(d => d.doctorData?.accountStatus === 'approved');
                  setAvailableDoctors(docs);
              } catch (e) { console.error(e); }
          };
          fetchDocs();
      }
  }, [step]);

  // 3. Assign Patient to Doctor
  const handleAssignDoctor = (docProfile: UserProfile) => {
      if (!docProfile.uid) return;
      
      const newProfile: UserProfile = {
          ...userProfile,
          role: 'patient',
          setupComplete: true,
          patientData: {
              assignedDoctorId: docProfile.uid,
              assignedDoctorName: docProfile.name,
              isPlanAssigned: false, // Waiting for doctor's plan
              isRecovered: false
          },
          medType: 'normal', 
          durationMonths: 0
      };
      // Trigger App.tsx to show "Waiting Plan" screen
      setUserProfile(newProfile);
  };

  // 4. Algorithm Flow Handlers
  const handleMedTypeSelect = (type: 'narcotic' | 'psychiatric' | 'normal') => {
      if (type === 'narcotic') setBlockedState(true);
      else if (type === 'psychiatric') { 
          setMedType(type); 
          setPsychWarning(true); 
      } else { 
          setMedType(type); 
          setStep('ALGO_SETUP_FORM'); 
      }
  };

  const generatePreview = () => {
      const plan = generatePlan(totalInventory, currentDoseHabit, new Date().toISOString(), 1.0);
      setPreviewPlan(plan);
      setStep('ALGO_PREVIEW');
  };

  const confirmAlgorithmPlan = () => {
      // Start as Normal User with Algorithm Plan
      startPlan(previewPlan, 1.0, 'algorithm');
      
      const newProfile: UserProfile = {
          ...userProfile,
          role: 'normal_user',
          planType: 'algorithm',
          medType: medType,
          medForm: medForm!,
          medUnit: medUnit!,
          setupComplete: true
      };
      setUserProfile(newProfile);
  };


  // --- RENDERS ---

  // SCREEN 1: ROLE SELECTION (Doctor vs User)
  if (step === 'ROLE_SELECT') {
      return (
        <div className="min-h-screen bg-[#020617] p-6 flex flex-col items-center justify-center relative">
             <div className="absolute top-6 right-6 z-50"><LanguageSwitcher /></div>
             {handleLogout && <NavBackBtn />}
             
             <header className="mb-12 text-center animate-in slide-in-from-top-4">
                <h1 className="text-4xl font-black text-white mb-4">أهلاً بك في Islam's Guide</h1>
                <p className="text-slate-400 max-w-lg mx-auto">قبل البدء، يرجى تحديد طبيعة استخدامك للنظام.</p>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                 <button 
                    onClick={() => setStep('USER_PATH_SELECT')}
                    className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden"
                 >
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <UserPlus size={40} className="text-indigo-400 mb-6 group-hover:scale-110 transition-transform"/>
                     <h3 className="text-2xl font-bold text-white mb-2">مستخدم / مريض</h3>
                     <p className="text-slate-500 leading-relaxed">أريد التعافي من الدواء، سواء بمساعدة الخوارزمية الذكية أو تحت إشراف طبيب مختص.</p>
                 </button>

                 <button 
                    onClick={() => setStep('DOCTOR_FORM')}
                    className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden"
                 >
                     <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <Stethoscope size={40} className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform"/>
                     <h3 className="text-2xl font-bold text-white mb-2">طبيب معالج</h3>
                     <p className="text-slate-500 leading-relaxed">أرغب في الانضمام للكادر الطبي لمتابعة المرضى وإنشاء الخطط العلاجية لهم.</p>
                 </button>
             </div>
        </div>
      );
  }

  // SCREEN 2: DOCTOR REGISTRATION FORM
  if (step === 'DOCTOR_FORM') {
      return (
          <div className="min-h-screen bg-[#020617] p-6 pt-20 flex flex-col items-center">
              <NavBackBtn to="ROLE_SELECT" />
              <div className="max-w-2xl w-full animate-in fade-in slide-in-from-bottom-8">
                  <header className="text-center mb-8">
                      <h1 className="text-3xl font-black text-white mb-2">طلب اعتماد طبيب</h1>
                      <p className="text-slate-400">ستتم مراجعة بياناتك من قبل الإدارة قبل تفعيل حسابك.</p>
                  </header>
                  
                  <Card className="bg-slate-900 border-white/5 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">التخصص الطبي</label>
                              <div className="relative">
                                  <Award className="absolute top-3 right-3 text-slate-500" size={18} />
                                  <input 
                                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:border-emerald-500 outline-none" 
                                      placeholder="مثال: طب نفس، علاج إدمان..."
                                      value={doctorForm.specialty}
                                      onChange={e => setDoctorForm({...doctorForm, specialty: e.target.value})}
                                  />
                              </div>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">رقم الترخيص المهني</label>
                              <div className="relative">
                                  <FileText className="absolute top-3 right-3 text-slate-500" size={18} />
                                  <input 
                                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:border-emerald-500 outline-none" 
                                      placeholder="رقم الرخصة المعتمد"
                                      value={doctorForm.licenseNumber}
                                      onChange={e => setDoctorForm({...doctorForm, licenseNumber: e.target.value})}
                                  />
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">مقر العيادة / المستشفى</label>
                          <div className="relative">
                              <MapPin className="absolute top-3 right-3 text-slate-500" size={18} />
                              <input 
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:border-emerald-500 outline-none" 
                                  placeholder="المدينة، اسم المركز الطبي"
                                  value={doctorForm.clinicLocation}
                                  onChange={e => setDoctorForm({...doctorForm, clinicLocation: e.target.value})}
                              />
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">رقم هاتف للتواصل (للإدارة)</label>
                          <div className="relative">
                              <Phone className="absolute top-3 right-3 text-slate-500" size={18} />
                              <input 
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:border-emerald-500 outline-none" 
                                  placeholder="+966..."
                                  value={doctorForm.phoneNumber}
                                  onChange={e => setDoctorForm({...doctorForm, phoneNumber: e.target.value})}
                              />
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">نبذة تعريفية (تظهر للمرضى)</label>
                          <textarea 
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none h-24 resize-none" 
                              placeholder="خبراتك، مؤهلاتك..."
                              value={doctorForm.bio}
                              onChange={e => setDoctorForm({...doctorForm, bio: e.target.value})}
                          />
                      </div>

                      <Button 
                          variant="success" 
                          className="w-full py-4 text-lg" 
                          onClick={handleDoctorSubmit}
                          disabled={!doctorForm.specialty || !doctorForm.licenseNumber || !doctorForm.phoneNumber}
                      >
                          إرسال طلب الاعتماد
                      </Button>
                  </Card>
              </div>
          </div>
      );
  }

  // SCREEN 3: USER PATH SELECTION (Normal vs Patient)
  if (step === 'USER_PATH_SELECT') {
      return (
        <div className="min-h-screen bg-[#020617] p-6 pt-20 flex flex-col items-center">
            <NavBackBtn to="ROLE_SELECT" />
            
            <header className="mb-12 text-center animate-in slide-in-from-top-4">
                <h1 className="text-4xl font-black text-white mb-4">اختر مسار العلاج</h1>
                <p className="text-slate-400 max-w-lg mx-auto">كيف تفضل أن تبدأ رحلتك نحو التعافي؟</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                 {/* خيار 1: الخوارزمية (مستخدم عادي) */}
                 <button 
                    onClick={() => {
                        // الانتقال مباشرة لإدخال البيانات وبدء الخوارزمية
                        setMedType(null);
                        setStep('ALGO_SETUP_MED');
                    }}
                    className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden"
                 >
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <BrainCircuit size={40} className="text-indigo-400 mb-6 group-hover:scale-110 transition-transform"/>
                     <h3 className="text-2xl font-bold text-white mb-2">الخوارزمية الذكية</h3>
                     <p className="text-slate-500 leading-relaxed">أريد أن يقوم الموقع بحساب خطة التخفيض تلقائياً بناءً على كمية الدواء المتوفرة لدي (Smart Taper).</p>
                 </button>

                 {/* خيار 2: طبيب (مريض) */}
                 <button 
                    onClick={() => setStep('DOCTOR_SELECT')}
                    className="group bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-blue-500/50 hover:bg-slate-900/80 transition-all text-right relative overflow-hidden"
                 >
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <Stethoscope size={40} className="text-blue-400 mb-6 group-hover:scale-110 transition-transform"/>
                     <h3 className="text-2xl font-bold text-white mb-2">متابعة مع طبيب</h3>
                     <p className="text-slate-500 leading-relaxed">سأقوم باختيار طبيب من المنصة، وانتظر حتى يقوم هو بوضع الجدول العلاجي المناسب لي.</p>
                 </button>
            </div>
        </div>
      );
  }

  // SCREEN 4: DOCTOR SELECTION LIST (For Patients)
  if (step === 'DOCTOR_SELECT') {
      const filteredDocs = availableDoctors.filter(d => d.name.toLowerCase().includes(searchDoctor.toLowerCase()));

      return (
          <div className="min-h-screen bg-[#020617] p-6 pt-20 flex flex-col items-center">
              <NavBackBtn to="USER_PATH_SELECT" />
              <div className="max-w-4xl w-full animate-in fade-in">
                  <header className="mb-8 text-center">
                      <h1 className="text-3xl font-black text-white mb-2">اختر طبيبك المعالج</h1>
                      <p className="text-slate-400">سيقوم الطبيب المختار بمراجعة ملفك ووضع الخطة المناسبة.</p>
                  </header>

                  <div className="relative mb-6">
                      <Search className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500" size={18}/>
                      <input 
                         className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-12 text-white outline-none focus:border-blue-500"
                         placeholder="بحث باسم الطبيب..."
                         value={searchDoctor}
                         onChange={e => setSearchDoctor(e.target.value)}
                      />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredDocs.length === 0 ? (
                          <div className="col-span-2 text-center py-20 bg-slate-900 rounded-3xl border border-dashed border-slate-800">
                              <Stethoscope className="mx-auto mb-4 text-slate-700" size={48} />
                              <p className="text-slate-500">{availableDoctors.length === 0 ? 'لا يوجد أطباء متاحين حالياً.' : 'لا توجد نتائج للبحث.'}</p>
                          </div>
                      ) : (
                        filteredDocs.map(doc => (
                              <div key={doc.uid} className="bg-slate-900 border border-white/5 p-6 rounded-2xl hover:border-blue-500/30 transition-all group flex flex-col h-full">
                                  <div className="flex justify-between items-start mb-4">
                                      <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 font-bold text-lg">
                                              Dr
                                          </div>
                                          <div>
                                              <h3 className="font-bold text-white text-lg">{doc.name}</h3>
                                              <Badge color="blue">{doc.doctorData?.specialty}</Badge>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  <p className="text-slate-400 text-sm mb-6 line-clamp-2 bg-slate-950/50 p-3 rounded-lg border border-white/5 flex-1">
                                      {doc.doctorData?.bio || "لا توجد نبذة تعريفية."}
                                  </p>
                                  
                                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                      <MapPin size={14}/> {doc.doctorData?.clinicLocation || "Online"}
                                  </div>

                                  <Button onClick={() => handleAssignDoctor(doc)} className="w-full" variant="secondary">
                                      اختيار هذا الطبيب
                                  </Button>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      );
  }

  // SCREEN 5: ALGO SETUP - MED TYPE (For Normal Users)
  if (step === 'ALGO_SETUP_MED') {
        // --- BLOCKED STATE ---
        if (blockedState) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-red-950 p-6 text-center animate-in zoom-in">
                    <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-6 animate-bounce"><AlertTriangle size={48} className="text-white" /></div>
                    <h1 className="text-4xl font-black text-white mb-4">الدخول محظور</h1>
                    <p className="text-red-200 text-xl max-w-lg mb-8">عذراً، هذا النظام غير مصرح له بالتعامل مع المواد المخدرة. يرجى التوجه لأقرب مصحة علاج إدمان فوراً.</p>
                    <Button onClick={() => setBlockedState(false)} variant="secondary">عودة</Button>
                </div>
            );
        }
        
        // --- PSYCH WARNING ---
        if (psychWarning) {
            return (
                <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in">
                    <Card className="max-w-md border-amber-500/30 bg-slate-900 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse"><AlertTriangle size={32} className="text-amber-500" /></div>
                        <h2 className="text-2xl font-bold text-white text-center mb-4">تنبيه طبي هام</h2>
                        <p className="text-slate-300 text-center mb-6 leading-relaxed">تنبيه هام: الأدوية النفسية تتطلب إشرافاً طبياً. استخدامك للخطة المقترحة هو وسيلة مساعدة وليست بديلاً عن الطبيب.</p>
                        <div className="flex gap-4">
                            <Button variant="secondary" onClick={() => setPsychWarning(false)} className="flex-1">تراجع</Button>
                            <Button variant="primary" onClick={() => { setPsychWarning(false); setStep('ALGO_SETUP_FORM'); }} className="flex-1">أوافق على المسؤولية</Button>
                        </div>
                    </Card>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-[#020617] p-6 pt-20">
                <NavBackBtn to="USER_PATH_SELECT" />
                <header className="text-center mb-12 animate-in slide-in-from-top-4">
                    <h1 className="text-4xl font-black text-white mb-4">نوع الدواء</h1>
                    <p className="text-slate-400">لضمان سلامتك، يرجى تحديد تصنيف الدواء الذي تتناوله.</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {[
                      { type: 'narcotic', label: 'مخدرات (جدول أول)', icon: AlertTriangle, color: 'rose', desc: 'يتطلب حجز في مصحة' },
                      { type: 'psychiatric', label: 'أدوية نفسية', icon: BrainCircuit, color: 'amber', desc: 'يتطلب إشراف طبي' },
                      { type: 'normal', label: 'أدوية عامة', icon: CheckCircle, color: 'emerald', desc: 'آمن للتخفيض الذاتي' }
                    ].map((item: any) => (
                      <button key={item.type} onClick={() => handleMedTypeSelect(item.type)} className={`group relative p-10 rounded-[2.5rem] border border-white/5 bg-slate-900 hover:bg-slate-900/80 transition-all text-right overflow-hidden hover:border-${item.color}-500/30`}>
                        <div className={`w-20 h-20 rounded-3xl bg-${item.color}-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}><item.icon className={`w-10 h-10 text-${item.color}-500`} /></div>
                        <h3 className="text-2xl font-bold text-white mb-2">{item.label}</h3>
                        <p className="text-sm text-slate-500 font-bold">{item.desc}</p>
                      </button>
                    ))}
                </div>
            </div>
        );
  }

  // SCREEN 6: ALGO SETUP - FORM & UNIT
  if (step === 'ALGO_SETUP_FORM') {
        return (
            <div className="min-h-screen bg-[#020617] p-6 flex flex-col items-center justify-center pt-20">
                <NavBackBtn to="ALGO_SETUP_MED" /> 
                <div className="max-w-2xl w-full animate-in zoom-in">
                    <h1 className="text-3xl font-black text-white text-center mb-8">شكل الدواء</h1>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button onClick={() => setMedForm('tablet')} className={`p-8 rounded-3xl border transition-all ${medForm === 'tablet' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'}`}>
                            <Pill className="mx-auto mb-4" size={40} />
                            <span className="block text-center font-bold text-lg">أقراص / حبوب</span>
                        </button>
                        <button onClick={() => setMedForm('liquid')} className={`p-8 rounded-3xl border transition-all ${medForm === 'liquid' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'}`}>
                            <FlaskConical className="mx-auto mb-4" size={40} />
                            <span className="block text-center font-bold text-lg">سائل / قطرات</span>
                        </button>
                    </div>
                    {medForm && (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-xl font-bold text-white text-center mb-4">وحدة القياس</h2>
                            <div className="flex justify-center gap-4 mb-8">
                                {(medForm === 'tablet' ? ['mg', 'g'] : ['ml', 'l', 'mg']).map((u) => (
                                    <button key={u} onClick={() => setMedUnit(u as MedUnit)} className={`px-6 py-3 rounded-xl font-bold text-lg border transition-all ${medUnit === u ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-500 hover:text-white'}`}>{u}</button>
                                ))}
                            </div>
                        </div>
                    )}
                    <Button variant="success" className="w-full py-5 text-xl" disabled={!medForm || !medUnit} onClick={() => setStep('ALGO_SETUP_INV')}>متابعة <ArrowRight /></Button>
                </div>
            </div>
        );
  }

  // SCREEN 7: ALGO SETUP - INVENTORY
  if (step === 'ALGO_SETUP_INV') {
      const formLabel = medForm === 'liquid' ? 'زجاجات' : 'عبوات (علب)';
      const subUnitLabel = medForm === 'liquid' ? `مل لكل زجاجة` : `حبة لكل علبة`;
      const unitLabel = medUnit || 'mg';

      return (
        <div className="min-h-screen bg-[#020617] p-4 md:p-10 pt-20">
            <NavBackBtn to="ALGO_SETUP_FORM" />
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
                <Card className="border-white/5 bg-slate-900">
                    <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-4">
                        <span className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Pill size={24} /></span>
                        جرد المخزون
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <label className="block text-xs font-bold text-indigo-400 uppercase mb-4">عدد {formLabel} الكاملة</label>
                            <input type="number" className="w-full bg-slate-950 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none focus:bg-slate-900 transition-all" placeholder="0" value={inventory.boxes || ''} onChange={(e) => setInventory({...inventory, boxes: parseInt(e.target.value) || 0})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-indigo-400 uppercase mb-4">المحتوى ({subUnitLabel})</label>
                            <input type="number" className="w-full bg-slate-950 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none focus:bg-slate-900 transition-all" placeholder="0" value={inventory.pillsPerBox || ''} onChange={(e) => setInventory({...inventory, pillsPerBox: parseInt(e.target.value) || 0})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-indigo-400 uppercase mb-4">كمية مفردة (فراط) {medForm === 'liquid' ? 'ml' : 'حبة'}</label>
                            <input type="number" className="w-full bg-slate-950 p-6 rounded-2xl text-4xl text-white font-mono font-bold border border-white/10 focus:border-indigo-500 outline-none focus:bg-slate-900 transition-all" placeholder="0" value={inventory.loosePills || ''} onChange={(e) => setInventory({...inventory, loosePills: parseInt(e.target.value) || 0})} />
                        </div>
                    </div>
                    <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                        <span className="text-slate-400 font-bold text-lg">الرصيد الكلي</span>
                        <span className="text-5xl font-mono font-black text-emerald-400">{calculateTotalInventory(inventory)} <span className="text-sm text-emerald-600">{unitLabel}</span></span>
                    </div>
                </Card>

                <Card className="bg-slate-900 border-white/5">
                    <h2 className="text-2xl font-bold text-white mb-8">الجرعة الحالية ({unitLabel})</h2>
                    <div className="flex flex-wrap gap-4">
                        {[0.5, 1, 2, 5, 10, 20, 50, 100].map(dose => (
                            <button key={dose} onClick={() => setCurrentDoseHabit(dose)} className={`h-16 w-24 rounded-2xl font-mono font-bold border transition-all ${currentDoseHabit === dose ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105' : 'bg-slate-950 border-white/10 text-slate-500 hover:bg-slate-800'}`}>{dose}</button>
                        ))}
                        <input type="number" placeholder="أخرى" className="h-16 w-32 bg-slate-950 rounded-2xl border border-white/10 px-4 font-mono font-bold text-white focus:border-indigo-500 outline-none transition-all" onChange={(e) => setCurrentDoseHabit(parseFloat(e.target.value))} />
                    </div>
                </Card>

                <Button className="w-full text-2xl py-8 rounded-3xl shadow-2xl shadow-indigo-900/20" variant="success" disabled={currentDoseHabit === 0 || calculateTotalInventory(inventory) === 0} onClick={generatePreview}>
                    تحليل وإنشاء الخطة
                </Button>
            </div>
        </div>
      );
  }

  // SCREEN 8: PREVIEW (Only for Algorithm users)
  if (step === 'ALGO_PREVIEW') {
      return (
         <div className="min-h-screen bg-[#020617] p-6 pt-20 flex flex-col items-center">
             <NavBackBtn to="ALGO_SETUP_INV" />
             <div className="max-w-4xl w-full text-center space-y-8 animate-in zoom-in">
                 <h1 className="text-4xl font-black text-white">الخطة جاهزة!</h1>
                 <p className="text-slate-400">بناءً على مخزونك البالغ {totalInventory} {medUnit}، قمنا بحساب جدول يمتد لـ {previewPlan.length} يوم.</p>
                 
                 <div className="grid grid-cols-2 gap-4">
                     <Card className="bg-slate-900 text-center">
                         <div className="text-xs text-slate-500 uppercase">مدة التعافي</div>
                         <div className="text-3xl font-bold text-white">{previewPlan.length} يوم</div>
                     </Card>
                     <Card className="bg-slate-900 text-center">
                         <div className="text-xs text-slate-500 uppercase">تغطية المخزون</div>
                         <div className="text-3xl font-bold text-emerald-400">100%</div>
                     </Card>
                 </div>

                 <Button onClick={confirmAlgorithmPlan} variant="success" className="w-full py-6 text-xl">
                     اعتماد وبدء الرحلة
                 </Button>
             </div>
         </div>
      );
  }

  return null;
};
```
---

### File: `views\StatsView.tsx`
```tsx
import React, { useMemo } from 'react';
import { Card, PageHeader, LayoutContainer, Badge } from '../components/UI';
import { DailyLog, PlanDay, UserProfile } from '../types';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, ReferenceLine
} from 'recharts';
import { Smile, Activity, Zap, Moon, Shield, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StatsViewProps {
    logs: DailyLog[];
    plan: PlanDay[];
    userProfile?: UserProfile | null;
}

export const StatsView = ({ logs, plan, userProfile }: StatsViewProps) => {
    const { t } = useLanguage();
    const unitLabel = userProfile?.medUnit || 'mg';

    // 1. حساب بيانات الحالة المزاجية (Pie Chart)
    const moodData = useMemo(() => [
        { name: t('excellent'), value: logs.filter(l => l.mood === 'good').length, color: '#10b981' }, // Emerald
        { name: t('stable'), value: logs.filter(l => l.mood === 'normal').length, color: '#f59e0b' }, // Amber
        { name: t('bad'), value: logs.filter(l => l.mood === 'bad').length, color: '#f43f5e' },    // Rose
    ].filter(d => d.value > 0), [logs, t]);

    // 2. حساب بيانات الالتزام (مخطط vs فعلي)
    const adherenceData = useMemo(() => {
        // ندمج السجلات مع التواريخ لرسم الخط
        return logs.map(log => {
            const planned = plan.find(p => p.date === log.date)?.plannedDose || 0;
            return {
                date: log.date.slice(5), // MM-DD
                fullDate: log.date,
                planned: planned,
                actual: log.doseTaken,
                diff: log.doseTaken - planned // الفرق (للتلوين إذا لزم الأمر)
            };
        });
    }, [plan, logs]);

    // 3. منطق الأوسمة (Gamification Logic)
    const badges = [
        {
            id: 'warrior',
            title: t('badge_7days'),
            icon: Shield,
            color: 'indigo',
            achieved: logs.length >= 7
        },
        {
            id: 'halfway',
            title: t('badge_halfway'),
            icon: Zap,
            color: 'amber',
            // تم تحقيق الوسام إذا كانت الجرعة الحالية أقل من نصف جرعة البداية
            achieved: logs.length > 0 && plan.length > 0 && logs[logs.length-1].doseTaken <= (plan[0].plannedDose / 2)
        },
        {
            id: 'sleep',
            title: t('badge_sleep'),
            icon: Moon,
            color: 'blue',
            // معدل النوم آخر 3 أيام جيد (>= 7 ساعات)
            achieved: logs.length >= 3 && (logs.slice(-3).reduce((acc, l) => acc + (l.sleepHours || 0), 0) / 3) >= 7
        },
        {
            id: 'stable',
            title: t('badge_stable'),
            icon: Smile,
            color: 'emerald',
            // آخر 3 أيام مزاج جيد متواصل
            achieved: logs.length >= 3 && logs.slice(-3).every(l => l.mood === 'good')
        }
    ];

    return (
      <LayoutContainer>
          <PageHeader 
            title={t('nav_stats')}
            subtitle="لوحة المعلومات الحيوية وتحليل الأداء."
          />

          {/* Badges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {badges.map((badge) => (
                  <div key={badge.id} className={`relative p-6 rounded-[2rem] border overflow-hidden transition-all duration-500 group ${badge.achieved ? `bg-${badge.color}-500/10 border-${badge.color}-500/30` : 'bg-slate-900/40 border-white/5 opacity-50 grayscale'}`}>
                      {badge.achieved && <div className={`absolute inset-0 bg-gradient-to-br from-${badge.color}-500/0 via-${badge.color}-500/0 to-${badge.color}-500/10 group-hover:to-${badge.color}-500/20`}></div>}
                      
                      <div className="relative z-10 flex flex-col items-center text-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${badge.achieved ? `bg-gradient-to-tr from-${badge.color}-500 to-${badge.color}-400` : 'bg-slate-800'}`}>
                              <badge.icon size={24} />
                          </div>
                          <div>
                              <span className={`text-xs font-bold block ${badge.achieved ? 'text-white' : 'text-slate-500'}`}>{badge.title}</span>
                              {!badge.achieved && <span className="text-[9px] text-slate-600">لم يتم القفل بعد</span>}
                          </div>
                      </div>
                      
                      {badge.achieved && (
                          <div className="absolute top-2 right-2 text-yellow-500 animate-pulse">
                              <Award size={14} />
                          </div>
                      )}
                  </div>
              ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 1. Adherence Chart (Planned vs Actual) */}
              <Card className="min-h-[400px] flex flex-col md:col-span-2 bg-slate-900/50">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                              <Activity className="w-5 h-5"/>
                          </div>
                           الالتزام بالخطة العلاجية
                      </h3>
                      <div className="flex gap-4 text-xs font-bold">
                          <span className="flex items-center gap-2 text-indigo-400"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> المخطط</span>
                          <span className="flex items-center gap-2 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> الفعلي</span>
                      </div>
                  </div>
                  
                  <div className="flex-1 h-[300px]">
                      {adherenceData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={adherenceData.slice(-30)}> {/* Last 30 entries */}
                                  <defs>
                                    <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickMargin={10} />
                                  <YAxis stroke="#475569" fontSize={10} />
                                  <Tooltip 
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                      itemStyle={{color: '#fff'}}
                                      formatter={(val: number) => [`${val} ${unitLabel}`, '']}
                                      labelFormatter={(label) => `التاريخ: ${label}`}
                                  />
                                  <Area type="monotone" dataKey="planned" stroke="#6366f1" fillOpacity={1} fill="url(#colorPlanned)" name="المخطط" strokeWidth={2} />
                                  <Area type="monotone" dataKey="actual" stroke="#10b981" fillOpacity={1} fill="url(#colorActual)" name="الفعلي" strokeWidth={2} connectNulls />
                              </AreaChart>
                          </ResponsiveContainer>
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-500">
                              <Activity size={48} className="opacity-20 mb-4"/>
                              <p>لا توجد بيانات كافية للرسم البياني بعد.</p>
                          </div>
                      )}
                  </div>
              </Card>

              {/* 2. Mood Distribution */}
              <Card className="min-h-[350px] flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Smile className="w-5 h-5"/>
                      </div>
                      الحالة المزاجية
                  </h3>
                  <div className="flex-1 relative">
                       {moodData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={moodData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={100}
                                      paddingAngle={8}
                                      dataKey="value"
                                      stroke="none"
                                      cornerRadius={8}
                                  >
                                      {moodData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                  </Pie>
                                  <Tooltip 
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                      itemStyle={{fontWeight: 'bold', color: '#fff'}}
                                  />
                              </PieChart>
                          </ResponsiveContainer>
                       ) : (
                           <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-medium">
                               سجل مزاجك اليومي لتظهر البيانات
                           </div>
                       )}
                  </div>
                  <div className="flex justify-center gap-4 mt-2 flex-wrap">
                      {moodData.map((d, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5">
                              <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                              {d.name} ({d.value})
                          </div>
                      ))}
                  </div>
              </Card>

              {/* 3. Sleep Quality Chart */}
              <Card className="min-h-[350px] flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Moon className="w-5 h-5"/>
                      </div>
                       جودة النوم (آخر 7 أيام)
                  </h3>
                  <div className="flex-1">
                      {logs.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={logs.slice(-7)}> 
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                  <XAxis dataKey="date" tickFormatter={(str) => str.slice(8)} stroke="#475569" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} domain={[0, 12]} />
                                  <Tooltip 
                                      cursor={{fill: '#1e293b', opacity: 0.5}}
                                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                                      itemStyle={{color: '#fff'}}
                                      formatter={(val) => [`${val} ساعة`, 'النوم']}
                                  />
                                  <ReferenceLine y={7} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'الهدف (7h)', fill: '#10b981', fontSize: 10 }} />
                                  <Bar dataKey="sleepHours" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={20}>
                                    {logs.slice(-7).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.sleepHours && entry.sleepHours >= 7 ? '#10b981' : '#6366f1'} />
                                    ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      ) : (
                          <div className="h-full flex items-center justify-center text-slate-500">
                              <p>لا توجد سجلات للنوم.</p>
                          </div>
                      )}
                  </div>
              </Card>
          </div>
      </LayoutContainer>
    );
};
```
---

### File: `views\SupportView.tsx`
```tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Ticket, TicketMessage } from '../types';
import { PageHeader, LayoutContainer, Card, Button, Badge } from '../components/UI';
import { useLanguage } from '../contexts/LanguageContext';
import { LifeBuoy, Plus, MessageSquare, Send, CheckCircle, Lock, X, Pill, FlaskConical, User, Stethoscope } from 'lucide-react';

interface SupportViewProps {
    user: UserProfile;
}

export const SupportView = ({ user }: SupportViewProps) => {
    const { t } = useLanguage();
    
    // -- State --
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Forms
    const [newSubject, setNewSubject] = useState("");
    const [newMessage, setNewMessage] = useState("");
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // -- 1. Fetch User Tickets --
    useEffect(() => {
        if (!user.uid) return;
        
        // جلب التذاكر الخاصة بالمستخدم الحالي فقط
        const q = query(
            collection(db, "tickets"), 
            where("userId", "==", user.uid), 
            orderBy("lastUpdate", "desc")
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTickets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Ticket));
            setTickets(fetchedTickets);
            
            // تحديث التذكرة المفتوحة حالياً إذا وصل رد جديد (Real-time)
            if (activeTicket) {
                const updatedActive = fetchedTickets.find(t => t.id === activeTicket.id);
                if (updatedActive) setActiveTicket(updatedActive);
            }
        });
        
        return () => unsubscribe();
    }, [user.uid, activeTicket?.id]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (activeTicket) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [activeTicket?.messages, activeTicket]);

    // -- 2. Actions --
    
    const createTicket = async () => {
        if (!newSubject.trim() || !newMessage.trim() || !user.uid) return;
        
        const initialMsg: TicketMessage = {
            senderId: user.uid,
            senderName: user.name,
            text: newMessage,
            timestamp: Date.now(),
            isAdmin: false
        };

        try {
            await addDoc(collection(db, "tickets"), {
                userId: user.uid,
                userEmail: user.email,
                subject: newSubject,
                status: 'open',
                createdAt: Date.now(),
                lastUpdate: Date.now(),
                messages: [initialMsg]
            });
            setShowCreateModal(false);
            setNewSubject("");
            setNewMessage("");
        } catch (e) {
            console.error("Error creating ticket:", e);
            alert("فشل إنشاء التذكرة. يرجى المحاولة لاحقاً.");
        }
    };

    const sendReply = async () => {
        if (!newMessage.trim() || !activeTicket || !activeTicket.id || !user.uid) return;

        const newMsg: TicketMessage = {
            senderId: user.uid,
            senderName: user.name,
            text: newMessage,
            timestamp: Date.now(),
            isAdmin: false
        };

        try {
            const ticketRef = doc(db, "tickets", activeTicket.id);
            // استخدمنا any هنا لتجاوز تدقيق Typescript الصارم مع Firestore arrayUnion في بعض النسخ، 
            // لكن التحديث المباشر للمصفوفة كما يلي يعمل بشكل جيد مع البيانات المجلوبة
            const currentMessages = activeTicket.messages || [];
            
            await updateDoc(ticketRef, {
                messages: [...currentMessages, newMsg],
                lastUpdate: Date.now(),
                // إذا رد المستخدم، نعيد فتح التذكرة إذا كانت "قيد الانتظار" أو "مغلقة"
                status: 'open' 
            });
            setNewMessage("");
        } catch (e) {
            console.error("Error sending reply:", e);
        }
    };

    return (
        <LayoutContainer>
            <PageHeader 
                title="مركز المساعدة والدعم" 
                subtitle="تواصل مباشرة مع الفريق التقني والإداري للنظام."
                action={
                    <Button onClick={() => setShowCreateModal(true)} variant="primary">
                        <Plus size={18} /> فتح تذكرة جديدة
                    </Button>
                }
            />

            {/* Context Banner: يعرض هوية المستخدم لتسهيل لقطات الشاشة للدعم */}
            <div className="mb-6 bg-slate-900/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400">
                        {user.role === 'doctor' ? <Stethoscope size={20}/> : 
                         user.medForm === 'liquid' ? <FlaskConical size={20} /> : 
                         user.medForm === 'tablet' ? <Pill size={20} /> : <User size={20}/>}
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">حسابك الحالي</p>
                        <p className="text-white font-bold text-sm flex items-center gap-2">
                            {user.name} 
                            <Badge color="blue" className="!py-0 !px-1.5 !text-[9px]">{user.role.toUpperCase()}</Badge>
                        </p>
                    </div>
                </div>
                {user.role === 'normal_user' && user.planType === 'algorithm' && (
                    <Badge color="indigo">خوارزمية ذكية</Badge>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
                {/* LIST COLUMN */}
                <Card className={`md:col-span-4 flex flex-col overflow-hidden bg-slate-900 border-white/5 !p-0 ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/30">
                        <h3 className="font-bold text-white">تذاكري</h3>
                        <Badge color="indigo">{tickets.length}</Badge>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar">
                        {tickets.length === 0 && (
                            <div className="text-center py-10 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl m-2">
                                <LifeBuoy className="mx-auto mb-2 opacity-50" size={24}/>
                                لا توجد تذاكر سابقة.
                            </div>
                        )}
                        {tickets.map(ticket => (
                            <div 
                                key={ticket.id}
                                onClick={() => setActiveTicket(ticket)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                    activeTicket?.id === ticket.id 
                                    ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                                    : 'bg-slate-950/50 border-transparent hover:bg-slate-800 hover:border-white/5'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={`font-bold text-sm truncate max-w-[70%] ${activeTicket?.id === ticket.id ? 'text-indigo-300' : 'text-slate-300'}`}>
                                        {ticket.subject}
                                    </h4>
                                    <Badge color={ticket.status === 'resolved' ? 'green' : ticket.status === 'open' ? 'rose' : 'amber'} className="!text-[9px] !px-1.5">
                                        {ticket.status === 'resolved' ? 'مغلق' : ticket.status === 'open' ? 'مفتوح' : 'قيد المراجعة'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-end text-[10px] text-slate-500">
                                    <span>{new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                                    <MessageSquare size={12} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* CHAT COLUMN */}
                <Card className={`md:col-span-8 flex flex-col overflow-hidden bg-slate-900 border-white/5 relative !p-0 ${!activeTicket ? 'hidden md:flex' : 'flex'}`}>
                    {!activeTicket ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 opacity-50">
                                <LifeBuoy size={40} />
                            </div>
                            <p>اختر تذكرة لعرض التفاصيل أو ابدأ تذكرة جديدة</p>
                        </div>
                    ) : (
                        <>
                            {/* Ticket Header */}
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                                <div>
                                    <button onClick={() => setActiveTicket(null)} className="md:hidden text-slate-400 mr-2 mb-2 flex items-center gap-1 text-xs">
                                        <X size={14}/> إغلاق
                                    </button>
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Lock size={14} className="text-emerald-500"/> {activeTicket.subject}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-mono mt-1">Ref: {activeTicket.id}</p>
                                </div>
                                {activeTicket.status === 'resolved' && <Badge color="green"><CheckCircle size={12} /> تم الحل</Badge>}
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
                                {activeTicket.messages?.map((msg, idx) => {
                                    const isMe = !msg.isAdmin; 
                                    return (
                                        <div key={idx} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                                            <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                                                isMe 
                                                ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5' 
                                                : 'bg-indigo-600 text-white rounded-tr-none shadow-lg'
                                            }`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-slate-600 mt-1 px-1 flex items-center gap-1">
                                                {isMe ? 'أنا' : 'الدعم الفني'} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Reply Input */}
                            <div className="p-4 border-t border-white/5 bg-slate-950/30">
                                {activeTicket.status === 'resolved' ? (
                                    <div className="text-center text-xs text-emerald-500 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                        تم إغلاق هذه التذكرة. لفتحها مجدداً، يرجى إنشاء تذكرة جديدة.
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input 
                                            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                                            placeholder="اكتب ردك هنا..."
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && sendReply()}
                                        />
                                        <Button onClick={sendReply} variant="primary" disabled={!newMessage.trim()} className="!rounded-xl !px-4">
                                            <Send size={18} />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {/* Create Ticket Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <Card className="w-full max-w-md bg-slate-900 border-white/10 relative shadow-2xl">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all"><X size={20}/></button>
                        
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <LifeBuoy className="text-indigo-500"/> طلب مساعدة جديد
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">الموضوع</label>
                                <input 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all" 
                                    value={newSubject} 
                                    onChange={e => setNewSubject(e.target.value)} 
                                    placeholder="مثال: مشكلة في تسجيل الجرعة" 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">التفاصيل</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none h-32 resize-none transition-all" 
                                    value={newMessage} 
                                    onChange={e => setNewMessage(e.target.value)} 
                                    placeholder="اشرح المشكلة بالتفصيل..." 
                                />
                            </div>
                            <Button onClick={createTicket} variant="primary" className="w-full py-3" disabled={!newSubject || !newMessage}>
                                إرسال الطلب
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </LayoutContainer>
    );
};
```
---

### File: `App.tsx`
```tsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Zap, Clock, ShieldCheck, Check, ArrowRight, ArrowLeft, Lock, Loader2 } from 'lucide-react';
import { auth, googleProvider, db } from './services/firebase';
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { calculateTotalInventory, adjustPlan } from './services/taperingEngine';
import { UserProfile, Inventory, AppView, PlanDay, DailyLog } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Modular Views & Components
import { Button, Card, PageHeader, LayoutContainer } from './components/UI';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav'; 
import { LoginView } from './views/LoginView';
import { OnboardingView } from './views/OnboardingView';
import { DashboardView } from './views/DashboardView';
import { CalendarView } from './views/CalendarView';
import { StatsView } from './views/StatsView';
import { AdminView } from './views/AdminView';
import { CommunityView } from './views/CommunityView';
import { SupportView } from './views/SupportView';
import { ArticlesView } from './views/ArticlesView';
import { DoctorDashboardView } from './views/DoctorDashboardView'; 
import { DoctorPatientsView } from './views/DoctorPatientsView'; 

// Helper to add days safely
const addDaysSafe = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
};

function AppContent() {
  // -- State --
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const { dir, t } = useLanguage();

  // App Data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [inventory, setInventory] = useState<Inventory>({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
  const [currentDoseHabit, setCurrentDoseHabit] = useState<number>(0);
  const [plan, setPlan] = useState<PlanDay[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  
  // Speed Modifier
  const [speedModifier, setSpeedModifier] = useState<number>(1.0);
  
  // Navigation
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [viewHistory, setViewHistory] = useState<AppView[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dashboard Interaction
  const [selectedDose, setSelectedDose] = useState<number | null>(null);
  const [selectedMood, setSelectedMood] = useState<'bad' | 'normal' | 'good' | null>(null);

  // Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // -- Load Local Data --
  useEffect(() => {
    const savedProfile = localStorage.getItem('taper_profile');
    const savedPlan = localStorage.getItem('taper_plan');
    const savedLogs = localStorage.getItem('taper_logs');
    const savedInventory = localStorage.getItem('taper_inventory');
    const savedSpeed = localStorage.getItem('taper_speed'); 
    
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (savedPlan) setPlan(JSON.parse(savedPlan));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedSpeed) setSpeedModifier(parseFloat(savedSpeed));
    
    setLoading(false); 
  }, []);

  // -- 1. FETCH CLOUD DATA --
  useEffect(() => {
    if (authUser) {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, "users", authUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // دمج البيانات مع الحالة المحلية
            const fetchedProfile = { ...data, uid: authUser.uid } as UserProfile;
            
            // تصحيح هيكلية البيانات القديمة إذا وجدت
            if (data.userProfile) {
                Object.assign(fetchedProfile, data.userProfile);
            }

            setUserProfile(fetchedProfile);

            if (data.plan) setPlan(data.plan);
            if (data.logs) setLogs(data.logs);
            if (data.inventory) setInventory(data.inventory);
            if (data.speedModifier) setSpeedModifier(data.speedModifier);
            
            // التعامل مع الحظر
            if (data.isBanned) {
               alert(t('banned_msg'));
               handleLogout();
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        setLoading(false);
      };
      fetchUserData();
    }
  }, [authUser]);

  // -- 2. SYNC TO LOCAL & CLOUD --
  useEffect(() => {
    // 1. Local Storage Sync
    if (userProfile) localStorage.setItem('taper_profile', JSON.stringify(userProfile));
    if (plan.length > 0) localStorage.setItem('taper_plan', JSON.stringify(plan));
    if (logs.length > 0) localStorage.setItem('taper_logs', JSON.stringify(logs));
    if (inventory.totalPills > 0 || inventory.boxes > 0) localStorage.setItem('taper_inventory', JSON.stringify(inventory));
    localStorage.setItem('taper_speed', speedModifier.toString());

    // 2. Cloud Sync (Smart)
    if (authUser && userProfile) {
        const syncToCloud = async () => {
            const totalDays = plan.length;
            const daysCompleted = logs.length;
            const progressPercentage = totalDays > 0 ? (daysCompleted / totalDays) * 100 : 0;
            
            try {
                // FIX: Define safeEmail explicitly before usage
                const safeEmail = authUser.email || email || '';

                // إعداد البيانات المراد تحديثها بناءً على الدور
                const updateData: any = {
                    email: safeEmail,
                    lastActive: new Date().toISOString(),
                    uid: authUser.uid,
                    ...userProfile, // Save flat structure for easier querying
                };

                // فقط المرضى والمستخدمين العاديين لديهم خطة وسجلات ومخزون
                if (userProfile.role === 'patient' || userProfile.role === 'normal_user') {
                    updateData.plan = plan;
                    updateData.logs = logs;
                    updateData.inventory = inventory;
                    updateData.speedModifier = speedModifier;
                    updateData.progress = progressPercentage;
                }

                // الأطباء لديهم بيانات إحصائية
                if (userProfile.role === 'doctor' && userProfile.doctorData) {
                    updateData.doctorData = userProfile.doctorData;
                }

                await setDoc(doc(db, "users", authUser.uid), updateData, { merge: true });
            } catch(e) {
                console.error("Cloud sync failed", e);
            }
        };
        const timeoutId = setTimeout(syncToCloud, 2000); // Debounce
        return () => clearTimeout(timeoutId);
    }
  }, [userProfile, plan, logs, inventory, speedModifier, authUser, email]); // Added email to deps

  const navigateTo = (view: AppView) => {
    if (view === currentView) return;
    setViewHistory(prev => [...prev, currentView]);
    setCurrentView(view);
  };

  const goBack = () => {
    if (viewHistory.length > 0) {
      const prevView = viewHistory[viewHistory.length - 1];
      setViewHistory(prev => prev.slice(0, -1));
      setCurrentView(prevView);
    } else {
      // Default fallback based on role
      if (userProfile?.role === 'doctor') {
          if (currentView !== AppView.DOCTOR_DASHBOARD) setCurrentView(AppView.DOCTOR_DASHBOARD);
      } else if (userProfile?.role === 'admin') {
          if (currentView !== AppView.ADMIN) setCurrentView(AppView.ADMIN);
      } else {
          if (currentView !== AppView.DASHBOARD) setCurrentView(AppView.DASHBOARD);
      }
    }
  };

  // --- AUTHENTICATION HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    // Hardcoded Admin Logic
    if (email === 'admin@islamguide.com' && password === 'bombaAZ36') {
        if (!auth) { setLoginError("Firebase not initialized."); setLoading(false); return; }
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            setAuthUser(cred.user);
            
            const adminProfile: UserProfile = { 
                email, 
                name: 'System Admin', 
                role: 'admin', 
                setupComplete: true, 
                durationMonths: 0 
            };
            
            await setDoc(doc(db, "users", cred.user.uid), adminProfile, { merge: true });
            setUserProfile(adminProfile);
            setCurrentView(AppView.ADMIN);
        } catch (err: any) {
             if (err.code === 'auth/user-not-found') {
                const newCred = await createUserWithEmailAndPassword(auth, email, password);
                setAuthUser(newCred.user);
                const adminProfile: UserProfile = { email, name: 'System Admin', role: 'admin', setupComplete: true, durationMonths: 0 };
                await setDoc(doc(db, "users", newCred.user.uid), adminProfile, { merge: true });
                setUserProfile(adminProfile);
                setCurrentView(AppView.ADMIN);
             } else {
                setLoginError(err.message);
             }
        }
        setLoading(false);
        return;
    }

    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        setAuthUser(cred.user);
      } catch (err: any) { setLoginError('Login Error: ' + err.message); }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setLoading(true);
    if (auth) {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            setAuthUser(result.user);
        } catch (err: any) { setLoginError('Google Login Error: ' + err.message); }
    }
    setLoading(false);
  };

  const setDemoCreds = () => { setEmail('islamaz@bomba.com'); setPassword('bombaAZ360'); }

  const handleLogout = () => {
    setAuthUser(null);
    setIsDemoMode(false);
    setUserProfile(null);
    setPlan([]);
    setLogs([]);
    setInventory({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
    setSpeedModifier(1.0);
    localStorage.clear();
    if (auth) auth.signOut().catch(console.error);
    window.location.reload();
  };

  // --- PLAN MANAGEMENT ---
  const startPlan = (customPlan: PlanDay[], speed: number = 1.0, planType: 'algorithm' | 'manual' = 'algorithm') => {
    setSpeedModifier(speed); 
    setPlan(customPlan);
    
    if (userProfile) {
        const newProfile: UserProfile = {
            ...userProfile,
            setupComplete: true,
            planType: planType,
            // If patient, assume doctor assigned it
            patientData: userProfile.role === 'patient' && userProfile.patientData ? {
                ...userProfile.patientData,
                isPlanAssigned: true 
            } : undefined
        };
        setUserProfile(newProfile);
    }
  };

  const submitDailyLog = (sleepHours: number, symptoms: string[]) => {
    if (selectedDose === null || selectedMood === null) return;

    // 1. Update Inventory
    const currentTotal = calculateTotalInventory(inventory);
    const newTotal = Math.max(0, Math.round((currentTotal - selectedDose) * 100) / 100);
    
    const newInventory: Inventory = { ...inventory, totalPills: newTotal };
    if (inventory.pillsPerBox > 0) {
        newInventory.boxes = Math.floor(newTotal / inventory.pillsPerBox);
        newInventory.loosePills = Math.round((newTotal % inventory.pillsPerBox) * 100) / 100;
    } else {
        newInventory.loosePills = newTotal;
    }
    setInventory(newInventory);

    // 2. Add Log
    const today = new Date().toISOString().split('T')[0];
    const newLog: DailyLog = { 
        date: today, doseTaken: selectedDose, mood: selectedMood, sleepHours, symptoms 
    };
    const newLogs = [...logs.filter(l => l.date !== today), newLog];
    setLogs(newLogs);

    // 3. Dynamic Adjustment (Only for Algorithm users)
    if (userProfile?.planType === 'algorithm') {
        const totalUsed = newLogs.reduce((acc, l) => acc + l.doseTaken, 0);
        const theoreticalInitial = newTotal + totalUsed;
        const newPlan = adjustPlan(plan, newLogs, theoreticalInitial, speedModifier);
        setPlan(newPlan);
    }
    
    // 4. Cleanup UI
    setSelectedDose(null);
    setSelectedMood(null);
    showToast(t('toast_log_success'));
  };

  const handleFreezePlan = () => {
      const today = new Date().toISOString().split('T')[0];
      const todayPlanItem = plan.find(p => p.date === today);
      if (!todayPlanItem) return;

      const freezeDose = todayPlanItem.plannedDose;
      const history = plan.filter(p => p.date <= today);
      const future = plan.filter(p => p.date > today);
      
      const newPlanDays: PlanDay[] = [];
      let currentDateStr = today;
      
      for (let i = 0; i < 3; i++) {
          currentDateStr = addDaysSafe(currentDateStr, 1);
          newPlanDays.push({
              date: currentDateStr,
              plannedDose: freezeDose,
              isPast: false
          });
      }
      
      future.forEach(day => {
          currentDateStr = addDaysSafe(currentDateStr, 1);
          newPlanDays.push({ ...day, date: currentDateStr });
      });
      
      setPlan([...history, ...newPlanDays]);
      showToast(t('toast_freeze_success'));
  };

  // --- SETTINGS: SPEED CONTROL ---
  const updateSpeedSettings = (newSpeed: number) => {
      setSpeedModifier(newSpeed);
      if (userProfile?.planType === 'algorithm') {
          const currentInv = calculateTotalInventory(inventory);
          const totalUsed = logs.reduce((a, b) => a + b.doseTaken, 0);
          const theoreticalInitial = currentInv + totalUsed;
          
          const newPlan = adjustPlan(plan, logs, theoreticalInitial, newSpeed);
          setPlan(newPlan);
          showToast(t('toast_speed_updated'));
      }
  };

  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); }

  const resetAllData = async () => {
    if (confirm('Are you sure? This will wipe everything.')) {
      setLoading(true);
      localStorage.clear();
      setUserProfile(null);
      setPlan([]);
      setLogs([]);
      setInventory({ boxes: 0, pillsPerBox: 0, loosePills: 0, totalPills: 0 });
      setAuthUser(null);
      setIsDemoMode(false);
      if (auth) try { await auth.signOut(); } catch (e) {}
      window.location.reload();
    }
  };

  // -- CALCULATED PROPS --
  const todayDate = new Date().toISOString().split('T')[0];
  const todayPlan = plan.find(p => p.date === todayDate);
  const todayLog = logs.find(l => l.date === todayDate);
  const daysCompleted = logs.length;
  const totalDays = plan.length;
  const progressPercentage = totalDays > 0 ? (daysCompleted / totalDays) * 100 : 0;
  
  const recentLogs = logs.slice(-3);
  const badMoodCount = recentLogs.filter(l => l.mood === 'bad').length;
  const poorSleep = recentLogs.length >= 3 && (recentLogs.reduce((acc, l) => acc + (l.sleepHours || 7), 0) / 3) < 5;
  const showDoctorWarning = badMoodCount >= 3 || poorSleep;

  // -- RENDER STATES --

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-indigo-400 font-bold tracking-widest animate-pulse">LOADING SYSTEM...</div>;

  // 1. LOGIN SCREEN
  if (!authUser && !isDemoMode) {
    return <LoginView handleLogin={handleLogin} handleGoogleLogin={handleGoogleLogin} email={email} setEmail={setEmail} password={password} setPassword={setPassword} loginError={loginError} setDemoCreds={setDemoCreds} />;
  }

  // 2. ONBOARDING (If user exists but setup not complete)
  if (userProfile && !userProfile.setupComplete && !userProfile.role?.includes('admin')) {
    return <OnboardingView 
        userProfile={userProfile} 
        setUserProfile={setUserProfile} 
        inventory={inventory} 
        setInventory={setInventory} 
        currentDoseHabit={currentDoseHabit} 
        setCurrentDoseHabit={setCurrentDoseHabit} 
        startPlan={startPlan} 
        email={authUser?.email || email} 
        handleLogout={handleLogout} 
    />;
  }

  // 3. MAIN APP ROUTING
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200" dir={dir}>
      {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
              <Check size={18} /> {toastMessage}
          </div>
      )}

      {/* Navigation Bars */}
      {(viewHistory.length > 0 || currentView !== AppView.DASHBOARD) && (
          <button onClick={goBack} className="fixed top-4 left-4 z-[60] p-3 rounded-full bg-slate-800/80 backdrop-blur-md text-white shadow-lg border border-white/10 hover:bg-indigo-600 transition-colors md:hidden">
              {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
      )}

      <Sidebar currentView={currentView} setCurrentView={navigateTo} handleLogout={handleLogout} userProfile={userProfile} />
      <MobileNav currentView={currentView} setCurrentView={navigateTo} />
      
      <div className="md:mr-80 p-4 md:p-12 pb-32 md:pb-12 transition-all duration-500">
        
        {/* --- DOCTOR WAITING SCREEN --- */}
        {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'pending' ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                    <Clock size={48} className="text-amber-500 animate-pulse" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">الحساب قيد المراجعة</h1>
                <p className="text-slate-400 max-w-lg leading-relaxed">
                    شكراً لتسجيلك يا دكتور {userProfile.name}. طلبك الآن قيد المراجعة من قبل إدارة النظام للتحقق من بيانات الترخيص.
                </p>
                <div className="mt-8 p-4 bg-slate-900 rounded-xl border border-white/5 text-xs text-slate-500 font-mono">
                    Doctor ID: {authUser?.uid} <br/> License: {userProfile.doctorData?.licenseNumber}
                </div>
            </div>
        ) : 

        /* --- PATIENT WAITING SCREEN --- */
        userProfile?.role === 'patient' && !userProfile.patientData?.isPlanAssigned ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                    <Loader2 size={48} className="text-indigo-500 animate-spin" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">بانتظار خطة الطبيب</h1>
                <p className="text-slate-400 max-w-lg leading-relaxed mb-6">
                    لقد تم إرسال ملفك إلى الطبيب <strong>{userProfile.patientData?.assignedDoctorName}</strong>. 
                    يرجى الانتظار حتى يقوم الطبيب بمراجعة حالتك ووضع الجدول العلاجي المناسب.
                </p>
                <Button onClick={() => setCurrentView(AppView.COMMUNITY)} variant="secondary">
                     دخول المجتمع مؤقتاً
                </Button>
            </div>
        ) : 

        /* --- APPROVED VIEWS --- */
        (
            <>
                {/* --- NORMAL USER & APPROVED PATIENT VIEWS --- */}
                {(userProfile?.role === 'normal_user' || (userProfile?.role === 'patient' && userProfile?.patientData?.isPlanAssigned)) && (
                    <>
                        {currentView === AppView.DASHBOARD && (
                            <DashboardView 
                                userProfile={userProfile}
                                plan={plan} logs={logs} todayPlan={todayPlan} todayLog={todayLog}
                                progressPercentage={progressPercentage} totalDays={totalDays} daysCompleted={daysCompleted}
                                showDoctorWarning={showDoctorWarning}
                                selectedDose={selectedDose} setSelectedDose={setSelectedDose}
                                selectedMood={selectedMood} setSelectedMood={setSelectedMood}
                                submitDailyLog={submitDailyLog} handleFreezePlan={handleFreezePlan}
                            />
                        )}
                        
                        {currentView === AppView.CALENDAR && (
                             <CalendarView plan={plan} logs={logs} todayDate={todayDate} userProfile={userProfile} />
                        )}
                        
                        {currentView === AppView.STATS && (
                             <StatsView logs={logs} plan={plan} userProfile={userProfile} />
                        )} 
                    </>
                )}

                {/* --- DOCTOR VIEWS --- */}
                {userProfile?.role === 'doctor' && userProfile.doctorData?.accountStatus === 'approved' && (
                     <>
                        {currentView === AppView.DOCTOR_DASHBOARD && <DoctorDashboardView />}
                        {currentView === AppView.DOCTOR_PATIENTS && <DoctorPatientsView />}
                     </>
                )}

                {/* --- SHARED VIEWS --- */}
                {currentView === AppView.COMMUNITY && userProfile && (
                     <CommunityView currentUser={{...userProfile, uid: authUser?.uid}} />
                )}
                
                {currentView === AppView.SUPPORT && userProfile && (
                     <SupportView user={{...userProfile, uid: authUser?.uid || ''}} />
                )}
                
                {/* FIX: Ensure userProfile is passed with valid data */}
                {currentView === AppView.ARTICLES && (
                    <ArticlesView userProfile={userProfile ? { ...userProfile, uid: authUser?.uid } : null} />
                )}
                
                {currentView === AppView.ADMIN && userProfile?.role === 'admin' && <AdminView />}
                
                {/* SETTINGS VIEW */}
                {currentView === AppView.SETTINGS && userProfile && (
                    <LayoutContainer>
                        <PageHeader title={t('settings_title')} subtitle={t('settings_subtitle')} />
                        <Card className="bg-slate-900 border-white/5">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Activity className="text-indigo-400" /> {t('pace_control')}</h2>
                            <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-2xl">{t('pace_desc')}</p>
                            
                            {userProfile?.role === 'patient' || userProfile?.planType === 'manual' ? (
                                 <div className="p-8 bg-slate-950 rounded-[2rem] border border-dashed border-slate-800 text-slate-500 text-center flex flex-col items-center gap-4">
                                     <ShieldCheck size={40} className="text-slate-700" />
                                     <p>هذه الخطة مدارة بواسطة {userProfile.role === 'patient' ? 'طبيبك المعالج' : 'النظام اليدوي'}. التعديل التلقائي غير متاح.</p>
                                 </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <button 
                                        onClick={() => updateSpeedSettings(0.8)} 
                                        className={`p-8 rounded-[2rem] border transition-all relative overflow-hidden ${speedModifier < 0.9 ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                                    >
                                        <Clock size={32} className="mx-auto mb-4" />
                                        <span className="block font-bold mb-1">{t('pace_slow')}</span>
                                        <span className="text-[10px] opacity-70">تمديد المدة للراحة</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => updateSpeedSettings(1.0)} 
                                        className={`p-8 rounded-[2rem] border transition-all relative overflow-hidden ${speedModifier >= 0.9 && speedModifier <= 1.1 ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl' : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                                    >
                                        <ShieldCheck size={32} className="mx-auto mb-4" />
                                        <span className="block font-bold mb-1">{t('pace_balanced')}</span>
                                        <span className="text-[10px] opacity-70">الوضع القياسي</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => updateSpeedSettings(1.2)} 
                                        className={`p-8 rounded-[2rem] border transition-all relative overflow-hidden ${speedModifier > 1.1 ? 'bg-rose-600 border-rose-500 text-white shadow-xl' : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                                    >
                                        <Zap size={32} className="mx-auto mb-4" />
                                        <span className="block font-bold mb-1">{t('pace_fast')}</span>
                                        <span className="text-[10px] opacity-70">تقليص المدة (مكثف)</span>
                                    </button>
                                </div>
                            )}
                        </Card>

                        {/* Account Actions */}
                        <Card className="border-rose-500/10 bg-rose-900/5 mt-8">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><AlertTriangle className="text-rose-500"/> {t('danger_zone')}</h2>
                            <Button variant="danger" onClick={resetAllData}>{t('factory_reset_btn')}</Button>
                        </Card>
                    </LayoutContainer>
                )}
            </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
```
---

### File: `firestore.rules`
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // --- Helper Functions ---
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Fetch the requesting user's profile
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // Check Roles
    function isAdmin() {
      return isSignedIn() && getUserData().role == 'admin';
    }
    
    function isApprovedDoctor() {
      let user = getUserData();
      return isSignedIn() && user.role == 'doctor' && user.doctorData.accountStatus == 'approved';
    }

    // --- 1. Users Collection ---
    match /users/{userId} {
      // Read: Owner, Admin, or Assigned Doctor
      allow read: if isSignedIn() && (
        isOwner(userId) || 
        isAdmin() || 
        // Allow reading public doctor profiles (for selection list)
        (resource.data.role == 'doctor' && resource.data.doctorData.accountStatus == 'approved') ||
        // Allow doctor to read their assigned patient's data
        (isApprovedDoctor() && resource.data.patientData.assignedDoctorId == request.auth.uid) ||
        // Allow doctor to search for users (to add them) - Restricted to essential fields in query usually, 
        // but for simplicity allow read if user has NO doctor yet (available users)
        (isApprovedDoctor() && !("assignedDoctorId" in resource.data.patientData))
      );

      // Create: Anyone (Registration)
      allow create: if isSignedIn() && isOwner(userId);

      // Update: 
      allow update: if isSignedIn() && (
        // 1. Admin can update anything (bans, approvals)
        isAdmin() || 
        // 2. Owner can update own profile (with restrictions)
        (isOwner(userId) && 
         // Prevent self-promoting to admin or unbanning self
         request.resource.data.role == resource.data.role && 
         request.resource.data.isBanned == resource.data.isBanned
        ) ||
        // 3. Doctor can update their patient's plan/status
        (isApprovedDoctor() && resource.data.patientData.assignedDoctorId == request.auth.uid) ||
        // 4. Doctor can assign themselves to a user (if user has no doctor)
        (isApprovedDoctor() && 
         resource.data.role != 'admin' && 
         resource.data.role != 'doctor' &&
         (resource.data.patientData == null || resource.data.patientData.assignedDoctorId == null)
        )
      );
    }

    // --- 2. Chat Rooms ---
    match /rooms/{roomId} {
      // Read: Logic for Private Doctor Rooms
      allow read: if isSignedIn() && (
        isAdmin() ||
        // Public Room
        resource.data.isDoctorRoom == false ||
        // Doctor's Own Room
        (resource.data.isDoctorRoom == true && resource.data.doctorId == request.auth.uid) ||
        // Patient assigned to this Doctor
        (resource.data.isDoctorRoom == true && getUserData().patientData.assignedDoctorId == resource.data.doctorId)
      );

      // Create: Admin or Approved Doctor
      allow create: if isAdmin() || isApprovedDoctor();

      // Update/Delete: Creator or Admin
      allow update, delete: if isSignedIn() && (resource.data.createdBy == request.auth.uid || isAdmin());
      
      // Messages Sub-collection
      match /messages/{msgId} {
        allow read: if isSignedIn(); // Parent room read rule handles access implicitly usually, but explicit check good
        allow create: if isSignedIn();
      }
    }

    // --- 3. Articles (CMS) ---
    match /articles/{articleId} {
      // Everyone can read published articles
      allow read: if isSignedIn() && resource.data.isPublished == true;
      
      // Admin or Approved Doctor can write
      allow create: if isAdmin() || isApprovedDoctor();
      allow update, delete: if isAdmin() || (isApprovedDoctor() && resource.data.authorId == request.auth.uid);
    }

    // --- 4. Support Tickets ---
    match /tickets/{ticketId} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isAdmin() || isApprovedDoctor());
      allow create: if isSignedIn();
      allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || isAdmin() || isApprovedDoctor());
    }

    // --- 5. Audit Logs ---
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      allow create: if isSignedIn(); // Allow system to log actions
      allow update, delete: if false;
    }
  }
}
```
---

### File: `index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-[#020617] text-slate-200 antialiased;
    /* تحسين عرض الخطوط العربية */
    font-family: 'Tajawal', 'Inter', sans-serif;
    font-feature-settings: "ss01", "ss02", "cv01", "cv02";
    -webkit-font-smoothing: antialiased;
  }
}

@layer utilities {
  /* إخفاء شريط التمرير مع الحفاظ على الوظيفة (للموبايل) */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }

  /* شريط تمرير مخصص ونحيف للقوائم الجانبية والدردشة */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-slate-900/30 rounded-full;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-700/50 rounded-full hover:bg-slate-600 transition-colors border-2 border-transparent bg-clip-content;
  }
}

/* === مكتبة الرسوم المتحركة (Custom Animations) === */
/* هذه التعريفات تحاكي مكتبة tailwindcss-animate لضمان عمل التأثيرات */

@keyframes enter {
  from {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), 1) rotate(var(--tw-enter-rotate, 0));
  }
}

@keyframes exit {
  to {
    opacity: var(--tw-exit-opacity, 1);
    transform: translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), 1) rotate(var(--tw-exit-rotate, 0));
  }
}

@keyframes ping-slow {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-in {
  animation-name: enter;
  animation-duration: 300ms; /* Default duration */
  --tw-enter-opacity: initial;
  --tw-enter-scale: initial;
  --tw-enter-rotate: initial;
  --tw-enter-translate-x: initial;
  --tw-enter-translate-y: initial;
}

.fade-in {
  --tw-enter-opacity: 0;
}

.zoom-in {
  --tw-enter-scale: 0.95;
}

/* اتجاهات الحركة */
.slide-in-from-top-2 {
  --tw-enter-translate-y: -0.5rem;
}
.slide-in-from-top-4 {
  --tw-enter-translate-y: -1rem;
}

.slide-in-from-bottom-2 {
  --tw-enter-translate-y: 0.5rem;
}
.slide-in-from-bottom-4 {
  --tw-enter-translate-y: 1rem;
}
.slide-in-from-bottom-8 {
  --tw-enter-translate-y: 2rem;
}
.slide-in-from-bottom-20 {
  --tw-enter-translate-y: 5rem;
}

.slide-in-from-left-4 {
  --tw-enter-translate-x: -1rem;
}

.slide-in-from-right-2 {
  --tw-enter-translate-x: 0.5rem;
}
.slide-in-from-right-4 {
  --tw-enter-translate-x: 1rem;
}
.slide-in-from-right-8 {
  --tw-enter-translate-x: 2rem;
}

/* مدد زمنية مخصصة */
.duration-300 { animation-duration: 300ms; }
.duration-500 { animation-duration: 500ms; }
.duration-700 { animation-duration: 700ms; }
.duration-1000 { animation-duration: 1000ms; }

/* تأخير الحركة */
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }

/* تنسيقات الطباعة */
@media print {
  body {
    background-color: white;
    color: black;
  }
}
```
---

### File: `index.html`
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    
    <title>Islam's Guide - رفيق التعافي الذكي</title>
    <meta name="description" content="نظام ذكي للتعافي التدريجي الآمن، يجمع بين الخوارزميات والإشراف الطبي.">
    <meta name="theme-color" content="#020617">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet">

    <!-- Tailwind CSS (CDN for quick prototyping/fallback, though build uses PostCSS) -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <style>
      body {
        background-color: #020617;
        color: #e2e8f0;
        font-family: 'Tajawal', sans-serif;
        overflow-x: hidden;
      }
      /* Custom Scrollbar Globally */
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: #0f172a; }
      ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: #475569; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./index.tsx"></script>
  </body>
</html>
```
---

### File: `index.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // استيراد ملف التصميم الذي يحتوي على Tailwind و Animations

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```
---

### File: `metadata.json`
```json
{
  "name": "Islam's Guide",
  "description": "A smart, mathematically driven medication tapering assistant that adapts to your daily progress.",
  "requestFramePermissions": []
}
```
---

### File: `package.json`
```json
{
  "name": "islams-guide-smart-recovery",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "firebase": "^10.8.0",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.64",
    "@types/react-dom": "^18.2.21",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.4"
  }
}
```
---

### File: `postcss.config.js`
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```
---

### File: `README.md`
```md
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1QtyjxMs5XikIhSOz8I1UJdoCAdi7lxLX

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

```
---

### File: `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",        // يشمل الملفات في الجذر مثل App.tsx و index.tsx
    "./views/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'Inter', 'sans-serif'],
      },
      animation: {
        'in': 'enter 0.3s ease-out',
        'out': 'exit 0.15s ease-in',
      },
    },
  },
  plugins: [],
}
```
---

### File: `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["."],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```
---

### File: `tsconfig.node.json`
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```
---

### File: `types.ts`
```ts
// --- Basic Medication Types ---
export type MedType = 'narcotic' | 'psychiatric' | 'normal' | null;
export type MedForm = 'tablet' | 'liquid'; 
export type MedUnit = 'mg' | 'g' | 'ml' | 'l';

// --- ROLES & PERMISSIONS ---
// تم فصل "مستخدم عادي" عن "مريض" بناءً على طلبك
export type UserRole = 'admin' | 'doctor' | 'normal_user' | 'patient';

// --- DOCTOR SPECIFIC TYPES ---
export type DoctorAccountStatus = 'pending' | 'approved' | 'rejected';

export interface DoctorProfileData {
  specialty: string;        // التخصص (نفسي، إدمان، عام...)
  licenseNumber: string;    // رقم الترخيص الطبي (للاعتماد)
  clinicLocation?: string;  // مكان العيادة
  phoneNumber: string;      // رقم الهاتف
  bio: string;              // نبذة تظهر للمرضى
  accountStatus: DoctorAccountStatus; 
  
  // Stats for Admin & Doctor Dashboard
  totalPatients: number;
  activePatients: number;
  recoveredCount: number;
  doctorLevel: number; // يزداد مع عدد المتعافين
}

// --- PATIENT SPECIFIC TYPES (For those following a doctor) ---
export interface PatientProfileData {
  assignedDoctorId: string;
  assignedDoctorName: string;
  isPlanAssigned: boolean; // هل قام الطبيب بوضع الخطة أم لا يزال المريض في الانتظار؟
  isRecovered: boolean;    // هل قام الطبيب بإغلاق الملف (تشافى)؟
  recoveryDate?: string;   // تاريخ التعافي (اختياري)
}

// --- MAIN USER PROFILE ---
export interface UserProfile {
  uid?: string; 
  email: string;
  name: string;
  role: UserRole; // المحدد الرئيسي لنوع الحساب
  
  // -- Optional Data Sections based on Role --
  doctorData?: DoctorProfileData;   // موجود فقط إذا كان Role = doctor
  patientData?: PatientProfileData; // موجود فقط إذا كان Role = patient
  
  // -- Medical Data (For Normal Users & Patients) --
  medType?: MedType;
  medForm?: MedForm;
  medUnit?: MedUnit;
  durationMonths: number;
  setupComplete: boolean; // للمستخدم العادي: هل أدخل الجرعات؟ للطبيب: هل أدخل بياناته؟
  
  // -- Smart System Config --
  planType?: 'algorithm' | 'manual'; // algorithm للمستخدم العادي، manual للمريض (خطة طبيب)
  speedModifier?: number; 
  
  // -- General System Flags --
  isBanned?: boolean;
  lastActive?: string; 
  progress?: number;   
  streak?: number;     
  
  doctorNotes?: string; // ملاحظات سرية (سواء كتبها الطبيب للمريض أو الأدمن للمستخدم)
  isFlagged?: boolean; 
  
  // For Logging/Charts (Optional in profile, mostly strictly in collections)
  logs?: DailyLog[];
  plan?: PlanDay[];
  inventory?: Inventory;
}

// --- INVENTORY & PLANNING ---
export interface Inventory {
  boxes: number;
  pillsPerBox: number;
  loosePills: number;
  totalPills: number;
}

export interface ManualPhase {
  dose: number;
  days: number;
  interval?: number; 
}

export interface DailyLog {
  date: string; 
  doseTaken: number;
  mood: 'bad' | 'normal' | 'good' | null;
  sleepHours?: number; 
  symptoms?: string[]; 
  notes?: string;
}

export interface PlanDay {
  date: string;
  plannedDose: number;
  isPast: boolean;
  log?: DailyLog;
}

// --- CONTENT & CMS (Admin & Doctor) ---
export type ArticleCategory = 'medical' | 'motivation' | 'tip' | 'news' | 'announcement';

export interface Article {
  id?: string;
  title: string;
  content: string;
  category: ArticleCategory; // تصنيف المحتوى
  isPublished: boolean;
  createdAt: number;
  authorName: string;
  authorId: string;
  authorRole: 'admin' | 'doctor'; // لمعرفة مصدر المحتوى
}

// --- CHAT & COMMUNITY ---
export interface ChatRoom {
  id: string;
  name: string;
  createdBy: string; 
  creatorName: string;
  createdAt: number;
  language?: string;
  
  // New: Private Doctor Rooms
  isDoctorRoom?: boolean; // هل هي غرفة خاصة بمرضى طبيب معين؟
  doctorId?: string;      // معرف الطبيب مالك الغرفة
}

export interface ChatMessage {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  
  // Flags to distinguish sender type in UI
  role: UserRole; 
  // FIX: Added optional flags to prevent TS errors in CommunityView
  isDoctor?: boolean;
  isAdmin?: boolean;
}

// --- SUPPORT TICKETS ---
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';

export interface Ticket {
  id?: string;
  userId: string;
  userEmail: string;
  subject: string;
  status: TicketStatus;
  createdAt: number;
  lastUpdate: number;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  senderId: string; 
  senderName: string;
  text: string;
  timestamp: number;
  isAdmin: boolean;
}

// --- AUDIT LOGS (Admin) ---
export interface AuditLog {
  id?: string;
  adminId: string;
  adminName: string;
  action: string; 
  targetId?: string; 
  details: string;
  timestamp: number;
}

// --- APP NAVIGATION VIEWS ---
export enum AppView {
  // Common
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS',
  ARTICLES = 'ARTICLES',
  
  // Normal User / Patient Views
  CALENDAR = 'CALENDAR',
  STATS = 'STATS',
  COMMUNITY = 'COMMUNITY',
  SUPPORT = 'SUPPORT',
  
  // Doctor Views
  DOCTOR_DASHBOARD = 'DOCTOR_DASHBOARD', // الرئيسية للطبيب (احصائيات)
  DOCTOR_PATIENTS = 'DOCTOR_PATIENTS',   // إدارة المرضى
  DOCTOR_MESSAGES = 'DOCTOR_MESSAGES',   // رسائل المرضى
  
  // Admin Views
  ADMIN = 'ADMIN',
  
  // System States
  WAITING_APPROVAL = 'WAITING_APPROVAL', // للطبيب الذي ينتظر موافقة الأدمن
  WAITING_PLAN = 'WAITING_PLAN'          // للمريض الذي ينتظر خطة الطبيب
}
```
---

### File: `vite.config.ts`
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true // يسمح بالوصول من الشبكة المحلية (مفيد للاختبار على الموبايل)
  }
})
```
---

## 📊 Stats
- Total Files: 34
- Total Characters: 318221
- Estimated Tokens: ~79.556 (GPT-4 Context)
