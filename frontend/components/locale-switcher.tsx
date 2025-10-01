'use client';

import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

export function LocaleSwitcher() {
  const [locale, setLocaleState] = useState('en');

  useEffect(() => {
    const stored = localStorage.getItem('locale');
    if (stored) {
      setLocaleState(stored);
    }
  }, []);

  const toggleLocale = () => {
    const newLocale = locale === 'ru' ? 'en' : 'ru';
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    window.location.reload();
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLocale} className="gap-2">
      <Globe className="h-4 w-4" />
      {locale === 'ru' ? '???????' : 'English'}
    </Button>
  );
}