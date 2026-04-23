/**
 * Injection token for the Drizzle database client.
 *
 * Usage:
 * ```ts
 * constructor(@Inject(DATABASE) private readonly db: Database) {}
 * ```
 */
export const DATABASE = Symbol('DATABASE');
