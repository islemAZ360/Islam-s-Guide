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
            { id: AppView.ARTICLES, icon: BookOpen, label: 'Articles' }, // Added for Doctors
            { id: AppView.COMMUNITY, icon: MessageSquare, label: 'Chat' },
        );
    } 
    // 3. PATIENT / NORMAL USER MENU
    else {
        if (role === 'patient' && !userProfile?.patientData?.isPlanAssigned) {
             items.push(
                { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
                { id: AppView.ARTICLES, icon: BookOpen, label: t('nav_articles') }, // Added for new Patients
                { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
             );
        } else {
             items.push(
                { id: AppView.DASHBOARD, icon: LayoutDashboard, label: t('nav_dashboard') },
                { id: AppView.CALENDAR, icon: CalendarIcon, label: t('nav_calendar') },
                { id: AppView.STATS, icon: Activity, label: t('nav_stats') },
                { id: AppView.ARTICLES, icon: BookOpen, label: t('nav_articles') }, // Added for Active Users
                // Community is still accessible but maybe deprioritized if space is tight, 
                // but let's keep it if we can fit 5 items + Settings = 6.
                // If 6 is too many, we might swap Community/Articles or Stats/Articles.
                // Given labels hide on inactive, 6 items fits on modern phones.
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
      className="md:hidden fixed bottom-5 left-4 right-4 h-[70px] glass rounded-[2rem] z-50 animate-in slide-in-from-bottom-8 shadow-2xl shadow-black/50 overflow-hidden"
      aria-label={language === 'ar' ? 'القائمة الرئيسية للجوال' : 'Mobile Main Navigation'}
    >
      <ul className="flex items-center justify-between h-full px-1 m-0 list-none w-full">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <li key={item.id} className="flex-1 h-full min-w-0">
              <button
                onClick={() => setCurrentView(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className={`
                  w-full h-full flex flex-col items-center justify-center gap-1 relative group transition-all duration-500 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                  ${isActive ? '-translate-y-1' : ''}
                `}
              >
                {/* Active Glow Background */}
                <div className={`
                  absolute top-2 w-10 h-10 rounded-full blur-lg transition-all duration-500 pointer-events-none
                  ${isActive ? 'bg-indigo-500/40 opacity-100' : 'opacity-0'}
                `}></div>

                {/* Icon Container */}
                <div className={`
                  relative z-10 p-2.5 rounded-full transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-[#020617]' 
                    : 'text-slate-500 hover:text-slate-300'}
                `}>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                </div>
                
                {/* Label (Visible when active) */}
                <span className={`
                  text-[9px] font-bold tracking-wide transition-all duration-300 absolute bottom-1 whitespace-nowrap
                  ${isActive ? 'opacity-100 text-white translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
                `}>
                    {item.label}
                </span>
                
                {/* Inactive Dot Indicator */}
                {!isActive && (
                     <span className="w-1 h-1 rounded-full bg-slate-700 absolute bottom-2 transition-all duration-300 group-hover:bg-slate-500" aria-hidden="true"></span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};