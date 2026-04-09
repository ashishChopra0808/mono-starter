'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  toast,
  Toaster,
} from '@mono/ui-web';
import { useId,useRef, useState } from 'react';

/*
 * Accessibility Demo Page
 *
 * This page demonstrates accessible patterns using the shared @mono/ui-web
 * components. Each section includes inline comments explaining WHY the
 * pattern matters for assistive technology users.
 */

export default function A11yDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" />

      {/*
       * SKIP LINK — allows keyboard users to jump past navigation directly
       * to the main content. Visually hidden until focused.
       */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      {/*
       * HEADER with <nav> landmark — screen readers announce landmarks so
       * users can jump between them. The aria-label distinguishes this nav
       * from other <nav> elements on the page.
       */}
      <header className="border-b border-border bg-background-secondary">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Accessibility Demo
            </h1>
            <p className="text-sm text-foreground-muted">
              Patterns for building inclusive interfaces
            </p>
          </div>
          <nav aria-label="Page sections">
            <ul className="flex gap-3">
              <li><a href="#forms" className="text-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded">Forms</a></li>
              <li><a href="#dialog" className="text-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded">Dialog</a></li>
              <li><a href="#live-region" className="text-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded">Live Region</a></li>
              <li><a href="#keyboard" className="text-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded">Keyboard</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/*
       * MAIN landmark — the id matches the skip link's href so keyboard
       * users land here when they activate the skip link.
       */}
      <main id="main-content" className="mx-auto max-w-4xl space-y-12 p-6">

        <AccessibleFormSection />
        <DialogSection />
        <LiveRegionSection />
        <KeyboardNavigationSection />

      </main>
    </div>
  );
}

/* ── Accessible Form ──────────────────────────────────────────────────────── */

function AccessibleFormSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const statusId = useId();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = 'Full name is required.';
    if (!email.trim()) newErrors.email = 'Email address is required.';
    else if (!email.includes('@')) newErrors.email = 'Please enter a valid email address.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
      toast.success('Form submitted successfully!');
    } else {
      setSubmitted(false);
    }
  }

  return (
    <section aria-labelledby="forms-heading" id="forms" className="space-y-4">
      {/*
       * HEADING HIERARCHY — h2 under the page-level h1. The aria-labelledby
       * on the <section> associates the landmark with its heading, so screen
       * readers announce "Forms region" when navigating by landmark.
       */}
      <h2 id="forms-heading" className="text-xl font-semibold">
        Accessible Form
      </h2>
      <p className="text-sm text-foreground-muted">
        Demonstrates label association, error announcements via <code>role=&quot;alert&quot;</code>,
        and <code>aria-describedby</code> for input hints.
      </p>

      {/*
       * FORM — uses native <form> element for implicit form landmark.
       * The noValidate attribute disables browser validation so we can
       * demonstrate custom accessible error handling.
       */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-w-md space-y-4 rounded-lg border border-border p-6"
      >
        {/*
         * FormItem + FormLabel + FormControl wire up:
         *   - <label htmlFor={id}> on the label
         *   - id={id} on the input
         *   - aria-describedby pointing to the description or error message
         *   - aria-invalid={true} when there's an error
         *   - FormMessage renders with role="alert" for screen reader announcement
         */}
        <FormItem name="a11y-name" error={errors.name}>
          <FormLabel>Full Name</FormLabel>
          <FormControl>
            <Input
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-required="true"
            />
          </FormControl>
          <FormDescription>
            Enter your legal name as it appears on official documents.
          </FormDescription>
          <FormMessage />
        </FormItem>

        <FormItem name="a11y-email" error={errors.email}>
          <FormLabel>Email Address</FormLabel>
          <FormControl>
            <Input
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-required="true"
            />
          </FormControl>
          <FormDescription>
            We&apos;ll send a confirmation to this address.
          </FormDescription>
          <FormMessage />
        </FormItem>

        <Button type="submit" className="w-full">
          Submit
        </Button>

        {/*
         * LIVE REGION for submit status — aria-live="polite" means the
         * screen reader waits until it finishes the current announcement
         * before reading this content.
         */}
        <p
          id={statusId}
          aria-live="polite"
          className="text-sm text-foreground-muted"
        >
          {submitted ? 'Form submitted successfully.' : ''}
        </p>
      </form>
    </section>
  );
}

/* ── Dialog ───────────────────────────────────────────────────────────────── */

function DialogSection() {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <section aria-labelledby="dialog-heading" id="dialog" className="space-y-4">
      <h2 id="dialog-heading" className="text-xl font-semibold">
        Accessible Dialog
      </h2>
      <p className="text-sm text-foreground-muted">
        Built on Radix Dialog: focus is trapped inside while open, Escape closes
        it, and focus returns to the trigger button on close.
      </p>

      {/*
       * DIALOG — Radix Dialog handles:
       *   - Focus trap: Tab cycles within the dialog content
       *   - Escape key dismissal
       *   - Focus restoration: returns focus to DialogTrigger on close
       *   - aria-labelledby (via DialogTitle) and aria-describedby (via DialogDescription)
       *   - role="dialog" on the content
       *   - The close button includes sr-only text "Close" for screen readers
       */}
      <Dialog>
        <DialogTrigger asChild>
          <Button ref={triggerRef}>Open Accessible Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              This dialog traps focus and can be dismissed with Escape.
              Try tabbing through the elements — focus stays inside.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <Label htmlFor="dialog-input">Your response</Label>
              <Input id="dialog-input" placeholder="Type something…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button onClick={() => toast.success('Action confirmed!')}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* ── ARIA Live Region ─────────────────────────────────────────────────────── */

function LiveRegionSection() {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [liveText, setLiveText] = useState('');

  function addNotification() {
    const timestamp = new Date().toLocaleTimeString();
    const message = `Notification at ${timestamp}`;
    setNotifications((prev) => [...prev, message]);
    setLiveText(message);
  }

  function clearNotifications() {
    setNotifications([]);
    setLiveText('All notifications cleared.');
  }

  return (
    <section aria-labelledby="live-region-heading" id="live-region" className="space-y-4">
      <h2 id="live-region-heading" className="text-xl font-semibold">
        ARIA Live Region
      </h2>
      <p className="text-sm text-foreground-muted">
        Dynamic content changes are announced by screen readers via{' '}
        <code>aria-live=&quot;polite&quot;</code>. The visually hidden live region
        below broadcasts updates without interrupting the user.
      </p>

      <div className="flex gap-3">
        <Button onClick={addNotification}>
          Add Notification
        </Button>
        <Button variant="outline" onClick={clearNotifications}>
          Clear All
        </Button>
      </div>

      {/*
       * LIVE REGION — this element is visually hidden but read by screen
       * readers whenever its content changes. "polite" means it waits for
       * the current speech to finish before announcing.
       */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveText}
      </div>

      {/* Visual notification list */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notifications ({notifications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {notifications.map((n, i) => (
                <li key={i} className="text-sm text-foreground-muted">
                  {n}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

/* ── Keyboard Navigation ──────────────────────────────────────────────────── */

function KeyboardNavigationSection() {
  const items = [
    { title: 'Semantic HTML', desc: 'Use native elements (button, a, input) instead of div+onClick.' },
    { title: 'Focus Indicators', desc: 'Visible focus rings help keyboard users track their position.' },
    { title: 'Tab Order', desc: 'Logical tab order follows the visual layout. Avoid positive tabIndex.' },
    { title: 'Skip Navigation', desc: 'A skip link lets users bypass repetitive navigation.' },
  ];

  return (
    <section aria-labelledby="keyboard-heading" id="keyboard" className="space-y-4">
      <h2 id="keyboard-heading" className="text-xl font-semibold">
        Keyboard Navigation
      </h2>
      <p className="text-sm text-foreground-muted">
        These cards are focusable and activatable with Enter or Space.
        Tab through them to see focus indicators.
      </p>

      {/*
       * KEYBOARD-ACCESSIBLE CARDS — each card is a <button> so it receives
       * focus naturally and responds to Enter/Space. We use role and semantic
       * HTML rather than adding keyboard handlers to divs.
       */}
      <div className="grid gap-4 sm:grid-cols-2" role="list">
        {items.map((item) => (
          <button
            key={item.title}
            role="listitem"
            onClick={() => toast(`${item.title}: ${item.desc}`)}
            className="rounded-xl border border-border bg-background p-6 text-left shadow transition-colors hover:bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <h3 className="font-semibold leading-none tracking-tight">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-foreground-muted">
              {item.desc}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
