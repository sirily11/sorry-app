'use client';

import { useEffect, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

interface I18nProviderProps {
  children: ReactNode;
  locale?: string;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  useEffect(() => {
    // Set initial language
    if (locale && locale !== i18n.language) {
      i18n.changeLanguage(locale);
    }
    
    // Load language from localStorage if available
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && savedLocale !== i18n.language) {
      i18n.changeLanguage(savedLocale);
    }
    
    // Save language changes to localStorage
    const handleLanguageChange = (lng: string) => {
      localStorage.setItem('locale', lng);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
