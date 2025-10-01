'use client';

import { UserRole } from '@/types';
import { Badge } from '@/components/ui/badge';

interface RoleBadgeProps {
  role: UserRole;
}

const roleConfig = {
  [UserRole.OWNER]: {
    label: 'Владелец',
    variant: 'destructive' as const,
  },
  [UserRole.ADMIN]: {
    label: 'Администратор',
    variant: 'secondary' as const,
  },
  [UserRole.SALES]: {
    label: 'Менеджер',
    variant: 'outline' as const,
  },
  [UserRole.CONSUMER]: {
    label: 'Потребитель',
    variant: 'outline' as const,
  },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role];
  
  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}
