import { createApiClient } from '@mono/api-client';
import { createBrowserLogger } from '@mono/logger';

const logger = createBrowserLogger({ prefix: 'admin:api' });

const baseUrl =
  process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000/api/v1';

export const apiClient = createApiClient({
  baseUrl,
  getAccessToken: () => {
    if (typeof window === 'undefined') return undefined;
    return window.localStorage.getItem('access_token') ?? undefined;
  },
  onUnauthorized: () => {
    logger.warn({}, 'api 401 — token cleared');
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('access_token');
    }
  },
  logger,
});
