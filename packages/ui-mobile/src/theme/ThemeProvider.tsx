import type { SemanticColors,Theme } from '@mono/design-tokens';
import { darkTheme, lightTheme, midnightTheme } from '@mono/design-tokens';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

// ─── Mobile Theme Provider ──────────────────────────────────────────────────
// React Context-based theme provider for Expo / React Native.
// Provides semantic color values and theme switching capabilities.
//
// Usage:
//   import { ThemeProvider, useTheme } from '@mono/ui-mobile';
//
//   <ThemeProvider>
//     <App />
//   </ThemeProvider>
//
//   const { colors, toggleTheme, themeName } = useTheme();

export type ThemeName = 'light' | 'dark' | 'midnight';

export interface ThemeContextValue {
  /** Current theme name */
  themeName: ThemeName;
  /** Current theme's semantic color values */
  colors: Readonly<SemanticColors>;
  /** Full theme object */
  theme: Theme;
  /** Whether the current theme is dark (dark or midnight) */
  isDark: boolean;
  /** Switch to a specific theme */
  setTheme: (name: ThemeName) => void;
  /** Cycle through themes: light → dark → midnight → light */
  toggleTheme: () => void;
}

const themeMap: Record<ThemeName, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  midnight: midnightTheme,
};

const THEME_CYCLE: ThemeName[] = ['light', 'dark', 'midnight'];

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Override the initial theme (ignores system color scheme). */
  defaultTheme?: ThemeName;
}

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const initialTheme = defaultTheme ?? (systemScheme === 'dark' ? 'dark' : 'light');

  const [themeName, setThemeName] = useState<ThemeName>(initialTheme);

  // Follow system scheme changes when no manual override
  useEffect(() => {
    if (!defaultTheme && systemScheme) {
      setThemeName(systemScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemScheme, defaultTheme]);

  const currentTheme = themeMap[themeName];

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeName((current) => {
      const idx = THEME_CYCLE.indexOf(current);
      return THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeName,
      colors: currentTheme.colors,
      theme: currentTheme,
      isDark: themeName === 'dark' || themeName === 'midnight',
      setTheme,
      toggleTheme,
    }),
    [themeName, currentTheme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Access the current theme's colors and theme-switching functions.
 *
 * **Must** be used within a `<ThemeProvider>`.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { colors, toggleTheme, isDark } = useTheme();
 *   return (
 *     <View style={{ backgroundColor: colors.background }}>
 *       <Text style={{ color: colors.foreground }}>Hello</Text>
 *       <Button title="Toggle" onPress={toggleTheme} />
 *     </View>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return ctx;
}
