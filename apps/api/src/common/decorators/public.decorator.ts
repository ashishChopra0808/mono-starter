import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as publicly accessible — skips the JwtAuthGuard.
 *
 * @example
 * ```ts
 * @Public()
 * @Get('health')
 * healthCheck(): HealthResponse { ... }
 * ```
 */
export const Public = (): ReturnType<typeof SetMetadata> => SetMetadata(IS_PUBLIC_KEY, true);
