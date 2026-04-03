'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Label } from './label';

import { cn } from '../lib/utils';

// ─── Form Context ───────────────────────────────────────────────────────────
// Lightweight form wrappers that provide consistent layout and error display
// without coupling to any specific form library. Compatible with react-hook-form,
// Formik, or plain controlled forms.

interface FormItemContextValue {
  id: string;
  error?: string;
}

const FormItemContext = React.createContext<FormItemContextValue>({
  id: '',
});

function useFormItem() {
  return React.useContext(FormItemContext);
}

/* ── FormItem ────────────────────────────────────────────────────────────── */

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Unique ID for linking label, control, and description. Auto-generated if omitted. */
  name?: string;
  /** Error message to display below the control */
  error?: string;
}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, name, error, children, ...props }, ref) => {
    const id = React.useId();
    const itemId = name ?? id;

    return (
      <FormItemContext value={{ id: itemId, error }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {children}
        </div>
      </FormItemContext>
    );
  }
);
FormItem.displayName = 'FormItem';

/* ── FormLabel ───────────────────────────────────────────────────────────── */

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { id, error } = useFormItem();

  return (
    <Label
      ref={ref}
      className={cn(error && 'text-destructive', className)}
      htmlFor={id}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

/* ── FormControl ─────────────────────────────────────────────────────────── */

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { id, error } = useFormItem();

  return (
    <Slot
      ref={ref}
      id={id}
      aria-describedby={error ? `${id}-message` : `${id}-description`}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

/* ── FormDescription ─────────────────────────────────────────────────────── */

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { id } = useFormItem();

  return (
    <p
      ref={ref}
      id={`${id}-description`}
      className={cn('text-[0.8rem] text-foreground-muted', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

/* ── FormMessage ─────────────────────────────────────────────────────────── */

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Override the error from FormItem context */
  message?: string;
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, message, ...props }, ref) => {
    const { id, error } = useFormItem();
    const body = message ?? error;

    if (!body && !children) return null;

    return (
      <p
        ref={ref}
        id={`${id}-message`}
        className={cn('text-[0.8rem] font-medium text-destructive', className)}
        {...props}
      >
        {body ?? children}
      </p>
    );
  }
);
FormMessage.displayName = 'FormMessage';

export {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormItem,
};
