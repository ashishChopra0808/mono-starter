import {
  ApiError,
  categorizeError,
  type ErrorCategory,
  getUserMessage,
  type UserMessageOptions,
} from '@mono/api-client';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { nativeFontSize, nativeRadius, sp } from '../tokens/native-tokens';

// ─── ErrorBanner (mobile) ────────────────────────────────────────────────────
// Same prop shape as `@mono/ui-web`'s ErrorBanner so consumers can mentally
// reuse the API across platforms. RN primitives only.

export interface ErrorBannerProps extends UserMessageOptions {
  error?: ApiError | null;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  categoryTitles?: Partial<Record<ErrorCategory, string>>;
  showRequestId?: boolean;
}

const DEFAULT_TITLE_BY_CATEGORY: Record<ErrorCategory, string> = {
  auth: 'Sign in required',
  permission: 'Not permitted',
  'not-found': 'Not found',
  validation: 'Please review the form',
  'rate-limit': 'Too many requests',
  conflict: 'Conflict',
  network: 'Connection issue',
  'response-validation': 'Unexpected response',
  unexpected: 'Something went wrong',
};

export function ErrorBanner({
  error,
  title,
  onRetry,
  retryLabel = 'Retry',
  categoryTitles,
  showRequestId,
  codeMessages,
  categoryMessages,
}: ErrorBannerProps) {
  const { colors } = useTheme();

  if (!error) return null;

  const category = categorizeError(error);
  const headline =
    title ??
    categoryTitles?.[category] ??
    DEFAULT_TITLE_BY_CATEGORY[category];
  const message = getUserMessage(error, { codeMessages, categoryMessages });
  const renderRequestId =
    showRequestId ??
    (category === 'unexpected' ||
      category === 'response-validation' ||
      category === 'network');

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.container,
        {
          borderColor: colors.destructive,
          backgroundColor: colors.destructive + '14', // ~8% alpha
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.destructive }]}>{headline}</Text>
      <Text style={[styles.message, { color: colors['foreground-muted'] }]}>
        {message}
      </Text>
      {renderRequestId && error.requestId && (
        <Text
          style={[styles.requestId, { color: colors['foreground-muted'] }]}
        >
          x-request-id: {error.requestId}
        </Text>
      )}
      {onRetry && (
        <Pressable onPress={onRetry} style={styles.retry}>
          <Text style={[styles.retryText, { color: colors.destructive }]}>
            {retryLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: nativeRadius.md,
    padding: sp('3'),
    gap: sp('1'),
  },
  title: {
    fontSize: nativeFontSize.sm,
    fontWeight: '600',
  },
  message: {
    fontSize: nativeFontSize.sm,
  },
  requestId: {
    fontSize: nativeFontSize.xs,
    fontFamily: 'monospace',
    marginTop: sp('1'),
  },
  retry: {
    marginTop: sp('2'),
    alignSelf: 'flex-start',
  },
  retryText: {
    fontSize: nativeFontSize.xs,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
