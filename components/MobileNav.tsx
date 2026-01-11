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
        { id: AppView.COMMUNITY, icon: MessageSquare, label: language === 'ar' ? 'المجتمع' : 'Chat' },
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
             );
        }
    }
    
    // Settings always available
    items.push({ id: AppView.SETTINGS, icon: Settings, label: t('nav_settings') });
    
    return items;
  };

  const menuItems = getMenuItems();

  return (
    // الجزيرة العائمة: glass class + rounded-full + margins
    <div className="md:hidden fixed bottom-5 left-4 right-4 h-[70px] glass rounded-[2rem] z-50 animate-in slide-in-from-bottom-8 flex items-center justify-between px-2 shadow-2xl shadow-black/50">
      
      {menuItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`
              flex-1 flex flex-col items-center justify-center gap-1 h-full relative group transition-all duration-500
              ${isActive ? '-translate-y-2' : ''}
            `}
          >
            {/* الخلفية المضيئة للعنصر النشط */}
            <div className={`
              absolute top-2 w-10 h-10 rounded-full blur-lg transition-all duration-500
              ${isActive ? 'bg-indigo-500/40 opacity-100' : 'opacity-0'}
            `}></div>

            {/* الأيقونة */}
            <div className={`
              relative z-10 p-2.5 rounded-full transition-all duration-300
              ${isActive 
                ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-[#020617]' 
                : 'text-slate-500 hover:text-slate-300'}
            `}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            
            {/* النص */}
            <span className={`
              text-[10px] font-bold tracking-wide transition-all duration-300 absolute bottom-2
              ${isActive ? 'opacity-100 text-white translate-y-0' : 'opacity-0 translate-y-2'}
            `}>
                {item.label}
            </span>
            
            {/* نقطة صغيرة للعناصر غير النشطة بدلاً من النص لتوفير المساحة */}
            {!isActive && (
                 <span className="w-1 h-1 rounded-full bg-slate-700 absolute bottom-3 transition-all duration-300 group-hover:bg-slate-500"></span>
            )}
          </button>
        );
      })}
    </div>
  );
};