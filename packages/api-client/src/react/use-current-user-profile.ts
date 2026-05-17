import type { UserProfile } from '@mono/validation';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ApiClient } from '../client.js';
import { ApiError } from '../errors.js';
import { getCurrentUserProfile } from '../services/me.service.js';

export interface UseCurrentUserProfileState {
  data: UserProfile | null;
  error: ApiError | null;
  loading: boolean;
  refetch: () => void;
}

export interface UseCurrentUserProfileOptions {
  /**
   * If `false`, the hook will not fetch on mount — callers must invoke
   * `refetch` manually. Useful for opt-in fetches (e.g. behind a button).
   * Defaults to `true`.
   */
  enabled?: boolean;
}

/**
 * Loads the current user's profile from `/auth/me`.
 *
 * Lifecycle:
 * - Fetches on mount (unless `enabled: false`).
 * - Re-fetches when `client` identity changes; in-flight requests against the
 *   previous `client` are aborted so they cannot overwrite state with stale data.
 * - Ignores results that arrive after the component unmounts.
 *
 * Returns a stable `refetch` that consumers can wire to buttons or events.
 * This hook deliberately does NOT implement caching or dedup — wrap it with
 * React Query / SWR at the app level if those are needed.
 */
export function useCurrentUserProfile(
  client: ApiClient,
  options: UseCurrentUserProfileOptions = {},
): UseCurrentUserProfileState {
  const enabled = options.enabled ?? true;
  const [data, setData] = useState<UserProfile | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // A monotonically increasing request id lets us discard responses from
  // calls that were superseded by a newer `refetch()` or a `client` change.
  // The latest issued id is the only one allowed to update state.
  const latestRequestRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchProfile = useCallback(
    async (currentClient: ApiClient) => {
      // Abort any in-flight request and claim a fresh slot.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const myRequestId = ++latestRequestRef.current;

      setLoading(true);
      setError(null);
      try {
        const profile = await getCurrentUserProfile(currentClient);
        if (latestRequestRef.current === myRequestId) {
          setData(profile);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        if (latestRequestRef.current !== myRequestId) return;
        if (err instanceof ApiError) {
          setError(err);
        } else {
          setError(
            new ApiError({
              kind: 'http',
              status: 0,
              code: 'UNKNOWN_ERROR',
              message: err instanceof Error ? err.message : 'Unknown error',
            }),
          );
        }
      } finally {
        if (latestRequestRef.current === myRequestId) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!enabled) return;
    void fetchProfile(client);
    return () => {
      // On unmount or before re-running with a new `client`, supersede the
      // in-flight request so it can't update state.
      latestRequestRef.current += 1;
      abortRef.current?.abort();
    };
  }, [enabled, client, fetchProfile]);

  const refetch = useCallback(() => {
    void fetchProfile(client);
  }, [client, fetchProfile]);

  return { data, error, loading, refetch };
}
