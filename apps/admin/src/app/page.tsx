'use client';

import { useTheme } from '../theme-provider';
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" />

      {/* ── Sidebar-style Header ────────────────────────────────────────── */}
      <header className="border-b border-border bg-background-secondary">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              A
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Admin Panel
              </h1>
              <p className="text-xs text-foreground-muted">
                @mono/ui-web component demo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Theme: {theme}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
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
                  Admin User
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl space-y-8 p-6">

        {/* ── Stats Row ───────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Overview</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Total Bookings', value: '1,284', desc: '+12% from last month' },
              { title: 'Revenue', value: 'AED 384,200', desc: '+8.2% from last month' },
              { title: 'Active Users', value: '3,462', desc: '+201 new this week' },
              { title: 'Pending Reviews', value: '23', desc: '5 flagged for attention' },
            ].map((stat) => (
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
            <h2 className="text-xl font-semibold">Recent Bookings</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">+ Create Booking</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Booking</DialogTitle>
                  <DialogDescription>
                    Create a manual booking entry for a customer.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <FormItem name="customer-name">
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Ahmed Al Maktoum" />
                    </FormControl>
                  </FormItem>
                  <FormItem name="destination">
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Dubai Marina" />
                    </FormControl>
                  </FormItem>
                  <FormItem name="amount">
                    <FormLabel>Amount (AED)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" />
                    </FormControl>
                    <FormDescription>Total booking amount including taxes.</FormDescription>
                  </FormItem>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={() => toast.success('Booking created successfully!')}>
                    Create Booking
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">Booking ID</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">Route</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground-muted">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-foreground-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { id: 'BK-1001', customer: 'Sara Ahmed', route: 'Abu Dhabi → Dubai', amount: 'AED 2,450', status: 'Confirmed' },
                  { id: 'BK-1002', customer: 'John Smith', route: 'Dubai → Musandam', amount: 'AED 3,200', status: 'Pending' },
                  { id: 'BK-1003', customer: 'Fatima Al Ali', route: 'Sharjah → Fujairah', amount: 'AED 1,800', status: 'Confirmed' },
                  { id: 'BK-1004', customer: 'Raj Patel', route: 'Dubai → Sir Bani Yas', amount: 'AED 4,100', status: 'Cancelled' },
                ].map((booking) => (
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
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">⋯</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast(`Viewing ${booking.id}`)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => toast.error(`${booking.id} cancelled`)}
                          >
                            Cancel Booking
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
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Search Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="admin-search">Email or Phone</Label>
                  <Input id="admin-search" placeholder="Search..." />
                </div>
              </CardContent>
              <CardFooter>
                <Button size="sm" className="w-full">Search</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Send Notification</CardTitle>
                <CardDescription>Broadcast to all users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground-muted">
                  Send a push notification or email blast to all active users.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => toast.warning('Feature coming soon')}
                >
                  Compose
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Export Data</CardTitle>
                <CardDescription>Download reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground-muted">
                  Export bookings, revenue, and user data as CSV.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => toast.success('Export started — check your email.')}
                >
                  Export CSV
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
