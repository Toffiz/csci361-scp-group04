'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Link2,
  Package,
  ShoppingCart,
  MessageSquare,
  AlertCircle,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { UserRole } from '@/types';
import { getRolePermissions } from '@/lib/roles';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.SALES, UserRole.CONSUMER],
  },
  {
    href: '/dashboard/links',
    label: 'Links',
    icon: Link2,
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.CONSUMER],
  },
  {
    href: '/dashboard/catalog',
    label: 'Catalog',
    icon: Package,
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.CONSUMER],
  },
  {
    href: '/dashboard/orders',
    label: 'Orders',
    icon: ShoppingCart,
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.SALES, UserRole.CONSUMER],
  },
  {
    href: '/dashboard/chat',
    label: 'Chat',
    icon: MessageSquare,
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.SALES, UserRole.CONSUMER],
  },
  {
    href: '/dashboard/complaints',
    label: 'Complaints',
    icon: AlertCircle,
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.SALES],
  },
  {
    href: '/dashboard/incidents',
    label: 'Incidents',
    icon: AlertTriangle,
    roles: [UserRole.OWNER, UserRole.ADMIN],
  },
  {
    href: '/dashboard/admin',
    label: 'Admin',
    icon: Settings,
    roles: [UserRole.OWNER, UserRole.ADMIN],
  },
];

interface SideNavProps {
  role: UserRole;
}

export function SideNav({ role }: SideNavProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="w-64 border-r bg-card h-screen sticky top-0 p-4">
      <div className="space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  isActive && 'bg-secondary'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
