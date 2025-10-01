'use client';

import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useState } from 'react';

export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const [locale, setLocale] = useState(currentLocale);

  const toggleLocale = () => {
    const newLocale = locale === 'ru' ? 'kz' : 'ru';
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    // In a real app, this would trigger a re-render with new translations
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      {locale === 'ru' ? 'ҚАЗ' : 'РУС'}
    </Button>
  );
}
