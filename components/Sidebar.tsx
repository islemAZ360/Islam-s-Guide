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
      // ملاحظة: لم نقم بإضافة الإعدادات هنا للأدمن
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
      // الطبيب يحتاج الإعدادات؟ عادة نعم، لكن إذا أردت إزالتها له أيضاً أخبرني. سأتركها للطبيب والمستخدم العادي حالياً.
      items.push({ id: AppView.SETTINGS, icon: Settings, label: t('nav_settings') });
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
      // إضافة الإعدادات للمستخدم العادي والمريض
      items.push({ id: AppView.SETTINGS, icon: Settings, label: t('nav_settings') });
    }

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