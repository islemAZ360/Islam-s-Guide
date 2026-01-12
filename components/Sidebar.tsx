import React from 'react';
import { 
  LayoutDashboard, Calendar as CalendarIcon, Activity, Settings, LogOut, 
  Users, ShieldAlert, User as UserIcon, LifeBuoy, BookOpen, Stethoscope, 
  MessageSquare
} from 'lucide-react';
import { AppView, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './ui/LanguageSwitcher';

interface SidebarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  handleLogout: () => void;
  userProfile?: UserProfile | null;
}

export const Sidebar = ({ currentView, setCurrentView, handleLogout, userProfile }: SidebarProps) => {
  const { t, language } = useLanguage();

  const getMenuItems = () => {
    const role = userProfile?.role;
    const items = [];

    // 1. ADMIN MENU
    if (role === 'admin') {
      items.push(
        { id: AppView.ADMIN, icon: ShieldAlert, label: t('nav_admin') }, 
        { id: AppView.COMMUNITY, icon: MessageSquare, label: t('nav_community') },
        { id: AppView.ARTICLES, icon: BookOpen, label: t('tab_cms') },
        { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
      );
    }
    // 2. DOCTOR MENU
    else if (role === 'doctor') {
      items.push(
        { id: AppView.DOCTOR_DASHBOARD, icon: LayoutDashboard, label: t('nav_dashboard') },
        { id: AppView.DOCTOR_PATIENTS, icon: Users, label: t('manage_patients_title') }, 
        { id: AppView.ARTICLES, icon: BookOpen, label: t('nav_articles') },
        { id: AppView.COMMUNITY, icon: MessageSquare, label: t('comm_rooms') }, 
        { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
      );
      items.push({ id: AppView.SETTINGS, icon: Settings, label: t('nav_settings') });
    }
    // 3. PATIENT / NORMAL USER MENU
    else {
      if (role === 'patient' && !userProfile?.patientData?.isPlanAssigned) {
         items.push(
            { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
            { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
         );
      } else {
         items.push(
            { id: AppView.DASHBOARD, icon: LayoutDashboard, label: t('nav_dashboard') },
            { id: AppView.CALENDAR, icon: CalendarIcon, label: t('nav_calendar') },
            { id: AppView.STATS, icon: Activity, label: t('nav_stats') },
            { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
            { id: AppView.ARTICLES, icon: BookOpen, label: t('nav_articles') },
            { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
         );
      }
      items.push({ id: AppView.SETTINGS, icon: Settings, label: t('nav_settings') });
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <aside 
      className="hidden md:flex flex-col w-80 h-screen fixed right-0 top-0 overflow-y-auto z-50 border-l border-white/5 bg-slate-950/80 backdrop-blur-2xl shadow-2xl"
      aria-label={language === 'ar' ? 'القائمة الجانبية' : 'Sidebar Navigation'}
    >
      
      {/* Header */}
      <div className="p-8 pb-4 relative shrink-0">
        {/* Ambient Glow behind Logo */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none"></div>
        
        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 relative z-10 mb-1">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          Islam's Guide
        </h2>
        
        <div className="pr-[3.25rem]">
            {userProfile?.role === 'doctor' && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {language === 'ar' ? 'نسخة الأطباء' : 'Doctor Edition'}
                </span>
            )}
            {userProfile?.role === 'admin' && (
                <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
                </span>
            )}
            {(userProfile?.role === 'patient' || userProfile?.role === 'normal_user') && (
                <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                    Smart Edition <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
                </span>
            )}
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button 
                  onClick={() => setCurrentView(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                    ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}
                  `}
                >
                  {/* Active Background Gradient */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-indigo-600/5 to-transparent border-r-[3px] border-indigo-500 opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
                  )}

                  <item.icon 
                    className={`
                      w-5 h-5 relative z-10 transition-transform duration-300 
                      ${isActive ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'group-hover:scale-110'}
                    `} 
                    aria-hidden="true"
                  />
                  
                  <span className={`font-bold text-lg tracking-wide truncate relative z-10 ${isActive ? 'text-indigo-50' : ''}`}>
                    {item.label}
                  </span>
                  
                  {/* Admin Notification Dot */}
                  {item.id === AppView.ADMIN && (
                      <span className="mr-auto w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)] relative z-10" aria-label="New Notifications"></span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer / User Profile */}
      <div className="p-6 shrink-0 space-y-4 relative z-10">
        <LanguageSwitcher />
        
        {/* User Card */}
        <div className="glass p-4 rounded-2xl flex items-center gap-3 group hover:border-indigo-500/30 transition-all cursor-default" role="group" aria-label="User Profile">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold border border-white/5 group-hover:scale-105 transition-transform" aria-hidden="true">
                {userProfile?.role === 'doctor' ? <Stethoscope size={18} /> : (userProfile?.name?.charAt(0).toUpperCase() || <UserIcon size={18} />)}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{userProfile?.name || 'Guest'}</p>
                <p className="text-[10px] text-slate-500 truncate">{userProfile?.role?.toUpperCase()}</p>
            </div>
            <button 
                onClick={handleLogout} 
                className="p-2 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                title={t('logout')}
                aria-label={t('logout')}
            >
                <LogOut size={18} aria-hidden="true" />
            </button>
        </div>
      </div>
    </aside>
  );
};