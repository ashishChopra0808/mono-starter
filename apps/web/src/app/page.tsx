'use client';

import { AuthUser, Role, ROLES } from '@mono/auth';
import { AuthProvider, PermissionGate, useAuth } from '@mono/ui-web';
import { createBrowserLogger } from '@mono/logger';


import { useTheme } from '../theme-provider';
import { useTranslation } from '../i18n';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Toaster,
  toast,
} from '@mono/ui-web';

import React, { useState } from 'react';

const logger = createBrowserLogger({ prefix: 'web' });

export default function Index() {
  const [user, setUser] = useState<AuthUser | null>(null);

  return (
    <AuthProvider user={user}>
      <IndexContent setUser={setUser} />
    </AuthProvider>
  );
}

function IndexContent({ setUser }: { setUser: (user: AuthUser | null) => void }) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale, dir, supportedLocales } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <Toaster position="top-right" />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-background-secondary">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('web.title')}
            </h1>
            <p className="text-sm text-foreground-muted">
              {t('web.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
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

            {/* Login / Auth Switcher (Mock Auth) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={user ? 'default' : 'outline'} size="sm">
                  {user ? `Logged in: ${user.name}` : 'Sign In'}
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
                      onClick={() => setUser({ id: 'mock-1', name: `Mock ${role}`, email: 'test@test.com', role })}
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
      <main className="mx-auto max-w-5xl space-y-10 p-6">

        {/* ── Button Variants ─────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t('web.sections.button')}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>{t('web.buttons.default')}</Button>
            <Button variant="secondary">{t('web.buttons.secondary')}</Button>
            <Button variant="destructive">{t('web.buttons.destructive')}</Button>
            <Button variant="outline">{t('web.buttons.outline')}</Button>
            <Button variant="ghost">{t('web.buttons.ghost')}</Button>
            <Button variant="link">{t('web.buttons.link')}</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">{t('web.buttons.small')}</Button>
            <Button size="default">{t('web.buttons.default')}</Button>
            <Button size="lg">{t('web.buttons.large')}</Button>
            <Button disabled>{t('form.disabled')}</Button>
          </div>
        </section>

        {/* ── Card ─────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t('web.sections.card')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{t('web.cards.bookingSummary')}</CardTitle>
                <CardDescription>{t('web.cards.bookingDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{t('web.cards.bookingBody')}</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">{t('actions.viewDetails')}</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('web.cards.paymentStatus')}</CardTitle>
                <CardDescription>{t('web.cards.paymentUpdated')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{t('web.cards.paymentAmount')}</p>
                <p className="text-sm text-foreground-muted">{t('web.cards.paidInFull')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('web.cards.support')}</CardTitle>
                <CardDescription>{t('web.cards.needHelp')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground-muted">
                  {t('web.cards.supportBody')}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">{t('actions.contactUs')}</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* ── Input & Label ────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t('web.sections.inputLabel')}</h2>
          <div className="grid max-w-md gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('form.email')}</Label>
              <Input id="email" type="email" placeholder={t('web.inputs.emailPlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">{t('actions.search')}</Label>
              <Input id="search" placeholder={t('web.inputs.searchPlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled-input">{t('form.disabled')}</Label>
              <Input id="disabled-input" placeholder={t('web.inputs.cannotEdit')} disabled />
            </div>
          </div>
        </section>

        {/* ── Form Wrappers (Authenticated Only) ───────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Members Area (Authenticated Only)</h2>
          <PermissionGate 
            requireAuth
            fallback={
              <div className="max-w-md space-y-4 rounded-lg border border-dashed border-border p-8 text-center bg-muted/30">
                <h3 className="font-medium text-lg">Sign in to book a tour</h3>
                <p className="text-sm text-foreground-muted mb-4">
                  This section is protected by PermissionGate. You must be authenticated to view the booking form.
                </p>
                <Button variant="outline" onClick={() => setUser({ id: 'mock-1', name: `Mock user`, email: 'test@test.com', role: 'user' })}>
                  Quick Sign In (User)
                </Button>
              </div>
            }
          >
            <div className="max-w-md space-y-4 rounded-lg border border-border p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-success text-success-foreground text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg">
                Authenticated
              </div>
              <FormItem name="full-name">
                <FormLabel>{t('form.fullName')}</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" />
                </FormControl>
                <FormDescription>
                  {t('web.formDemo.fullNameHint')}
                </FormDescription>
              </FormItem>

              <FormItem name="phone" error={t('web.formDemo.phoneError')}>
                <FormLabel>{t('form.phone')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('web.formDemo.phonePlaceholder')} />
                </FormControl>
                <FormMessage />
              </FormItem>

              <Button type="submit" className="w-full">
                {t('web.formDemo.submitBooking')}
              </Button>
            </div>
          </PermissionGate>
        </section>

        {/* ── Dialog ───────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t('web.sections.dialog')}</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>{t('web.dialog.confirmBooking')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('web.dialog.confirmBooking')}</DialogTitle>
                <DialogDescription>
                  {t('web.dialog.confirmDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-4">
                <Label htmlFor="promo">{t('web.dialog.promoCode')}</Label>
                <Input id="promo" placeholder={t('web.dialog.promoPlaceholder')} />
              </div>
              <DialogFooter>
                <Button variant="outline">{t('actions.cancel')}</Button>
                <Button>{t('actions.confirm')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>

        {/* ── Toast ────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t('web.sections.toast')}</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                logger.info({ action: 'toast' }, 'Default toast triggered');
                toast(t('web.toasts.draftSaved'));
              }}
            >
              {t('web.toasts.defaultToast')}
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success(t('web.toasts.bookingConfirmed'))}
            >
              {t('web.toasts.successToast')}
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.error(t('web.toasts.paymentFailed'))}
            >
              {t('web.toasts.errorToast')}
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.warning(t('web.toasts.sessionExpiring'))}
            >
              {t('web.toasts.warningToast')}
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
