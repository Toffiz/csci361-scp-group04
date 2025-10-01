'use client';

import { UserRole } from '@/types';
import { Badge } from '@/components/ui/badge';

interface RoleBadgeProps {
  role: UserRole;
}

const roleConfig = {
  [UserRole.OWNER]: {
    label: 'Owner',
    variant: 'destructive' as const,
  },
  [UserRole.ADMIN]: {
    label: 'Administrator',
    variant: 'secondary' as const,
  },
  [UserRole.SALES]: {
    label: 'Sales Manager',
    variant: 'outline' as const,
  },
  [UserRole.CONSUMER]: {
    label: 'Consumer',
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
