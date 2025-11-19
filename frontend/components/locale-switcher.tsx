'use client';

import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();

  const toggleLocale = () => {
    const newLocale = locale === 'ru' ? 'en' : 'ru';
    setLocale(newLocale);
    window.location.reload();
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLocale} className="gap-2">
      <Globe className="h-4 w-4" />
      {locale === 'ru' ? 'Русский' : 'English'}
    </Button>
  );
}