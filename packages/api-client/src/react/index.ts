// ─── React hooks for @mono/api-client ────────────────────────────────────────
// Imported via `@mono/api-client/react`. Keeping hooks behind a subpath export
// means the core package stays usable from non-React contexts (Node scripts,
// workers, server actions) without pulling React into the import graph.

export {
  useCurrentUserProfile,
  type UseCurrentUserProfileOptions,
  type UseCurrentUserProfileState,
} from './use-current-user-profile.js';
