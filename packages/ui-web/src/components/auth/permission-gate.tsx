'use client';

import { Permission } from '@mono/auth';
import React from 'react';

import { useAuth } from './auth-provider';

interface PermissionGateProps {
  children: React.ReactNode;
  /** The permission required to render the children */
  permission?: Permission;
  /** Explicitly require the user to be authenticated, even if no specific permission is provided. */
  requireAuth?: boolean;
  /** Optional fallback to render if the user does not have permission */
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children if the current user has the required permission or role.
 *
 * @example
 * <PermissionGate permission={Permission.USERS_WRITE} fallback={<p>Access Denied</p>}>
 *   <UserManagementForm />
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  permission,
  requireAuth,
  fallback = null,
}: PermissionGateProps) {
  const { user, checkPermission } = useAuth();

  let hasAccess = true;

  // If a permission is required, they must have it (which implies they must be logged in too)
  if (permission && !checkPermission(permission)) {
    hasAccess = false;
  }

  // If no specific permission is required, but auth is explicitly required
  if (!permission && requireAuth && !user) {
    hasAccess = false;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
