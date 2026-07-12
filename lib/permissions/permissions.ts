
export type UserRole = 
  | 'admin' 
  | 'asset_manager' 
  | 'department_head' 
  | 'employee' 
  | 'auditor' 
  | 'technician';

export type Permission = 
  | 'dashboard:view'
  | 'assets:view'
  | 'assets:manage'
  | 'allocations:view'
  | 'allocations:manage'
  | 'transfers:view'
  | 'transfers:manage'
  | 'bookings:view'
  | 'bookings:manage'
  | 'maintenance:view'
  | 'maintenance:manage'
  | 'maintenance:assign'
  | 'audits:view'
  | 'audits:manage'
  | 'audits:assign'
  | 'reports:view'
  | 'reports:manage'
  | 'notifications:view'
  | 'office_map:view'
  | 'ai_assistant:view'
  | 'organization:view'
  | 'organization:manage'
  | 'users:view'
  | 'users:manage';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'dashboard:view',
    'assets:view',
    'assets:manage',
    'allocations:view',
    'allocations:manage',
    'transfers:view',
    'transfers:manage',
    'bookings:view',
    'bookings:manage',
    'maintenance:view',
    'maintenance:manage',
    'maintenance:assign',
    'audits:view',
    'audits:manage',
    'audits:assign',
    'reports:view',
    'reports:manage',
    'notifications:view',
    'office_map:view',
    'ai_assistant:view',
    'organization:view',
    'organization:manage',
    'users:view',
    'users:manage',
  ],
  asset_manager: [
    'dashboard:view',
    'assets:view',
    'assets:manage',
    'allocations:view',
    'allocations:manage',
    'transfers:view',
    'transfers:manage',
    'bookings:view',
    'bookings:manage',
    'maintenance:view',
    'maintenance:manage',
    'maintenance:assign',
    'audits:view',
    'audits:manage',
    'audits:assign',
    'reports:view',
    'notifications:view',
    'office_map:view',
    'ai_assistant:view',
  ],
  department_head: [
    'dashboard:view',
    'assets:view',
    'allocations:view',
    'transfers:view',
    'bookings:view',
    'bookings:manage',
    'maintenance:view',
    'maintenance:manage',
    'reports:view',
    'notifications:view',
    'office_map:view',
    'ai_assistant:view',
  ],
  employee: [
    'dashboard:view',
    'bookings:view',
    'bookings:manage',
    'notifications:view',
    'office_map:view',
    'ai_assistant:view',
  ],
  auditor: [
    'audits:view',
    'notifications:view',
  ],
  technician: [
    'maintenance:view',
    'notifications:view',
  ],
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(role: UserRole | undefined, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/dashboard': ['dashboard:view'],
  '/assets': ['assets:view'],
  '/allocations': ['allocations:view'],
  '/bookings': ['bookings:view'],
  '/maintenance': ['maintenance:view'],
  '/audits': ['audits:view'],
  '/reports': ['reports:view'],
  '/notifications': ['notifications:view'],
  '/office-map': ['office_map:view'],
  '/ai-assistant': ['ai_assistant:view'],
  '/organization': ['organization:view'],
};

