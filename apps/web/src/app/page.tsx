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
  FormMessage,
  Toaster,
  toast,
} from '@mono/ui-web';

export default function Index() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-background-secondary">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              @mono/ui-web
            </h1>
            <p className="text-sm text-foreground-muted">
              Shared component library demo — web app
            </p>
          </div>

          {/* Theme Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Theme: {theme}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
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
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl space-y-10 p-6">

        {/* ── Button Variants ─────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Button</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        {/* ── Card ─────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Card</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>Your upcoming cruise details</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Abu Dhabi → Dubai Marina — 3 nights, departing Jan 15.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm">View Details</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>Last updated today</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">AED 2,450</p>
                <p className="text-sm text-foreground-muted">Paid in full</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support</CardTitle>
                <CardDescription>Need help?</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground-muted">
                  Our team is available 24/7 via chat or email.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Contact Us</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* ── Input & Label ────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Input & Label</h2>
          <div className="grid max-w-md gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input id="search" placeholder="Search destinations..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled-input">Disabled</Label>
              <Input id="disabled-input" placeholder="Cannot edit" disabled />
            </div>
          </div>
        </section>

        {/* ── Form Wrappers ────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Form</h2>
          <div className="max-w-md space-y-4 rounded-lg border border-border p-6">
            <FormItem name="full-name">
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" />
              </FormControl>
              <FormDescription>
                As it appears on your passport.
              </FormDescription>
            </FormItem>

            <FormItem name="phone" error="Phone number is required">
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="+971 50 123 4567" />
              </FormControl>
              <FormMessage />
            </FormItem>

            <Button type="submit" className="w-full">
              Submit Booking
            </Button>
          </div>
        </section>

        {/* ── Dialog ───────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Dialog</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Booking</DialogTitle>
                <DialogDescription>
                  You&apos;re about to book a 3-night cruise from Abu Dhabi to Dubai
                  Marina. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-4">
                <Label htmlFor="promo">Promo Code</Label>
                <Input id="promo" placeholder="Enter promo code" />
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>

        {/* ── Toast ────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Toast</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => toast('Booking saved as draft.')}
            >
              Default Toast
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success('Booking confirmed!')}
            >
              Success Toast
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.error('Payment failed. Try again.')}
            >
              Error Toast
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.warning('Session expiring in 5 minutes.')}
            >
              Warning Toast
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
