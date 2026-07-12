
'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { hasPermission, type Permission } from '@/lib/permissions/permissions';
import { useRouter } from 'next/navigation';

type PermissionGuardProps = {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function PermissionGuard({
  permission,
  children,
  fallback = (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#0F172A]">Access Denied</h2>
        <p className="text-[#64748B] mt-2">You don&apos;t have permission to view this page.</p>
      </div>
    </div>
  ),
}: PermissionGuardProps) {
  const { profile, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        Loading...
      </div>
    );
  }

  if (!hasPermission(profile?.role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

