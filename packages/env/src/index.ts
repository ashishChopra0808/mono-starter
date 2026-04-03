// ─── @mono/env ──────────────────────────────────────────────────────────────
// Type-safe, validated environment variables for the monorepo.
//
// Usage (recommended):
//   import { webEnv }    from '@mono/env/web';
//   import { adminEnv }  from '@mono/env/admin';
//   import { apiEnv }    from '@mono/env/api';
//   import { mobileEnv } from '@mono/env/mobile';
//
// You can also import everything from the barrel:
//   import { webEnv, apiEnv, ... } from '@mono/env';

export * from './shared.js';
export { sharedServerSchemas } from './server.js';
export { webEnv } from './web.js';
export { adminEnv } from './admin.js';
export { apiEnv } from './api.js';
export { mobileEnv } from './mobile.js';
