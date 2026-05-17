// Workspace vitest config. We don't import from `vitest/config` because vitest
// isn't a root-level dependency — it lives in the packages that actually have
// tests. Plain object export works just as well for our needs.
//
// The `mono-starter` resolve condition matches `customConditions` in
// `tsconfig.base.json` so vitest resolves workspace packages to `./src/*.ts`
// (the canonical source) rather than `./dist/*.js` (which may be stale).
export default {
  resolve: {
    conditions: ['mono-starter', 'import', 'module', 'default'],
  },
  test: {
    // Default `**/*.{test,spec}.?(c|m)[jt]s?(x)` but excluding build outputs and
    // nx cache copies so we don't double-discover tests from `dist/` snapshots.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.nx/**',
      '**/build/**',
      // e2e apps run via Playwright, not vitest.
      'apps/*-e2e/**',
      // Live DB smoke test — runs in CI with a postgres service, skipped locally.
      'packages/db/src/__tests__/**',
    ],
  },
};
