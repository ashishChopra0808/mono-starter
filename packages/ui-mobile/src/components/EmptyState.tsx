import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { nativeFontSize, sp } from '../tokens/native-tokens';
import { Button } from './Button';

// ─── EmptyState ─────────────────────────────────────────────────────────────
// A centered placeholder for empty lists or zero-result screens.
// Supports an optional icon, description, and call-to-action button.
//
// Usage:
//   <EmptyState
//     title="No bookings yet"
//     description="Your upcoming trips will appear here."
//     action={{ label: 'Explore', onPress: () => navigate('explore') }}
//   />

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

export interface EmptyStateProps {
  /** Optional icon element rendered above the title. */
  icon?: React.ReactNode;
  /** Primary message. */
  title: string;
  /** Secondary explanation text. */
  description?: string;
  /** Optional call-to-action button. */
  action?: EmptyStateAction;
  /** Additional style overrides for the container. */
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  style,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="summary"
      accessibilityLabel={description ? `${title}. ${description}` : title}
    >
      {icon && <View style={styles.iconWrapper}>{icon}</View>}

      <Text style={[styles.title, { color: colors.foreground }]}>
        {title}
      </Text>

      {description && (
        <Text style={[styles.description, { color: colors['foreground-muted'] }]}>
          {description}
        </Text>
      )}

      {action && (
        <View style={styles.actionWrapper}>
          <Button variant="primary" size="md" onPress={action.onPress}>
            {action.label}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: sp('8'),
    gap: sp('2'),
  },
  iconWrapper: {
    marginBottom: sp('2'),
  },
  title: {
    fontSize: nativeFontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: nativeFontSize.sm,
    textAlign: 'center',
    lineHeight: nativeFontSize.sm * 1.5,
  },
  actionWrapper: {
    marginTop: sp('4'),
  },
});
