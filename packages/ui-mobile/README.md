# @mono/ui-mobile — Architecture & Usage

A reusable, theme-aware UI component library for Expo / React Native. Provides a small set of production-quality primitives that consume `@mono/design-tokens` directly — no Tailwind, no web DOM assumptions.

---

## Why Web and Mobile UI Packages Are Separate

The monorepo has two UI libraries with a deliberate separation:

| | `@mono/ui-web` | `@mono/ui-mobile` |
|---|---|---|
| **Renders to** | DOM elements (`<div>`, `<button>`, `<input>`) | Native views (`View`, `Pressable`, `TextInput`) |
| **Styling** | Tailwind CSS utility classes + CSS custom properties | `StyleSheet.create` + inline theme styles |
| **Accessibility** | Radix UI headless primitives (ARIA roles, focus management) | React Native accessibility props (`accessibilityRole`, etc.) |
| **Variant API** | CVA (class-variance-authority) → CSS class composition | Plain TypeScript union props → style object lookup |
| **Theme delivery** | CSS custom properties (`var(--color-*)`) — zero JS at runtime | React Context (`useTheme()`) — re-render on theme change |
| **Composition** | `className` prop, `cn()` merge, `asChild` via Radix Slot | `style` prop, array style merging |

### What IS Shared

Both libraries consume the same **design tokens** from `@mono/design-tokens`:

- ✅ **Semantic color names** — `background`, `primary`, `foreground`, `destructive`, etc.
- ✅ **Theme definitions** — `lightTheme`, `darkTheme`, `midnightTheme`
- ✅ **Spacing scale** — 4px-based (converted to numeric dp for mobile)
- ✅ **Border radii** — `sm`, `md`, `lg`, `xl`, `full`
- ✅ **Typography scale** — font sizes, weights, line heights
- ✅ **Component semantics** — both have `Button`, `Card`, `TextField`/`Input` with similar variant names (`primary`, `secondary`, `destructive`)

### What Stays Separate

- ❌ **Styling technology** — Tailwind classes are meaningless in RN
- ❌ **Headless UI framework** — Radix UI is DOM-only
- ❌ **Platform APIs** — gestures, haptics, safe areas, keyboard avoidance
- ❌ **Component implementations** — fundamentally different renderers

### Why Not a Single Shared Library?

A common abstraction layer (like `react-native-web`) would force:
1. **Lowest-common-denominator APIs** — no `className`, no `asChild`, no CSS animations on web; no native gestures, no `StyleSheet` optimization on mobile
2. **Build complexity** — both platforms would need the same bundler pipeline
3. **Slower iteration** — a change to a web-only feature (e.g., dialog focus trap) would risk breaking mobile

The current approach gives each platform its best idioms while sharing the design language through tokens.

---

## Quick Start

### Wrap your app in `ThemeProvider`

```tsx
import { ThemeProvider } from '@mono/ui-mobile';

export default function App() {
  return (
    <ThemeProvider>
      <MyApp />
    </ThemeProvider>
  );
}
```

### Use components

```tsx
import { Screen, Button, Card, TextField, LoadingState, EmptyState, useTheme } from '@mono/ui-mobile';

export function HomeScreen() {
  const { colors, toggleTheme, themeName } = useTheme();

  return (
    <Screen>
      <Card variant="elevated">
        <TextField label="Search" placeholder="Type here…" value="" onChangeText={() => {}} />
      </Card>
      <Button variant="primary" onPress={toggleTheme}>
        Switch to {themeName === 'light' ? 'dark' : 'light'}
      </Button>
    </Screen>
  );
}
```

---

## Components

### `<Button>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'destructive' \| 'outline' \| 'ghost'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding & font size |
| `loading` | `boolean` | `false` | Shows spinner, disables press |
| `disabled` | `boolean` | `false` | Reduces opacity, disables press |
| `onPress` | `() => void` | — | Press handler |
| `children` | `ReactNode` | — | Button label (string or custom) |
| `style` | `ViewStyle` | — | Container overrides |

### `<TextField>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Label above the input |
| `error` | `string` | — | Error below the input (red) |
| `disabled` | `boolean` | `false` | Disables editing |
| `containerStyle` | `ViewStyle` | — | Outer container overrides |
| `inputStyle` | `ViewStyle` | — | TextInput overrides |
| _…all `TextInputProps`_ | — | — | Passed through to `TextInput` |

`TextField` uses `forwardRef` — call `.focus()` / `.blur()` via a ref.

### `<Screen>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `scrollable` | `boolean` | `true` | Wrap in ScrollView |
| `padded` | `boolean` | `true` | Horizontal + bottom padding |
| `statusBarStyle` | `'light' \| 'dark' \| 'auto'` | `'auto'` | StatusBar style (auto follows theme) |
| `contentStyle` | `ViewStyle` | — | Inner content overrides |
| `style` | `ViewStyle` | — | Outer container overrides |

### `<Card>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'elevated' \| 'outlined' \| 'filled'` | `'elevated'` | Surface style |
| `onPress` | `() => void` | — | Makes the card touchable |
| `style` | `ViewStyle` | — | Container overrides |

### `<LoadingState>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | — | Text below spinner |
| `size` | `'sm' \| 'lg'` | `'lg'` | Spinner size |
| `style` | `ViewStyle` | — | Container overrides |

### `<EmptyState>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `ReactNode` | — | Icon above title |
| `title` | `string` | — | Primary message |
| `description` | `string` | — | Secondary text |
| `action` | `{ label, onPress }` | — | CTA button |
| `style` | `ViewStyle` | — | Container overrides |

---

## Token Utilities

The library re-exports numeric (dp) versions of design tokens:

```tsx
import { sp, nativeRadius, nativeFontSize, nativeFontFamily } from '@mono/ui-mobile';

const styles = StyleSheet.create({
  container: {
    padding: sp('4'),              // 16dp
    borderRadius: nativeRadius.lg, // 12dp
  },
  text: {
    fontSize: nativeFontSize.lg,   // 18dp
    fontFamily: nativeFontFamily.sans, // 'System' (iOS) / 'Roboto' (Android)
  },
});
```

---

## File Structure

```
packages/ui-mobile/src/
├── index.ts                  # Barrel export
├── theme/
│   └── ThemeProvider.tsx      # ThemeProvider + useTheme hook
├── tokens/
│   └── native-tokens.ts      # rem→number converters
└── components/
    ├── Button.tsx
    ├── TextField.tsx
    ├── Screen.tsx
    ├── Card.tsx
    ├── LoadingState.tsx
    └── EmptyState.tsx
```

---

## Adding a New Component — Checklist

1. **Is it reusable across mobile apps?** If only one app needs it, keep it there.
2. **Is it presentation-only?** No API calls, no business logic.
3. Create `packages/ui-mobile/src/components/<Name>.tsx`
4. Use `useTheme()` for colors, `sp()` / `nativeRadius` for spacing
5. Export from `packages/ui-mobile/src/index.ts`
6. Add prop documentation to this README
