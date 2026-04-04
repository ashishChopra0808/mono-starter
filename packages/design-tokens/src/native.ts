import type { Theme, SemanticColors } from './types';

// ─── React Native Helpers ───────────────────────────────────────────────────
// Provides theme values in a format compatible with RN StyleSheet.

/**
 * Extract the semantic color record from a theme for direct use in
 * React Native `StyleSheet.create()` or inline styles.
 *
 * @example
 * ```tsx
 * const themeColors = themeToColors(lightTheme);
 * const styles = StyleSheet.create({
 *   container: { backgroundColor: themeColors.background },
 *   text: { color: themeColors.foreground },
 * });
 * ```
 */
export function themeToColors(theme: Theme): Readonly<SemanticColors> {
  return theme.colors;
}

/**
 * List of available theme names — useful for building a theme picker UI.
 */
export function getThemeNames(themes: Theme[]): string[] {
  return themes.map((t) => t.name);
}
