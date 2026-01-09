import React from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, Activity, Settings, LogOut, Users, ShieldAlert } from 'lucide-react';
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

  const menuItems = [
    { id: AppView.DASHBOARD, icon: LayoutDashboard, label: t('nav_dashboard') },
    { id: AppView.CALENDAR, icon: CalendarIcon, label: t('nav_calendar') },
    { id: AppView.STATS, icon: Activity, label: t('nav_stats') },
    { id: AppView.COMMUNITY, icon: Users, label: t('nav_community') },
    { id: AppView.SETTINGS, icon: Settings, label: t('nav_settings') },
  ];

  if (userProfile?.isAdmin) {
      menuItems.push({ id: AppView.ADMIN, icon: ShieldAlert, label: t('nav_admin') });
  }

  return (
    <div className="hidden md:flex flex-col w-80 bg-slate-950/80 backdrop-blur-2xl border-l border-white/5 h-screen fixed right-0 top-0 overflow-y-auto z-50 shadow-2xl">
      <div className="p-10 border-b border-white/5 relative overflow-hidden shrink-0">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none"></div>
        
        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Activity className="w-6 h-6 text-white" />
          </div>
          Islam's Guide
        </h2>
        <span className="text-[10px] text-slate-500 mr-[3.25rem] block mt-2 uppercase tracking-[0.2em] font-bold">Pro Edition</span>
      </div>
      
      <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${currentView === item.id 
              ? 'bg-gradient-to-r from-indigo-600/10 to-transparent text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]' 
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'}`}
          >
            {currentView === item.id && (
              <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_indigo]"></div>
            )}
            <item.icon className={`w-5 h-5 transition-transform duration-300 ${currentView === item.id ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-slate-600 group-hover:text-slate-400'}`} />
            <span className="font-bold text-lg tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-8 border-t border-white/5 space-y-4 shrink-0">
        <LanguageSwitcher />
        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20 group hover:shadow-[0_0_20px_rgba(244,63,94,0.1)]">
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};