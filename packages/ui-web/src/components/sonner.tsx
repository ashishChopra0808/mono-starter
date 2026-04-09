'use client';

import { Toaster as SonnerToaster, toast } from 'sonner';

import { cn } from '../lib/utils';

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

/**
 * Theme-aware toast container.
 * Place once in your root layout — toasts are triggered imperatively via `toast()`.
 *
 * @example
 * // layout.tsx
 * <Toaster />
 *
 * // anywhere in the app
 * import { toast } from '@mono/ui-web';
 * toast.success('Booking confirmed!');
 */
function Toaster({ className, closeButton = true, ...props }: ToasterProps) {
  return (
    <SonnerToaster
      className={cn('toaster group', className)}
      closeButton={closeButton}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-foreground-muted',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          error:
            'group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive',
          success:
            'group-[.toaster]:bg-success group-[.toaster]:text-success-foreground group-[.toaster]:border-success',
          warning:
            'group-[.toaster]:bg-warning group-[.toaster]:text-warning-foreground group-[.toaster]:border-warning',
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };
