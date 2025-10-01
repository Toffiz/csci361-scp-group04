'use client';'use client';



import { Button } from '@/components/ui/button';import { Button } from '@/components/ui/button';

import { Globe } from 'lucide-react';import { Globe } from 'lucide-react';

import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';



export function LocaleSwitcher() {export function LocaleSwitcher() {

  const [locale, setLocaleState] = useState('ru');  const [locale, setLocaleState] = useState('ru');



  useEffect(() => {  useEffect(() => {

    const stored = localStorage.getItem('locale');    const stored = localStorage.getItem('locale');

    if (stored) {    if (stored) {

      setLocaleState(stored);      setLocaleState(stored);

    }    }

  }, []);  }, []);



  const toggleLocale = () => {  const toggleLocale = () => {

    const newLocale = locale === 'ru' ? 'en' : 'ru';    const newLocale = locale === 'ru' ? 'en' : 'ru';

    setLocaleState(newLocale);    setLocaleState(newLocale);

    localStorage.setItem('locale', newLocale);    localStorage.setItem('locale', newLocale);

    window.location.reload();    window.location.reload();

  };  };



  return (  return (

    <Button variant="ghost" size="sm" onClick={toggleLocale} className="gap-2">    <Button variant="ghost" size="sm" onClick={toggleLocale} className="gap-2">

      <Globe className="h-4 w-4" />      <Globe className="h-4 w-4" />

      {locale === 'ru' ? 'Русский' : 'English'}      {locale === 'ru' ? 'Русский' : 'English'}

    </Button>    </Button>

  );  );

}}

