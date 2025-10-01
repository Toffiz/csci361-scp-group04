'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Locale } from '@/lib/i18n-client';
import { defaultLocale } from '@/lib/i18n-client';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load locale from localStorage
    const stored = localStorage.getItem('locale') as Locale;
    if (stored && (stored === 'ru' || stored === 'en')) {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    // Load translations
    import(`@/public/locales/${locale}/common.json`).then((mod) => {
      setMessages(mod.default);
    });
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
