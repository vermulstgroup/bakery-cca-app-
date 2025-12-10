
"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';
import en from '@/locales/en.json';
import kj from '@/locales/kj.json';
import ach from '@/locales/ach.json';
import tes from '@/locales/tes.json';
import lg from '@/locales/lg.json';

const translations: { [key: string]: any } = {
  en,
  kj,
  ach,
  tes,
  lg
};

type TranslationContextType = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, values?: { [key: string]: string | number }) => string;
}

export const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('selectedLanguage');
    if (storedLanguage && translations[storedLanguage]) {
      setLanguageState(storedLanguage);
    }
  }, []);

  const setLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('selectedLanguage', lang);
    }
  };

  const t = useCallback((key: string, values?: { [key: string]: string | number }): string => {
    let translation = translations[language][key] || translations['en'][key] || key;
    
    if (values) {
      Object.keys(values).forEach(valueKey => {
        translation = translation.replace(`{${valueKey}}`, String(values[valueKey]));
      });
    }

    return translation;
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};
