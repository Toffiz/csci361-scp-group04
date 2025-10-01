import { UserRole } from '@/types';

export interface RolePermissions {
  canApproveLinks: boolean;
  canManageCatalog: boolean;
  canManageOrders: boolean;
  canChat: boolean;
  canHandleComplaints: boolean;
  canEscalate: boolean;
  canManageIncidents: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
}

export function getRolePermissions(role: UserRole): RolePermissions {
  const permissions: Record<UserRole, RolePermissions> = {
    [UserRole.OWNER]: {
      canApproveLinks: true,
      canManageCatalog: true,
      canManageOrders: true,
      canChat: true,
      canHandleComplaints: true,
      canEscalate: true,
      canManageIncidents: true,
      canManageUsers: true,
      canViewAnalytics: true,
    },
    [UserRole.ADMIN]: {
      canApproveLinks: true,
      canManageCatalog: true,
      canManageOrders: true,
      canChat: true,
      canHandleComplaints: true,
      canEscalate: true,
      canManageIncidents: true,
      canManageUsers: true,
      canViewAnalytics: true,
    },
    [UserRole.SALES]: {
      canApproveLinks: false,
      canManageCatalog: false,
      canManageOrders: true,
      canChat: true,
      canHandleComplaints: true,
      canEscalate: true,
      canManageIncidents: false,
      canManageUsers: false,
      canViewAnalytics: false,
    },
    [UserRole.CONSUMER]: {
      canApproveLinks: false,
      canManageCatalog: false,
      canManageOrders: true,
      canChat: true,
      canHandleComplaints: false,
      canEscalate: false,
      canManageIncidents: false,
      canManageUsers: false,
      canViewAnalytics: false,
    },
  };

  return permissions[role];
}

export function hasPermission(
  role: UserRole,
  permission: keyof RolePermissions
): boolean {
  const permissions = getRolePermissions(role);
  return permissions[permission];
}

export function isSupplierRole(role: UserRole): boolean {
  return [UserRole.OWNER, UserRole.ADMIN, UserRole.SALES].includes(role);
}

export function isConsumerRole(role: UserRole): boolean {
  return role === UserRole.CONSUMER;
}

export function canApproveLinks(role: UserRole): boolean {
  return [UserRole.OWNER, UserRole.ADMIN].includes(role);
}

export function canEscalateComplaints(role: UserRole): boolean {
  return [UserRole.OWNER, UserRole.ADMIN, UserRole.SALES].includes(role);
}

export function canResolveEscalatedComplaints(role: UserRole): boolean {
  return [UserRole.OWNER, UserRole.ADMIN].includes(role);
}
