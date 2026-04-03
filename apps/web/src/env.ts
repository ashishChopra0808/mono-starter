/**
 * Re-export the validated web environment for convenient in-app usage.
 *
 * @example
 * ```ts
 * import { env } from '../env';
 * console.log(env.NEXT_PUBLIC_API_URL);
 * ```
 */
export { webEnv as env } from '@mono/env/web';
