import { radius,spacing } from '@mono/design-tokens';
import { typography } from '@mono/design-tokens';
import { Platform } from 'react-native';

// ─── Numeric Token Converters ───────────────────────────────────────────────
// Design tokens store spacing/radius as CSS rem strings (e.g. '0.5rem').
// React Native needs plain numbers (in dp, density-independent pixels).
// We convert assuming 1rem = 16dp (standard web baseline).

const REM_BASE = 16;

/**
 * Convert a rem/px string to a numeric dp value.
 * Handles: '0.5rem' → 8, '9999px' → 9999, '0' → 0
 */
function toNumber(value: string): number {
  if (value === '0') return 0;
  if (value.endsWith('rem')) {
    return parseFloat(value) * REM_BASE;
  }
  if (value.endsWith('px')) {
    return parseFloat(value);
  }
  return parseFloat(value);
}

// ─── Spacing ────────────────────────────────────────────────────────────────



/** Spacing scale in dp. Keys match design-tokens (e.g. '4' → 16dp). */
export const nativeSpacing: Record<string, number> = Object.fromEntries(
  Object.entries(spacing).map(([key, value]) => [key, toNumber(value)])
);

/**
 * Get spacing value by key.
 * @example sp('4') // 16
 * @example sp('2') // 8
 */
export function sp(key: string): number {
  return nativeSpacing[key] ?? 0;
}

// ─── Border Radius ──────────────────────────────────────────────────────────

/** Border radii in dp. */
export const nativeRadius = {
  sm: toNumber(radius.sm),   // 4
  md: toNumber(radius.md),   // 8
  lg: toNumber(radius.lg),   // 12
  xl: toNumber(radius.xl),   // 16
  full: toNumber(radius.full), // 9999
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────

/** Font sizes in dp. */
export const nativeFontSize = {
  xs: toNumber(typography.fontSize.xs),       // 12
  sm: toNumber(typography.fontSize.sm),       // 14
  base: toNumber(typography.fontSize.base),   // 16
  lg: toNumber(typography.fontSize.lg),       // 18
  xl: toNumber(typography.fontSize.xl),       // 20
  '2xl': toNumber(typography.fontSize['2xl']),// 24
  '3xl': toNumber(typography.fontSize['3xl']),// 30
  '4xl': toNumber(typography.fontSize['4xl']),// 36
} as const;

/** Font weights. Mapped directly (already numeric in design-tokens). */
export const nativeFontWeight = typography.fontWeight;

/**
 * Platform-appropriate default font families.
 * We don't carry over the CSS font stack — RN uses system fonts by default.
 */
export const nativeFontFamily = {
  sans: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
} as const;

/** Line-height multipliers (already unitless in design-tokens). */
export const nativeLineHeight = {
  tight: parseFloat(typography.lineHeight.tight),     // 1.25
  normal: parseFloat(typography.lineHeight.normal),   // 1.5
  relaxed: parseFloat(typography.lineHeight.relaxed), // 1.75
} as const;
