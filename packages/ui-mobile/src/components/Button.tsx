import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { nativeFontSize, nativeRadius, sp } from '../tokens/native-tokens';

// ─── Button ─────────────────────────────────────────────────────────────────
// A themed, pressable button with variant and size support.
//
// Usage:
//   <Button variant="primary" size="lg" onPress={doSomething}>
//     Save Changes
//   </Button>

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Visual variant. @default 'primary' */
  variant?: ButtonVariant;
  /** Button size. @default 'md' */
  size?: ButtonSize;
  /** Show a loading spinner and disable interactions. */
  loading?: boolean;
  /** Button contents — typically text. */
  children: React.ReactNode;
  /** Additional style overrides. */
  style?: ViewStyle;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  style,
  ...pressableProps
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  // ── Variant styles ──
  const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: { backgroundColor: colors.primary },
      text: { color: colors['primary-foreground'] },
    },
    secondary: {
      container: { backgroundColor: colors.secondary },
      text: { color: colors['secondary-foreground'] },
    },
    destructive: {
      container: { backgroundColor: colors.destructive },
      text: { color: colors['destructive-foreground'] },
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors['border-input'],
      },
      text: { color: colors.foreground },
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: colors.foreground },
    },
  };

  // ── Size styles ──
  const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
    sm: {
      container: { paddingVertical: sp('1.5'), paddingHorizontal: sp('3'), borderRadius: nativeRadius.md },
      text: { fontSize: nativeFontSize.sm },
    },
    md: {
      container: { paddingVertical: sp('2'), paddingHorizontal: sp('4'), borderRadius: nativeRadius.md },
      text: { fontSize: nativeFontSize.base },
    },
    lg: {
      container: { paddingVertical: sp('3'), paddingHorizontal: sp('6'), borderRadius: nativeRadius.lg },
      text: { fontSize: nativeFontSize.lg },
    },
  };

  const vStyles = variantStyles[variant];
  const sStyles = sizeStyles[size];
  const spinnerColor = vStyles.text.color as string;

  const defaultLabel = typeof children === 'string' ? children : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={defaultLabel}
      {...pressableProps}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        vStyles.container,
        sStyles.container,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : typeof children === 'string' ? (
        <Text
          style={[
            styles.text,
            vStyles.text,
            sStyles.text,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
