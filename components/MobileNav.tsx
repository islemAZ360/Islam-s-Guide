import React from 'react';
import { 
  LayoutDashboard, Calendar as CalendarIcon, Activity, Settings, Users, 
  LifeBuoy, ShieldAlert, MessageSquare, BookOpen
} from 'lucide-react';
import { AppView, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface MobileNavProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  userProfile?: UserProfile | null;
}

export const MobileNav = ({ currentView, setCurrentView, userProfile }: MobileNavProps) => {
  const { t, language } = useLanguage();

  const getMenuItems = () => {
    const role = userProfile?.role;
    const items = [];

    // 1. ADMIN MENU
    if (role === 'admin') {
       items.push(
        { id: AppView.ADMIN, icon: ShieldAlert, label: t('nav_admin') },
        { id: AppView.COMMUNITY, icon: MessageSquare, label: language === 'ar' ? 'المجتمع' : 'Chat' },
        { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
       );
    } 
    // 2. DOCTOR MENU
    else if (role === 'doctor') {
        items.push(
            { id: AppView.DOCTOR_DASHBOARD, icon: LayoutDashboard, label: 'Dash' },
            { id: AppView.DOCTOR_PATIENTS, icon: Users, label: 'Patients' },
            { id: AppView.ARTICLES, icon: BookOpen, label: 'Articles' },
            { id: AppView.COMMUNITY, icon: MessageSquare, label: 'Chat' },
        );
    } 
    // 3. PATIENT / NORMAL USER MENU
    else {
        if (role === 'patient' && !userProfile?.patientData?.isPlanAssigned) {
             items.push(
                { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
                { id: AppView.ARTICLES, icon: BookOpen, label: t('nav_articles') },
                { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
             );
        } else {
             items.push(
                { id: AppView.DASHBOARD, icon: LayoutDashboard, label: t('nav_dashboard') },
                { id: AppView.CALENDAR, icon: CalendarIcon, label: t('nav_calendar') },
                { id: AppView.STATS, icon: Activity, label: t('nav_stats') },
                { id: AppView.ARTICLES, icon: BookOpen, label: t('nav_articles') },
                { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
             );
        }
    }
    
    // Settings always available
    items.push({ id: AppView.SETTINGS, icon: Settings, label: t('nav_settings') });
    
    return items;
  };

  const menuItems = getMenuItems();

  return (
    <nav 
      className="md:hidden fixed bottom-6 left-6 right-6 h-[80px] bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] z-50 shadow-2xl shadow-black/50 overflow-hidden ring-1 ring-white/5"
      aria-label={language === 'ar' ? 'القائمة الرئيسية للجوال' : 'Mobile Main Navigation'}
    >
      {/* Glossy Reflection Effect */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <ul className="flex items-center justify-between h-full px-2 m-0 list-none w-full relative z-10">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <li key={item.id} className="flex-1 h-full min-w-0 flex items-center justify-center">
              <button
                onClick={() => setCurrentView(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className={`
                  relative flex flex-col items-center justify-center gap-1 transition-all duration-300 w-full h-full focus:outline-none group
                `}
              >
                {/* Active Indicator Backdrop */}
                <div className={`
                  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl transition-all duration-500
                  ${isActive ? 'bg-indigo-500/20 scale-100 rotate-0' : 'bg-transparent scale-50 rotate-45'}
                `}></div>

                {/* Glow behind icon when active */}
                <div className={`
                  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full blur-xl transition-all duration-300
                  ${isActive ? 'bg-indigo-500/40 opacity-100' : 'opacity-0'}
                `}></div>

                {/* Icon */}
                <div className={`
                  relative z-10 p-2 rounded-xl transition-all duration-300 ease-out transform
                  ${isActive 
                    ? '-translate-y-1' 
                    : 'translate-y-0 text-slate-500 group-hover:text-slate-300'}
                `}>
                    <item.icon 
                        size={24} 
                        strokeWidth={isActive ? 2.5 : 2} 
                        className={`transition-colors duration-300 ${isActive ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`}
                        aria-hidden="true" 
                    />
                </div>
                
                {/* Label (Dynamic Visibility) */}
                <span className={`
                  text-[10px] font-bold tracking-wide transition-all duration-300 absolute bottom-3 whitespace-nowrap
                  ${isActive ? 'opacity-100 translate-y-0 text-white' : 'opacity-0 translate-y-2 pointer-events-none'}
                `}>
                    {item.label}
                </span>
                
                {/* Active Dot (Small Detail) */}
                {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-400 shadow-[0_0_5px_#818cf8]"></span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};