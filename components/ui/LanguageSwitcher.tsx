import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex bg-slate-800/40 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-lg">
      {(['ar', 'en', 'ru'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-300 ${
            language === lang 
              ? 'bg-indigo-600/90 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
};