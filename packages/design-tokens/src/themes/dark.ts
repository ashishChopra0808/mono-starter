import type { Theme } from '../types';
import { colors } from '../tokens/colors';

// ─── Dark Theme ─────────────────────────────────────────────────────────────

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: colors.slate[950],
    'background-secondary': colors.slate[900],

    foreground: colors.slate[50],
    'foreground-muted': colors.slate[400],

    primary: colors.blue[500],
    'primary-foreground': colors.white,

    secondary: colors.slate[800],
    'secondary-foreground': colors.slate[100],

    muted: colors.slate[800],
    'muted-foreground': colors.slate[400],

    border: colors.slate[700],
    'border-input': colors.slate[600],
    ring: colors.blue[500],

    destructive: colors.red[500],
    'destructive-foreground': colors.white,

    success: colors.green[500],
    'success-foreground': colors.white,

    warning: colors.amber[400],
    'warning-foreground': colors.black,
  },
};
