// ─── @mono/config-tailwind ──────────────────────────────────────────────────
// Shared Tailwind CSS preset for the monorepo.
// Maps Tailwind theme values to CSS custom properties from @mono/design-tokens.
// This means `bg-background`, `text-primary`, `border-border` etc. all resolve
// to the currently-active theme set via `data-theme` on <html>.

import tailwindAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    // ── Colors ────────────────────────────────────────────────────────────
    // Every key maps to var(--color-<key>) from @mono/design-tokens CSS output.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',

      // Semantic tokens
      background: {
        DEFAULT: 'var(--color-background)',
        secondary: 'var(--color-background-secondary)',
      },
      foreground: {
        DEFAULT: 'var(--color-foreground)',
        muted: 'var(--color-foreground-muted)',
      },
      primary: {
        DEFAULT: 'var(--color-primary)',
        foreground: 'var(--color-primary-foreground)',
      },
      secondary: {
        DEFAULT: 'var(--color-secondary)',
        foreground: 'var(--color-secondary-foreground)',
      },
      muted: {
        DEFAULT: 'var(--color-muted)',
        foreground: 'var(--color-muted-foreground)',
      },
      border: {
        DEFAULT: 'var(--color-border)',
        input: 'var(--color-border-input)',
      },
      ring: {
        DEFAULT: 'var(--color-ring)',
      },
      destructive: {
        DEFAULT: 'var(--color-destructive)',
        foreground: 'var(--color-destructive-foreground)',
      },
      success: {
        DEFAULT: 'var(--color-success)',
        foreground: 'var(--color-success-foreground)',
      },
      warning: {
        DEFAULT: 'var(--color-warning)',
        foreground: 'var(--color-warning-foreground)',
      },
    },

    // ── Spacing ───────────────────────────────────────────────────────────
    // Extend rather than replace so Tailwind's default numeric spacing still works.
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
      },
      // ── Animations (shadcn standard set) ──────────────────────────────
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-in-from-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-from-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
      },
    },
  },
  plugins: [tailwindAnimate],
};
