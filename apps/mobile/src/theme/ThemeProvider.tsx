import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, midnightTheme } from '@mono/design-tokens';
import type { Theme, SemanticColors } from '@mono/design-tokens';

// ─── Mobile Theme Provider ──────────────────────────────────────────────────
// React Context-based theme provider for Expo / React Native.
// Provides semantic color values and theme switching capabilities.

export type ThemeName = 'light' | 'dark' | 'midnight';

interface ThemeContextValue {
  /** Current theme name */
  themeName: ThemeName;
  /** Current theme's semantic color values */
  colors: Readonly<SemanticColors>;
  /** Full theme object */
  theme: Theme;
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

export function ThemeProvider({
  children,
  defaultTheme,
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
}) {
  const systemScheme = useColorScheme();
  const initialTheme = defaultTheme ?? (systemScheme === 'dark' ? 'dark' : 'light');

  const [themeName, setThemeName] = useState<ThemeName>(initialTheme);

  // Update when system scheme changes (if no manual override)
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

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        colors: currentTheme.colors,
        theme: currentTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Access the current theme's colors and theme-switching functions.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { colors, toggleTheme } = useTheme();
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
