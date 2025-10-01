'use client';

import { User } from '@/types';
import { RoleBadge } from './role-badge';
import { LocaleSwitcher } from './locale-switcher';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopNavProps {
  user: User;
  locale: string;
}

export function TopNav({ user, locale }: TopNavProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('session');
    router.push('/auth');
  };

  return (
    <div className="border-b bg-card sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">SCP Platform</h1>
          <RoleBadge role={user.role} />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-right">
            <div className="font-medium">{user.name}</div>
            <div className="text-muted-foreground text-xs">
              {user.companyName}
            </div>
          </div>
          
          <LocaleSwitcher currentLocale={locale} />
          
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
