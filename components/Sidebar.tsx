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
  const { t, language, dir } = useLanguage();

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
      className="hidden md:flex flex-col w-80 h-screen sticky top-0 z-40 bg-[#020617] border-r border-white/5 relative overflow-hidden"
      aria-label={language === 'ar' ? 'القائمة الجانبية' : 'Sidebar Navigation'}
    >
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-96 bg-indigo-600/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-600/5 blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="p-8 pb-6 relative shrink-0 z-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter">
            Islam's Guide
          </h2>
        </div>
        
        <div className="pr-12 pl-1 mt-2">
            {userProfile?.role === 'doctor' && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{language === 'ar' ? 'نسخة الأطباء' : 'Doctor Edition'}</span>
                </div>
            )}
            {userProfile?.role === 'admin' && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 w-fit">
                    <ShieldAlert size={10} className="text-rose-500" />
                    <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">{language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}</span>
                </div>
            )}
            {(userProfile?.role === 'patient' || userProfile?.role === 'normal_user') && (
                <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                    SMART RECOVERY
                </span>
            )}
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar relative z-10">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button 
                  onClick={() => setCurrentView(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden outline-none
                    ${isActive 
                        ? 'text-white shadow-lg shadow-indigo-900/20' 
                        : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'
                    }
                  `}
                >
                  {/* Active Background (Glass Pill) */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 rounded-2xl"></div>
                  )}

                  {/* Icon */}
                  <item.icon 
                    className={`
                      w-5 h-5 relative z-10 transition-transform duration-300 
                      ${isActive ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'group-hover:scale-110'}
                    `} 
                    aria-hidden="true"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  {/* Label */}
                  <span className={`font-bold text-sm tracking-wide truncate relative z-10 ${isActive ? 'text-indigo-50' : ''}`}>
                    {item.label}
                  </span>
                  
                  {/* Active Indicator Dot */}
                  {isActive && (
                      <div className={`absolute w-1 h-4 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1] top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'left-0 rounded-l-none' : 'right-0 rounded-r-none'}`}></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer / User Profile */}
      <div className="p-4 relative z-10">
        <div className="bg-[#0f172a]/50 border border-white/5 rounded-3xl p-4 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
               <LanguageSwitcher />
               <button 
                    onClick={handleLogout} 
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/20"
                    title={t('logout')}
                    aria-label={t('logout')}
                >
                    <LogOut size={18} aria-hidden="true" />
                </button>
            </div>

            {/* User Card */}
            <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-indigo-300 font-bold border border-white/10 shrink-0">
                    {userProfile?.role === 'doctor' ? <Stethoscope size={18} /> : (userProfile?.name?.charAt(0).toUpperCase() || <UserIcon size={18} />)}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{userProfile?.name || 'Guest'}</p>
                    <p className="text-[10px] text-slate-500 truncate font-mono uppercase tracking-wider">{userProfile?.role}</p>
                </div>
            </div>
        </div>
      </div>
    </aside>
  );
};