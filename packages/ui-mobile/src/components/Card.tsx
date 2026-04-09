import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { nativeRadius, sp } from '../tokens/native-tokens';

// ─── Card ───────────────────────────────────────────────────────────────────
// A themed surface container with elevation, outline, or filled variants.
// Optionally pressable when `onPress` is provided.
//
// Usage:
//   <Card variant="elevated" onPress={() => navigate('details')}>
//     <Text>Card content</Text>
//   </Card>

export type CardVariant = 'elevated' | 'outlined' | 'filled';

export interface CardProps {
  children: React.ReactNode;
  /** Visual variant. @default 'elevated' */
  variant?: CardVariant;
  /** Makes the card pressable with opacity feedback. */
  onPress?: () => void;
  /** Accessibility label announced by screen readers. */
  accessibilityLabel?: string;
  /** Additional style overrides. */
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'elevated',
  onPress,
  accessibilityLabel,
  style,
}: CardProps) {
  const { colors } = useTheme();

  const variantStyles: Record<CardVariant, ViewStyle> = {
    elevated: {
      backgroundColor: colors['background-secondary'],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    outlined: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filled: {
      backgroundColor: colors['background-secondary'],
    },
  };

  const content = (
    <View
      style={[styles.card, variantStyles[variant], style]}
      accessibilityLabel={onPress ? undefined : accessibilityLabel}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: nativeRadius.lg,
    padding: sp('4'),
  },
  pressed: {
    opacity: 0.9,
  },
});
