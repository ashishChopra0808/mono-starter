'use client';

import { AuthUser, getPermissions, Role, ROLES } from '@mono/auth';
import { type ApiError } from '@mono/api-client';
import { useCurrentUserProfile } from '@mono/api-client/react';
import { AuthProvider, PermissionGate, useAuth } from '@mono/ui-web';
import { createBrowserLogger } from '@mono/logger';
import Link from 'next/link';

import { useTheme } from '../../theme-provider';
import { useTranslation } from '../../i18n';
import { apiClient } from '../../lib/api-client';
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

const logger = createBrowserLogger({ prefix: 'web:profile' });

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  return (
    <AuthProvider user={user}>
      <ProfileContent setUser={setUser} />
    </AuthProvider>
  );
}

function ProfileContent({ setUser }: { setUser: (user: AuthUser | null) => void }) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale, dir, supportedLocales } = useTranslation();

  React.useEffect(() => {
    logger.info({ userId: user?.id ?? 'anonymous' }, 'Profile page viewed');
  }, [user?.id]);

  // Compute permissions from user's role (mirrors backend logic)
  const permissions = user ? getPermissions(user.role) : [];

  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <Toaster position="top-right" />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-background-secondary">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('web.profile.heading')}
            </h1>
            <p className="text-sm text-foreground-muted">
              {t('web.profile.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← {t('actions.goBack')}
              </Button>
            </Link>

            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
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
                <Button variant="outline" size="sm">
                  {t('common.theme')}: {theme}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('common.chooseTheme')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  ☀️ Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  🌙 Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('midnight')}>
                  🌌 Midnight
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mock Auth Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={user ? 'default' : 'outline'} size="sm">
                  {user ? `${user.name}` : 'Sign In'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mock Authentication</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user ? (
                  <DropdownMenuItem onClick={() => setUser(null)}>
                    Sign Out
                  </DropdownMenuItem>
                ) : (
                  ROLES.map((role: Role) => (
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
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl p-6">
        <PermissionGate
          requireAuth
          fallback={
            <div className="mx-auto max-w-md space-y-4 rounded-xl border border-dashed border-border p-12 text-center bg-muted/30">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <span className="text-3xl">👤</span>
              </div>
              <h2 className="text-xl font-semibold">{t('profile.signInToView')}</h2>
              <p className="text-sm text-foreground-muted">
                {t('profile.signInPrompt')}
              </p>
              <Button
                variant="default"
                onClick={() => setUser({
                  id: 'mock-user',
                  name: 'Mock User',
                  email: 'user@example.com',
                  role: 'user',
                })}
              >
                Quick Sign In
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                  <span className="text-sm font-medium text-foreground-muted">{t('profile.role')}</span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
                    {user?.role}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                  <span className="text-sm font-medium text-foreground-muted">{t('profile.memberSince')}</span>
                  <span className="text-sm font-medium">
                    {new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* ── Details Panel ────────────────────────────────────────── */}
            <div className="space-y-6 lg:col-span-2">
              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('web.profile.accountInfo')}</CardTitle>
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
                      <span className="text-sm font-medium text-foreground-muted">{t('profile.role')}</span>
                      <span className="text-sm font-medium capitalize">{user?.role}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('web.profile.yourPermissions')}</CardTitle>
                  <CardDescription>
                    {permissions.length} {t('profile.permissions').toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {permissions.length === 0 ? (
                    <p className="text-sm text-foreground-muted">{t('profile.noPermissions')}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {permissions.map((perm) => (
                        <span
                          key={perm}
                          className="inline-flex items-center rounded-md bg-muted px-3 py-1.5 text-xs font-mono font-medium text-foreground-muted"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <LiveProfilePanel />
            </div>
          </div>
        </PermissionGate>
      </main>
    </div>
  );
}

function LiveProfilePanel() {
  const { t } = useTranslation();
  // Opt-in fetch — does not run on mount. Demonstrates the api-client surface
  // alongside the mock-auth flow without breaking the demo.
  const { data, error, loading, refetch } = useCurrentUserProfile(apiClient, {
    enabled: false,
  });

  const hasResult = data !== null || error !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('web.profile.liveFromApi')}</CardTitle>
        <CardDescription>{t('web.profile.liveDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={refetch} disabled={loading} size="sm">
          {loading
            ? t('web.profile.loading')
            : data
              ? t('web.profile.reload')
              : t('web.profile.loadFromApi')}
        </Button>

        {!hasResult && !loading && (
          <p className="text-sm text-foreground-muted">{t('web.profile.apiNotLoaded')}</p>
        )}

        {error && <ApiErrorSummary error={error} />}
        {data && <ApiProfileSummary profile={data} />}
      </CardContent>
    </Card>
  );
}

function ApiErrorSummary({ error }: { error: ApiError }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
      <div className="font-semibold text-destructive">
        {t('web.profile.apiErrorPrefix')}: {error.code} ({error.status || 'n/a'})
      </div>
      <div className="text-foreground-muted">{error.message}</div>
      {error.requestId && (
        <div className="mt-1 text-xs font-mono text-foreground-muted">
          x-request-id: {error.requestId}
        </div>
      )}
    </div>
  );
}

function ApiProfileSummary({
  profile,
}: {
  profile: ReturnType<typeof useCurrentUserProfile>['data'];
}) {
  const { t } = useTranslation();
  if (!profile) return null;
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
      <div className="mb-2 font-semibold text-success">{t('web.profile.apiSuccess')}</div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt className="text-foreground-muted">id</dt>
        <dd className="font-mono">{profile.id}</dd>
        <dt className="text-foreground-muted">email</dt>
        <dd>{profile.email}</dd>
        <dt className="text-foreground-muted">role</dt>
        <dd>{profile.role}</dd>
        <dt className="text-foreground-muted">permissions</dt>
        <dd>{profile.permissions.length}</dd>
        <dt className="text-foreground-muted">createdAt</dt>
        <dd>{profile.createdAt}</dd>
      </dl>
    </div>
  );
}
