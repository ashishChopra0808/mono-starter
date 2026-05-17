'use client';

import { AuthUser, getPermissions, PERMISSIONS, Role, ROLES, ROLE_HIERARCHY, hasRole } from '@mono/auth';
import { AuthProvider, PermissionGate, useAuth } from '@mono/ui-web';
import { createBrowserLogger } from '@mono/logger';
import Link from 'next/link';

import { useTheme } from '../../theme-provider';
import { useTranslation } from '../../i18n';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Toaster,
} from '@mono/ui-web';

import React, { useState } from 'react';

const logger = createBrowserLogger({ prefix: 'admin:profile' });

export default function AdminProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  return (
    <AuthProvider user={user}>
      <AdminProfileContent setUser={setUser} />
    </AuthProvider>
  );
}

function AdminProfileContent({ setUser }: { setUser: (user: AuthUser | null) => void }) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale, dir, supportedLocales } = useTranslation();

  React.useEffect(() => {
    logger.info({ userId: user?.id ?? 'anonymous' }, 'Admin profile page viewed');
  }, [user?.id]);

  // Compute permissions from user's role
  const permissions = user ? getPermissions(user.role) : [];

  // Role hierarchy for display
  const roleHierarchy = ROLES.map((role) => ({
    role,
    level: ROLE_HIERARCHY[role],
    isCurrent: user?.role === role,
    isAccessible: user ? hasRole(user.role, role) : false,
    permissions: getPermissions(role),
  })).sort((a, b) => b.level - a.level);

  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <Toaster position="top-right" />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-background-secondary">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              A
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                {t('admin.profile.heading')}
              </h1>
              <p className="text-xs text-foreground-muted">
                {t('admin.profile.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← {t('actions.goBack')}
              </Button>
            </Link>

            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {t(`locale.${locale}` as Parameters<typeof t>[0])}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('common.chooseLanguage')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {supportedLocales.map((loc) => (
                  <DropdownMenuItem key={loc} onClick={() => setLocale(loc)}>
                    {t(`locale.${loc}` as Parameters<typeof t>[0])}
                    {loc === locale ? ' ✓' : ''}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {t('common.theme')}: {theme}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('common.appearance')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme('light')}>☀️ Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>🌙 Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('midnight')}>🌌 Midnight</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Role Switcher (Mock Auth) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={user ? 'default' : 'outline'}
                  size="sm"
                  className={user?.role === 'admin' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                >
                  Role: {user ? user.role : 'Guest'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mock Authentication</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setUser(null)}>
                  Sign Out (Guest)
                </DropdownMenuItem>
                {ROLES.map((role: Role) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => setUser({
                      id: `mock-${role}`,
                      name: `Mock ${role.charAt(0).toUpperCase() + role.slice(1)}`,
                      email: `${role}@example.com`,
                      role,
                    })}
                  >
                    Login as {role}
                    {user?.role === role ? ' ✓' : ''}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <PermissionGate
          requireAuth
          fallback={
            <div className="mx-auto max-w-md space-y-4 rounded-xl border border-dashed border-border p-12 text-center bg-muted/30">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <span className="text-3xl">🔒</span>
              </div>
              <h2 className="text-xl font-semibold">{t('profile.signInToView')}</h2>
              <p className="text-sm text-foreground-muted">
                {t('profile.signInPrompt')}
              </p>
              <Button
                variant="default"
                onClick={() => setUser({
                  id: 'mock-admin',
                  name: 'Mock Admin',
                  email: 'admin@example.com',
                  role: 'admin',
                })}
              >
                Quick Sign In (Admin)
              </Button>
            </div>
          }
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {/* ── Profile Card ────────────────────────────────────────── */}
            <Card className="lg:col-span-1">
              <CardHeader className="items-center text-center">
                <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                  {user?.name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <CardTitle className="text-xl">{user?.name ?? '—'}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
                <div className="mt-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    user?.role === 'admin'
                      ? 'bg-destructive/10 text-destructive'
                      : user?.role === 'editor'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-primary/10 text-primary'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                  <span className="text-sm font-medium text-foreground-muted">{t('profile.role')}</span>
                  <span className="text-sm font-medium capitalize">{user?.role}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                  <span className="text-sm font-medium text-foreground-muted">{t('profile.permissions')}</span>
                  <span className="text-sm font-medium">{permissions.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                  <span className="text-sm font-medium text-foreground-muted">{t('profile.memberSince')}</span>
                  <span className="text-sm font-medium">
                    {new Date().toLocaleDateString(locale, { year: 'numeric', month: 'short' })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* ── Details Panel ────────────────────────────────────────── */}
            <div className="space-y-6 lg:col-span-2">
              {/* Account Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.profile.accountDetails')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm font-medium text-foreground-muted">{t('form.fullName')}</span>
                      <span className="text-sm font-medium">{user?.name ?? '—'}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm font-medium text-foreground-muted">{t('profile.email')}</span>
                      <span className="text-sm font-medium">{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm font-medium text-foreground-muted">{t('profile.id')}</span>
                      <span className="text-sm font-mono text-foreground-muted">{user?.id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Access Control — Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.profile.accessControl')}</CardTitle>
                  <CardDescription>
                    {t('admin.profile.allPermissions')} ({permissions.length}/{PERMISSIONS.length})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {PERMISSIONS.map((perm) => {
                      const hasIt = permissions.includes(perm);
                      return (
                        <div
                          key={perm}
                          className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-mono ${
                            hasIt
                              ? 'bg-success/10 text-success'
                              : 'bg-muted text-foreground-muted opacity-50'
                          }`}
                        >
                          <span>{hasIt ? '✓' : '✗'}</span>
                          <span>{perm}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* System Info — Role Hierarchy */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.profile.systemInfo')}</CardTitle>
                  <CardDescription>{t('admin.profile.roleHierarchy')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {roleHierarchy.map(({ role, level, isCurrent, isAccessible, permissions: rolePerms }) => (
                      <div
                        key={role}
                        className={`rounded-lg border px-4 py-3 transition-colors ${
                          isCurrent
                            ? 'border-primary bg-primary/5'
                            : isAccessible
                              ? 'border-border bg-muted/30'
                              : 'border-dashed border-border opacity-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold capitalize">{role}</span>
                            {isCurrent && (
                              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground uppercase">
                                {t('profile.currentBadge')}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-foreground-muted">{t('profile.level')} {level}</span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {rolePerms.map((p) => (
                            <span key={p} className="text-[10px] font-mono text-foreground-muted">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </PermissionGate>
      </main>
    </div>
  );
}
