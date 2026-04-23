'use client';

import { AuthUser, hasPermission, hasRole, Permission, Role } from '@mono/auth';
import React, { createContext, useContext, useMemo } from 'react';

interface AuthContextValue {
  user: AuthUser | null;
  /** Check if the current user has the specified permission */
  checkPermission: (permission: Permission) => boolean;
  /** Check if the current user has the specified minimum role */
  checkRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  user: AuthUser | null;
}

export function AuthProvider({ children, user }: AuthProviderProps) {
  const value = useMemo(() => {
    return {
      user,
      checkPermission: (permission: Permission) => {
        if (!user) return false;
        return hasPermission(user.role, permission);
      },
      checkRole: (role: Role) => {
        if (!user) return false;
        return hasRole(user.role, role);
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
