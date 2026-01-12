import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'ar', label: 'العربية', accessibleLabel: 'تغيير اللغة إلى العربية' },
    { code: 'en', label: 'English', accessibleLabel: 'Switch to English' },
    { code: 'ru', label: 'Русский', accessibleLabel: 'Переключиться на русский' }
  ] as const;
  
  return (
    <div 
      className="flex items-center gap-1 p-1 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:border-white/20 transition-colors group"
      role="group"
      aria-label={language === 'ar' ? 'اختيار اللغة' : 'Language Selection'}
    >
      
      {/* Icon Indicator */}
      <div className="px-2 text-slate-400 group-hover:text-indigo-400 transition-colors" aria-hidden="true">
        <Globe size={14} />
      </div>

      {languages.map((lang) => {
        const isActive = language === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            aria-pressed={isActive}
            aria-label={lang.accessibleLabel}
            title={lang.label}
            className={`
              relative px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
              ${isActive 
                ? 'text-white shadow-lg shadow-indigo-500/30' 
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}
            `}
          >
            {/* Active Background Gradient */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl -z-10 animate-in zoom-in"></div>
            )}
            
            {lang.code}
          </button>
        );
      })}
    </div>
  );
};