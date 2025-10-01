'use client';

import { Button } from '@/components/ui/button';
import { setLocale } from '@/lib/session';
import { Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const toggleLocale = async () => {
    setIsLoading(true);
    const newLocale = currentLocale === 'ru' ? 'kz' : 'ru';
    await setLocale(newLocale);
    router.refresh();
    setIsLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      disabled={isLoading}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      {currentLocale === 'ru' ? 'ҚАЗ' : 'РУС'}
    </Button>
  );
}
