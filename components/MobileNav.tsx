import React from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, Activity, Settings } from 'lucide-react';
import { AppView } from '../types';

interface MobileNavProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

export const MobileNav = ({ currentView, setCurrentView }: MobileNavProps) => {
  const menuItems = [
    { id: AppView.DASHBOARD, icon: LayoutDashboard, label: 'الرئيسية' },
    { id: AppView.CALENDAR, icon: CalendarIcon, label: 'الجدول' },
    { id: AppView.STATS, icon: Activity, label: 'تحليل' },
    { id: AppView.SETTINGS, icon: Settings, label: 'إعدادات' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 h-20 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 flex items-center justify-between px-6 animate-in slide-in-from-bottom-20 duration-700">
      {menuItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group ${
                isActive ? 'text-indigo-400 -translate-y-2' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className={`p-3 rounded-full transition-all duration-300 ${
                isActive ? 'bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.4)] scale-110' : 'bg-transparent group-hover:bg-white/5'
            }`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            {isActive && (
                <span className="absolute -bottom-5 text-[10px] font-bold tracking-wide animate-in fade-in slide-in-from-top-1">
                    {item.label}
                </span>
            )}
          </button>
        );
      })}
    </div>
  );
};