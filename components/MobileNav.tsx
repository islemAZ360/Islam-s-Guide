import React from 'react';
import { 
  LayoutDashboard, Calendar as CalendarIcon, Activity, Settings, Users, 
  LifeBuoy, ShieldAlert, MessageSquare 
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
        // --- تصحيح: تغيير المسمى والأيقونة للأدمن في الموبايل أيضاً ---
        { id: AppView.COMMUNITY, icon: MessageSquare, label: language === 'ar' ? 'المجتمع' : 'Chat' },
        // -------------------------------------------------------------
        { id: AppView.SUPPORT, icon: LifeBuoy, label: t('nav_support') },
       );
    } 
    // 2. DOCTOR MENU
    else if (role === 'doctor') {
        items.push(
            { id: AppView.DOCTOR_DASHBOARD, icon: LayoutDashboard, label: 'Dash' },
            { id: AppView.DOCTOR_PATIENTS, icon: Users, label: 'Patients' },
            { id: AppView.COMMUNITY, icon: MessageSquare, label: 'Chat' },
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