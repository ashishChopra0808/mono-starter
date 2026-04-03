/**
 * Re-export the validated mobile environment for convenient in-app usage.
 *
 * @example
 * ```ts
 * import { env } from '../env';
 * console.log(env.EXPO_PUBLIC_API_URL);
 * ```
 */
export { mobileEnv as env } from '@mono/env/mobile';
