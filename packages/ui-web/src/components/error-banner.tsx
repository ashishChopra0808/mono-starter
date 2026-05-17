import {
  ApiError,
  type ErrorCategory,
  categorizeError,
  getUserMessage,
  type UserMessageOptions,
} from '@mono/api-client';

import { cn } from '../lib/utils';

// ─── ErrorBanner ─────────────────────────────────────────────────────────────
// Reusable banner for surfacing API + network errors at the page or section
// level. Pairs with `<TextField error={...} />` for inline form errors; this
// component is intentionally NOT a form-field display.

export interface ErrorBannerProps extends UserMessageOptions {
  /** The error to display, or `null`/`undefined` to render nothing. */
  error?: ApiError | null;
  /** Optional title; if omitted, derived from the error category. */
  title?: string;
  /** Show a retry action with this label. */
  onRetry?: () => void;
  /** Label for the retry button. Defaults to `'Retry'` if not supplied. */
  retryLabel?: string;
  /**
   * Per-category title overrides. Apps wired to i18n typically pass translated
   * strings here so the banner respects the active locale.
   */
  categoryTitles?: Partial<Record<ErrorCategory, string>>;
  /** className passthrough for layout. */
  className?: string;
  /**
   * If true, also displays the request id (small, monospace). Defaults to
   * `true` for `unexpected`/`response-validation` categories where users need
   * a reference for support tickets, `false` otherwise.
   */
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
  className,
  showRequestId,
  codeMessages,
  categoryMessages,
}: ErrorBannerProps) {
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
    <div
      role="alert"
      className={cn(
        'rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm',
        className,
      )}
    >
      <div className="font-semibold text-destructive">{headline}</div>
      <div className="text-foreground-muted">{message}</div>
      {renderRequestId && error.requestId && (
        <div className="mt-1 text-xs font-mono text-foreground-muted">
          x-request-id: {error.requestId}
        </div>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-xs font-medium text-destructive underline-offset-2 hover:underline"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
