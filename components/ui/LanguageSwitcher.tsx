import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex items-center gap-1 p-1 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:border-white/20 transition-colors group">
      
      {/* Icon Indicator */}
      <div className="px-2 text-slate-400 group-hover:text-indigo-400 transition-colors">
        <Globe size={14} />
      </div>

      {(['ar', 'en', 'ru'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`
            relative px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300
            ${language === lang 
              ? 'text-white shadow-lg shadow-indigo-500/30' 
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}
          `}
        >
          {/* خلفية متدرجة للعنصر النشط فقط */}
          {language === lang && (
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl -z-10 animate-in zoom-in"></div>
          )}
          
          {lang}
        </button>
      ))}
    </div>
  );
};