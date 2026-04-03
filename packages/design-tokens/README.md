# @mono/design-tokens

A centralized, multi-theme design token system providing a single source of truth for colours, typography, spacing, and radii across all apps in the monorepo.

## Overview

Design tokens are the **visual atoms** of the product's design system — the named values (colors, spacing, typography, etc.) that are shared across every platform and component.

This package provides:

- ✅ **3 themes** out of the box: light, dark, and midnight
- ✅ **Semantic tokens** — role-based references (not raw hex/hsl)
- ✅ **Web support** — CSS custom properties with zero-JS theme switching
- ✅ **Mobile support** — React Native `useTheme()` hook
- ✅ **Tailwind-ready** — `var()` references for future Tailwind integration
- ✅ **Type-safe** — full TypeScript types for all tokens

---

## Semantic vs Raw Tokens

### Raw Tokens

Raw tokens are the actual visual values — the colour palette, pixel values, font names:

```ts
import { colors } from '@mono/design-tokens';

colors.blue[600]   // 'hsl(221, 83%, 53%)' — a specific blue
colors.slate[950]  // 'hsl(229, 84%, 5%)'  — nearly black
```

**⚠ Don't use raw tokens in app code.** They have no semantic meaning and won't adapt to themes.

### Semantic Tokens

Semantic tokens describe the **role** a value plays — what it does, not what it looks like:

```css
/* In CSS */
color: var(--color-foreground);       /* → adapts per theme */
background: var(--color-background);
border: 1px solid var(--color-border);
```

```tsx
// In React Native
const { colors } = useTheme();
<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.foreground }}>Hello</Text>
</View>
```

When the theme changes, the same semantic token automatically maps to different raw values.

---

## Available Semantic Tokens

### Colors

| Token | Light | Dark | Purpose |
|---|---|---|---|
| `background` | white | near-black | Page background |
| `background-secondary` | light gray | dark gray | Card / surface background |
| `foreground` | near-black | near-white | Primary text |
| `foreground-muted` | gray | light gray | Secondary text |
| `primary` | blue 600 | blue 500 | CTAs, links |
| `primary-foreground` | white | white | Text on primary |
| `secondary` | slate 100 | slate 800 | Less prominent actions |
| `secondary-foreground` | slate 900 | slate 100 | Text on secondary |
| `muted` | slate 100 | slate 800 | Disabled surfaces |
| `muted-foreground` | slate 500 | slate 400 | Placeholder text |
| `border` | slate 200 | slate 700 | General borders |
| `border-input` | slate 300 | slate 600 | Input field borders |
| `ring` | blue 400 | blue 500 | Focus rings |
| `destructive` | red 600 | red 500 | Errors, delete |
| `success` | green 600 | green 500 | Confirmations |
| `warning` | amber 500 | amber 400 | Caution states |

All `-foreground` variants define the text colour to use on that background.

### Non-Color Tokens

| Category | CSS Variable | Example |
|---|---|---|
| Spacing | `--spacing-{0..24}` | `--spacing-4: 1rem` (16px) |
| Radius | `--radius-{sm,md,lg,xl,full}` | `--radius-md: 0.5rem` |
| Font Family | `--font-{sans,mono}` | `--font-sans: 'Inter', ...` |
| Font Size | `--text-{xs..4xl}` | `--text-base: 1rem` |
| Line Height | `--leading-{tight,normal,relaxed}` | `--leading-normal: 1.5` |

---

## Usage in Web / Admin (Next.js)

### CSS Custom Properties

The global CSS already includes all token variables. Use them directly:

```css
.card {
  background-color: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  color: var(--color-foreground);
}

.button-primary {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
}

.error-message {
  color: var(--color-destructive);
}
```

### Theme Switching

The layout wraps children in `<ThemeProvider>`. Use the `useTheme()` hook:

```tsx
'use client';
import { useTheme } from '../theme-provider';

export function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Current: {theme} (click to cycle)
    </button>
  );
}
```

Or set a specific theme:

```tsx
setTheme('dark');
setTheme('midnight');
setTheme('light');
```

### How It Works (Zero JS for Styling)

1. CSS custom properties are declared per `[data-theme]` selector
2. `ThemeProvider` sets `data-theme` attribute on `<html>`
3. CSS variables automatically resolve to the active theme's values
4. No re-render needed — the browser handles it natively

### Future Tailwind Integration

The `cssColorVars` export provides `var()` references for Tailwind config:

```ts
// tailwind.config.ts
import { cssColorVars } from '@mono/design-tokens/css';

export default {
  theme: {
    extend: {
      colors: {
        background: cssColorVars.background,
        foreground: cssColorVars.foreground,
        primary: cssColorVars.primary,
        // ...
      },
    },
  },
};
```

---

## Usage in Mobile (Expo / React Native)

### Setup

Wrap your app in `ThemeProvider`:

```tsx
// App.tsx
import { ThemeProvider } from '../theme/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      <MyApp />
    </ThemeProvider>
  );
}
```

### Using Theme Colors

```tsx
import { useTheme } from '../theme/ThemeProvider';
import { View, Text, StyleSheet } from 'react-native';

export function ProfileCard() {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors['background-secondary'], borderColor: colors.border }]}>
      <Text style={{ color: colors.foreground }}>Profile</Text>
      <Text style={{ color: colors['foreground-muted'] }}>Subtitle</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
  },
});
```

### Theme Switching

```tsx
const { toggleTheme, setTheme, themeName } = useTheme();

// Cycle: light → dark → midnight → light
<Button title="Toggle Theme" onPress={toggleTheme} />

// Set specific
<Button title="Dark Mode" onPress={() => setTheme('dark')} />
```

---

## Adding a New Theme

1. Create `packages/design-tokens/src/themes/your-theme.ts`:

```ts
import type { Theme } from '../types.js';
import { colors } from '../tokens/colors.js';

export const yourTheme: Theme = {
  name: 'your-theme',
  colors: {
    background: colors.white,
    // ... fill all SemanticColors keys
  },
};
```

2. Register in `src/all-themes.ts`:

```ts
import { yourTheme } from './themes/your-theme.js';

export const allThemes = [lightTheme, darkTheme, midnightTheme, yourTheme];
export type ThemeName = 'light' | 'dark' | 'midnight' | 'your-theme';
export const themeNames = ['light', 'dark', 'midnight', 'your-theme'];
```

3. Re-export from `src/index.ts`

4. **Web/Admin**: Regenerate CSS and add to `global.css`, update ThemeProvider cycle

5. **Mobile**: Add to `themeMap` in `ThemeProvider.tsx`

6. Rebuild: `pnpm nx build @mono/design-tokens`

---

## Adding a New Token

### New Semantic Color

1. Add the key to `SemanticColors` in `src/types.ts`
2. Add the mapping in every theme file (`light.ts`, `dark.ts`, `midnight.ts`)
3. Add to `cssColorVars` in `src/css.ts`
4. Rebuild and regenerate CSS

### New Spacing / Radius / Typography Value

1. Add to the relevant file in `src/tokens/`
2. The CSS generator picks it up automatically
3. Rebuild and regenerate CSS

---

## File Structure

```
packages/design-tokens/src/
├── index.ts              # Barrel export (types + tokens + themes)
├── types.ts              # SemanticColors, Theme, Typography, Spacing, Radius
├── all-themes.ts         # allThemes array + ThemeName type
├── css.ts                # CSS custom property generator (web/admin)
├── native.ts             # React Native helpers (mobile)
├── tokens/
│   ├── colors.ts         # Raw HSL color palette
│   ├── typography.ts     # Font families, sizes, weights
│   └── spacing.ts        # Spacing scale + border radii
└── themes/
    ├── light.ts          # Light theme
    ├── dark.ts           # Dark theme
    └── midnight.ts       # Midnight theme (deep blue)
```
