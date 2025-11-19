'use client';

import { User } from '@/types';
import { RoleBadge } from './role-badge';
import { LocaleSwitcher } from './locale-switcher';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';

interface TopNavProps {
  user: User;
}

export function TopNav({ user }: TopNavProps) {
  const router = useRouter();
  const { t } = useI18n();

  const handleLogout = () => {
    localStorage.removeItem('session');
    router.push('/auth');
  };

  return (
    <div className="border-b bg-card sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">{t('app.title')}</h1>
          <RoleBadge role={user.role} />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-right">
            <div className="font-medium">{user.name}</div>
            <div className="text-muted-foreground text-xs">
              {user.companyName}
            </div>
          </div>
          
          <LocaleSwitcher />
          
          <Button variant="ghost" size="icon" onClick={handleLogout} title={t('common.logout')}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
