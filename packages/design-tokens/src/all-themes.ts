import type { Theme } from './types';
import { lightTheme } from './themes/light';
import { darkTheme } from './themes/dark';
import { midnightTheme } from './themes/midnight';

// ─── All Themes ─────────────────────────────────────────────────────────────
// Convenience array and type-safe theme name union.

/** All registered themes in priority order (first = default). */
export const allThemes: readonly Theme[] = [lightTheme, darkTheme, midnightTheme];

/** Union type of valid theme names. */
export type ThemeName = 'light' | 'dark' | 'midnight';

/** Array of theme name strings. */
export const themeNames: readonly ThemeName[] = ['light', 'dark', 'midnight'];
