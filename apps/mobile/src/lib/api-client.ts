import { createApiClient } from '@mono/api-client';
import { createBrowserLogger } from '@mono/logger';

const logger = createBrowserLogger({ prefix: 'mobile:api' });

const baseUrl =
  process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3000/api/v1';

// In a real mobile app this would read from expo-secure-store. For now the
// app doesn't have a real sign-in flow, so this returns undefined and any
// request to /auth/me will surface a clean UnauthorizedError.
function getAccessToken(): string | undefined {
  return undefined;
}

export const apiClient = createApiClient({
  baseUrl,
  getAccessToken,
  onUnauthorized: () => {
    logger.warn({}, 'api 401');
  },
  logger,
});
