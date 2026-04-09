import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { nativeFontSize, sp } from '../tokens/native-tokens';

// ─── LoadingState ───────────────────────────────────────────────────────────
// A centered loading indicator with an optional message.
// Use as a full-screen replacement or inline within a container.
//
// Usage:
//   <LoadingState />
//   <LoadingState message="Fetching bookings…" size="lg" />

export interface LoadingStateProps {
  /** Optional message displayed below the spinner. */
  message?: string;
  /** Spinner size. @default 'lg' */
  size?: 'sm' | 'lg';
  /** Additional style overrides for the container. */
  style?: ViewStyle;
}

export function LoadingState({
  message,
  size = 'lg',
  style,
}: LoadingStateProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={message ?? 'Loading'}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator
        size={size === 'lg' ? 'large' : 'small'}
        color={colors.primary}
      />
      {message && (
        <Text style={[styles.message, { color: colors['foreground-muted'] }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: sp('6'),
    gap: sp('3'),
  },
  message: {
    fontSize: nativeFontSize.sm,
    textAlign: 'center',
  },
});
