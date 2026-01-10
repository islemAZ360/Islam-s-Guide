import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../services/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string; // Type-safe translation keys
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children?: React.ReactNode }) => {
  // 1. Initialize Language State
  const [language, setLanguageState] = useState<Language>(() => {
    // A. Check Local Storage first
    const saved = localStorage.getItem('app_lang');
    if (saved && ['ar', 'en', 'ru'].includes(saved)) {
        return saved as Language;
    }
    
    // B. Check Browser Language preference
    if (typeof navigator !== 'undefined') {
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'ar') return 'ar';
        if (browserLang === 'ru') return 'ru';
    }

    // C. Default fallback (Arabic for this specific audience)
    return 'ar'; 
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
    
    // Update HTML attributes for accessibility and CSS
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  };

  // The translation function
  const t = (key: keyof typeof translations['en']) => {
    // Fallback to English if key missing in current lang, then fallback to key string
    return translations[language][key] || translations['en'][key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Effect to sync direction on mount/change
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};