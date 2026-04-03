import type { Theme } from './types.js';
import { lightTheme } from './themes/light.js';
import { darkTheme } from './themes/dark.js';
import { midnightTheme } from './themes/midnight.js';

// ─── All Themes ─────────────────────────────────────────────────────────────
// Convenience array and type-safe theme name union.

/** All registered themes in priority order (first = default). */
export const allThemes: readonly Theme[] = [lightTheme, darkTheme, midnightTheme];

/** Union type of valid theme names. */
export type ThemeName = 'light' | 'dark' | 'midnight';

/** Array of theme name strings. */
export const themeNames: readonly ThemeName[] = ['light', 'dark', 'midnight'];
