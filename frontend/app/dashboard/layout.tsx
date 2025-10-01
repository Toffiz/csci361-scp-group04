'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/top-nav';
import { SideNav } from '@/components/side-nav';
import { User } from '@/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [locale, setLocale] = useState('ru');

  useEffect(() => {
    // Get user from localStorage (client-side session)
    const sessionData = localStorage.getItem('session');
    if (!sessionData) {
      router.push('/auth');
      return;
    }
    
    try {
      const userData = JSON.parse(sessionData);
      setUser(userData);
    } catch {
      router.push('/auth');
    }

    // Get locale
    const savedLocale = localStorage.getItem('locale') || 'ru';
    setLocale(savedLocale);
  }, [router]);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav user={user} locale={locale} />
      <div className="flex flex-1">
        <SideNav role={user.role} />
        <main className="flex-1 p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
