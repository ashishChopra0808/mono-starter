import { closeDb, type Database, getDb } from '@mono/db';
import { Global, Module, OnApplicationShutdown } from '@nestjs/common';

import { DATABASE } from './database.constants';

export { DATABASE } from './database.constants';
export type { Database } from '@mono/db';

/**
 * Global database module.
 *
 * Provides the Drizzle database client via NestJS dependency injection.
 * Handles graceful shutdown of the connection pool when the app stops.
 *
 * Usage in any module:
 * ```ts
 * constructor(@Inject(DATABASE) private readonly db: Database) {}
 * ```
 *
 * Because this module is `@Global()`, it does not need to be imported
 * into every feature module — only into `AppModule`.
 */
@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: (): Database => getDb(),
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule implements OnApplicationShutdown {
  async onApplicationShutdown(signal?: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[DatabaseModule] Shutting down database (signal: ${signal ?? 'none'})…`);
    await closeDb();
  }
}
