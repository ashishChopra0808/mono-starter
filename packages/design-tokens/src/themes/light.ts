import type { Theme } from '../types.js';
import { colors } from '../tokens/colors.js';

// ─── Light Theme ────────────────────────────────────────────────────────────

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: colors.white,
    'background-secondary': colors.slate[50],

    foreground: colors.slate[950],
    'foreground-muted': colors.slate[500],

    primary: colors.blue[600],
    'primary-foreground': colors.white,

    secondary: colors.slate[100],
    'secondary-foreground': colors.slate[900],

    muted: colors.slate[100],
    'muted-foreground': colors.slate[500],

    border: colors.slate[200],
    'border-input': colors.slate[300],
    ring: colors.blue[400],

    destructive: colors.red[600],
    'destructive-foreground': colors.white,

    success: colors.green[600],
    'success-foreground': colors.white,

    warning: colors.amber[500],
    'warning-foreground': colors.black,
  },
};
