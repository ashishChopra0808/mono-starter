import type { SemanticColors, Theme } from './types';
import { typography } from './tokens/typography';
import { spacing, radius } from './tokens/spacing';

// ─── CSS Custom Property Generation ─────────────────────────────────────────
// Converts TypeScript theme objects into CSS custom properties.
// Web apps import the generated CSS to get theme-aware styling with zero JS.

/**
 * Convert a theme's semantic colors into CSS custom property declarations.
 *
 * @example
 * ```css
 * --color-background: hsl(0, 0%, 100%);
 * --color-primary: hsl(221, 83%, 53%);
 * ```
 */
export function themeToCssProperties(theme: Theme): string {
  return Object.entries(theme.colors)
    .map(([key, value]) => `  --color-${key}: ${value};`)
    .join('\n');
}

/**
 * Generate non-color CSS custom properties (spacing, radius, typography).
 * These are theme-independent — declared once in `:root`.
 */
export function generateBaseTokens(): string {
  const spacingVars = Object.entries(spacing)
    .map(([key, value]) => `  --spacing-${key.replace('.', '_')}: ${value};`)
    .join('\n');

  const radiusVars = Object.entries(radius)
    .map(([key, value]) => `  --radius-${key}: ${value};`)
    .join('\n');

  const fontFamilyVars = Object.entries(typography.fontFamily)
    .map(([key, value]) => `  --font-${key}: ${value};`)
    .join('\n');

  const fontSizeVars = Object.entries(typography.fontSize)
    .map(([key, value]) => `  --text-${key}: ${value};`)
    .join('\n');

  const lineHeightVars = Object.entries(typography.lineHeight)
    .map(([key, value]) => `  --leading-${key}: ${value};`)
    .join('\n');

  return [spacingVars, radiusVars, fontFamilyVars, fontSizeVars, lineHeightVars].join('\n\n');
}

/**
 * Generate a complete CSS stylesheet with theme-aware custom properties.
 *
 * The first theme becomes the `:root` default. All themes are also available
 * via `[data-theme="<name>"]` selectors.
 *
 * @example
 * ```css
 * :root, [data-theme="light"] {
 *   --color-background: hsl(0, 0%, 100%);
 *   ...
 * }
 * [data-theme="dark"] {
 *   --color-background: hsl(229, 84%, 5%);
 *   ...
 * }
 * ```
 */
export function generateThemeStylesheet(themes: Theme[]): string {
  if (themes.length === 0) return '';

  const sections: string[] = [];

  // Base (non-color) tokens — always available
  sections.push(`:root {\n${generateBaseTokens()}\n}`);

  // First theme = default (:root)
  const [defaultTheme, ...otherThemes] = themes;
  sections.push(
    `:root, [data-theme="${defaultTheme.name}"] {\n${themeToCssProperties(defaultTheme)}\n}`
  );

  // Additional themes
  for (const theme of otherThemes) {
    sections.push(
      `[data-theme="${theme.name}"] {\n${themeToCssProperties(theme)}\n}`
    );
  }

  return sections.join('\n\n');
}

/**
 * Helper: get all semantic color token names as CSS variable references.
 * Useful for Tailwind CSS configuration or programmatic access.
 *
 * @example
 * ```ts
 * cssColorVars.background  // 'var(--color-background)'
 * cssColorVars.primary     // 'var(--color-primary)'
 * ```
 */
export const cssColorVars: Record<keyof SemanticColors, string> = {
  background: 'var(--color-background)',
  'background-secondary': 'var(--color-background-secondary)',
  foreground: 'var(--color-foreground)',
  'foreground-muted': 'var(--color-foreground-muted)',
  primary: 'var(--color-primary)',
  'primary-foreground': 'var(--color-primary-foreground)',
  secondary: 'var(--color-secondary)',
  'secondary-foreground': 'var(--color-secondary-foreground)',
  muted: 'var(--color-muted)',
  'muted-foreground': 'var(--color-muted-foreground)',
  border: 'var(--color-border)',
  'border-input': 'var(--color-border-input)',
  ring: 'var(--color-ring)',
  destructive: 'var(--color-destructive)',
  'destructive-foreground': 'var(--color-destructive-foreground)',
  success: 'var(--color-success)',
  'success-foreground': 'var(--color-success-foreground)',
  warning: 'var(--color-warning)',
  'warning-foreground': 'var(--color-warning-foreground)',
};
