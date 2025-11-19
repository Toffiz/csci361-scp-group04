'use client';

import { UserRole } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n-context';

interface RoleBadgeProps {
  role: UserRole;
}

const roleConfig = {
  [UserRole.OWNER]: {
    translationKey: 'roles.owner',
    variant: 'destructive' as const,
  },
  [UserRole.ADMIN]: {
    translationKey: 'roles.admin',
    variant: 'secondary' as const,
  },
  [UserRole.SALES]: {
    translationKey: 'roles.sales',
    variant: 'outline' as const,
  },
  [UserRole.CONSUMER]: {
    translationKey: 'roles.consumer',
    variant: 'outline' as const,
  },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const { t } = useI18n();
  const config = roleConfig[role];
  
  return (
    <Badge variant={config.variant} className="text-xs">
      {t(config.translationKey)}
    </Badge>
  );
}
