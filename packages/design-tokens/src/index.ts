// ─── @mono/design-tokens ────────────────────────────────────────────────────
// Centralized design token and theming system for the monorepo.
//
// Usage:
//   import { lightTheme, darkTheme, midnightTheme } from '@mono/design-tokens';
//   import { generateThemeStylesheet, cssColorVars } from '@mono/design-tokens/css';
//   import { themeToColors } from '@mono/design-tokens/native';

// Types
export type { SemanticColors, Theme, TypographyTokens, SpacingTokens, RadiusTokens } from './types.js';

// Raw tokens
export { colors } from './tokens/colors.js';
export { typography } from './tokens/typography.js';
export { spacing, radius } from './tokens/spacing.js';

// Themes
export { lightTheme } from './themes/light.js';
export { darkTheme } from './themes/dark.js';
export { midnightTheme } from './themes/midnight.js';

// All themes as an array (convenience)
export { allThemes, themeNames, type ThemeName } from './all-themes.js';
