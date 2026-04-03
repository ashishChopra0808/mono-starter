/**
 * Re-export the validated admin environment for convenient in-app usage.
 *
 * @example
 * ```ts
 * import { env } from '../env';
 * console.log(env.NEXT_PUBLIC_ADMIN_ROLE);
 * ```
 */
export { adminEnv as env } from '@mono/env/admin';
