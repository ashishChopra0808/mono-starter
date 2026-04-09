'use client';

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
  Toaster,
  toast,
} from '@mono/ui-web';

export default function AdminDashboard() {
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale, dir, supportedLocales } = useTranslation();

  const stats = [
    { title: t('admin.stats.totalBookings'), value: t('admin.stats.totalBookingsValue'), desc: t('admin.stats.totalBookingsChange') },
    { title: t('admin.stats.revenue'), value: t('admin.stats.revenueValue'), desc: t('admin.stats.revenueChange') },
    { title: t('admin.stats.activeUsers'), value: t('admin.stats.activeUsersValue'), desc: t('admin.stats.activeUsersChange') },
    { title: t('admin.stats.pendingReviews'), value: t('admin.stats.pendingReviewsValue'), desc: t('admin.stats.pendingReviewsChange') },
  ];

  const bookings = [
    { id: 'BK-1001', customer: 'Sara Ahmed', route: 'Abu Dhabi → Dubai', amount: 'AED 2,450', status: 'Confirmed' as const },
    { id: 'BK-1002', customer: 'John Smith', route: 'Dubai → Musandam', amount: 'AED 3,200', status: 'Pending' as const },
    { id: 'BK-1003', customer: 'Fatima Al Ali', route: 'Sharjah → Fujairah', amount: 'AED 1,800', status: 'Confirmed' as const },
    { id: 'BK-1004', customer: 'Raj Patel', route: 'Dubai → Sir Bani Yas', amount: 'AED 4,100', status: 'Cancelled' as const },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <Toaster position="top-right" />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-background-secondary">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              A
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                {t('admin.title')}
              </h1>
              <p className="text-xs text-foreground-muted">
                {t('admin.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {t('admin.adminUser')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('nav.myAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{t('nav.profile')}</DropdownMenuItem>
                <DropdownMenuItem>{t('nav.settings')}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{t('nav.logout')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl space-y-8 p-6">

        {/* ── Stats Row ───────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">{t('admin.overview')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="pb-2">
                  <CardDescription>{stat.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-foreground-muted">{stat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Recent Bookings Table ───────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('admin.recentBookings')}</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">{t('admin.createBooking')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('admin.newBooking.title')}</DialogTitle>
                  <DialogDescription>
                    {t('admin.newBooking.description')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <FormItem name="customer-name">
                    <FormLabel>{t('admin.newBooking.customerName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('admin.newBooking.customerPlaceholder')} />
                    </FormControl>
                  </FormItem>
                  <FormItem name="destination">
                    <FormLabel>{t('admin.newBooking.destination')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('admin.newBooking.destinationPlaceholder')} />
                    </FormControl>
                  </FormItem>
                  <FormItem name="amount">
                    <FormLabel>{t('admin.newBooking.amountLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t('admin.newBooking.amountPlaceholder')} />
                    </FormControl>
                    <FormDescription>{t('admin.newBooking.amountHint')}</FormDescription>
                  </FormItem>
                </div>
                <DialogFooter>
                  <Button variant="outline">{t('actions.cancel')}</Button>
                  <Button onClick={() => toast.success(t('admin.newBooking.created'))}>
                    {t('admin.createBooking')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">{t('admin.table.bookingId')}</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">{t('admin.table.customer')}</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">{t('admin.table.route')}</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">{t('admin.table.amount')}</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">{t('admin.table.statusCol')}</th>
                  <th className="px-4 py-3 text-right font-medium text-foreground-muted">{t('admin.table.actionsCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{booking.id}</td>
                    <td className="px-4 py-3">{booking.customer}</td>
                    <td className="px-4 py-3 text-foreground-muted">{booking.route}</td>
                    <td className="px-4 py-3 font-medium">{booking.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        booking.status === 'Confirmed'
                          ? 'bg-success/10 text-success'
                          : booking.status === 'Pending'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {t(`status.${booking.status.toLowerCase()}` as Parameters<typeof t>[0])}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">⋯</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast(t('admin.toasts.viewing', { id: booking.id }))}>
                            {t('actions.viewDetails')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>{t('actions.edit')}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => toast.error(t('admin.toasts.cancelled', { id: booking.id }))}
                          >
                            {t('admin.table.cancelBooking')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Quick Actions ───────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">{t('admin.quickActions')}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('admin.quickAction.searchCustomer')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="admin-search">{t('admin.quickAction.emailOrPhone')}</Label>
                  <Input id="admin-search" placeholder={t('admin.quickAction.searchPlaceholder')} />
                </div>
              </CardContent>
              <CardFooter>
                <Button size="sm" className="w-full">{t('actions.search')}</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('admin.quickAction.sendNotification')}</CardTitle>
                <CardDescription>{t('admin.quickAction.broadcastToAll')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground-muted">
                  {t('admin.quickAction.notificationBody')}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => toast.warning(t('admin.quickAction.comingSoon'))}
                >
                  {t('actions.compose')}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('admin.quickAction.exportData')}</CardTitle>
                <CardDescription>{t('admin.quickAction.downloadReports')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground-muted">
                  {t('admin.quickAction.exportBody')}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => toast.success(t('admin.quickAction.exportStarted'))}
                >
                  {t('admin.quickAction.exportCsv')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
