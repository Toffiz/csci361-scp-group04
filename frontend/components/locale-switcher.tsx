'use client';'use client';



import { Button } from '@/components/ui/button';import { Button } from '@/components/ui/button';

import { Globe } from 'lucide-react';import { Globe } from 'lucide-react';

import { useI18n } from '@/lib/i18n-context';import { useState } from 'react';

import { localeNames } from '@/lib/i18n-client';

export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {

export function LocaleSwitcher() {  const [locale, setLocale] = useState(currentLocale);

  const { locale, setLocale } = useI18n();

  const toggleLocale = () => {

  const toggleLocale = () => {    const newLocale = locale === 'ru' ? 'kz' : 'ru';

    const newLocale = locale === 'ru' ? 'en' : 'ru';    setLocale(newLocale);

    setLocale(newLocale);    localStorage.setItem('locale', newLocale);

  };    // In a real app, this would trigger a re-render with new translations

  };

  return (

    <Button variant="ghost" size="sm" onClick={toggleLocale} className="gap-2">  return (

      <Globe className="h-4 w-4" />    <Button

      {localeNames[locale]}      variant="ghost"

    </Button>      size="sm"

  );      onClick={toggleLocale}

}      className="gap-2"

    >
      <Globe className="h-4 w-4" />
      {locale === 'ru' ? 'ҚАЗ' : 'РУС'}
    </Button>
  );
}
