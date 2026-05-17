// ─── Request correlation ─────────────────────────────────────────────────────
// Generates a per-request id that the client sends as `x-request-id`. The API
// is expected to echo or use this id in its structured logs so a single
// request can be traced across app + server.

/**
 * Generate a unique id for a single request.
 *
 * Prefers `crypto.randomUUID()` (modern browsers, Node ≥19, Hermes). Falls
 * back to a `Math.random`-based id for older runtimes — collisions are
 * acceptable since this is for log correlation, not security.
 */
export function generateRequestId(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (g.crypto?.randomUUID) {
    return g.crypto.randomUUID();
  }
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
