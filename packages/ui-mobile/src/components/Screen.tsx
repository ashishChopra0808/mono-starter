import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { sp } from '../tokens/native-tokens';

// ─── Screen ─────────────────────────────────────────────────────────────────
// A full-screen container with safe-area awareness, optional scrolling,
// keyboard avoidance, and theme-aware background.
//
// Usage:
//   <Screen scrollable padded>
//     <Text>Content goes here</Text>
//   </Screen>

export interface ScreenProps {
  children: React.ReactNode;
  /** Wrap content in a ScrollView. @default true */
  scrollable?: boolean;
  /** Apply horizontal + bottom padding. @default true */
  padded?: boolean;
  /** StatusBar style. @default 'auto' (derived from theme) */
  statusBarStyle?: 'light' | 'dark' | 'auto';
  /** Additional style for the inner content container. */
  contentStyle?: ViewStyle;
  /** Additional style for the outer wrapper. */
  style?: ViewStyle;
}

export function Screen({
  children,
  scrollable = true,
  padded = true,
  statusBarStyle = 'auto',
  contentStyle,
  style,
}: ScreenProps) {
  const { colors, isDark } = useTheme();

  const resolvedBarStyle =
    statusBarStyle === 'auto'
      ? isDark
        ? 'light-content'
        : 'dark-content'
      : statusBarStyle === 'light'
        ? 'light-content'
        : 'dark-content';

  const paddingStyle: ViewStyle = padded
    ? { paddingHorizontal: sp('4'), paddingBottom: sp('6') }
    : {};

  const inner = (
    <View style={[paddingStyle, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }, style]}>
      <StatusBar barStyle={resolvedBarStyle} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {scrollable ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {inner}
          </ScrollView>
        ) : (
          inner
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
