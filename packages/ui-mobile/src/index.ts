// ─── @mono/ui-mobile ────────────────────────────────────────────────────────
// Reusable, theme-aware UI primitives for Expo / React Native.
// All components consume @mono/design-tokens via the ThemeProvider context.
//
// Usage:
//   import { ThemeProvider, Button, Card, Screen } from '@mono/ui-mobile';

// Theme
export type { ThemeContextValue, ThemeName, ThemeProviderProps } from './theme/ThemeProvider';
export { ThemeProvider, useTheme } from './theme/ThemeProvider';

// Tokens (numeric, RN-ready)
export {
  nativeFontFamily,
  nativeFontSize,
  nativeFontWeight,
  nativeLineHeight,
  nativeRadius,
  nativeSpacing,
  sp,
} from './tokens/native-tokens';

// Components
export type { ButtonProps, ButtonSize,ButtonVariant } from './components/Button';
export { Button } from './components/Button';
export type { ErrorBannerProps } from './components/ErrorBanner';
export { ErrorBanner } from './components/ErrorBanner';
export type { CardProps, CardVariant } from './components/Card';
export { Card } from './components/Card';
export type { EmptyStateAction,EmptyStateProps } from './components/EmptyState';
export { EmptyState } from './components/EmptyState';
export type { LoadingStateProps } from './components/LoadingState';
export { LoadingState } from './components/LoadingState';
export type { ScreenProps } from './components/Screen';
export { Screen } from './components/Screen';
export type { TextFieldProps } from './components/TextField';
export { TextField } from './components/TextField';
