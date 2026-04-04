import type { Theme } from '../types';
import { colors } from '../tokens/colors';

// ─── Midnight Theme ─────────────────────────────────────────────────────────
// A deep blue-tinted dark theme with indigo accents.
// Proves multi-theme architecture beyond the standard light/dark pair.

export const midnightTheme: Theme = {
  name: 'midnight',
  colors: {
    background: 'hsl(230, 35%, 7%)',
    'background-secondary': 'hsl(230, 30%, 12%)',

    foreground: colors.indigo[50],
    'foreground-muted': colors.indigo[300],

    primary: colors.indigo[400],
    'primary-foreground': colors.white,

    secondary: 'hsl(230, 25%, 18%)',
    'secondary-foreground': colors.indigo[100],

    muted: 'hsl(230, 25%, 15%)',
    'muted-foreground': colors.indigo[400],

    border: 'hsl(230, 20%, 20%)',
    'border-input': 'hsl(230, 20%, 28%)',
    ring: colors.indigo[500],

    destructive: colors.red[400],
    'destructive-foreground': colors.white,

    success: colors.green[400],
    'success-foreground': colors.black,

    warning: colors.amber[400],
    'warning-foreground': colors.black,
  },
};
