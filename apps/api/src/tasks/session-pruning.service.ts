import type { Database } from '@mono/db';
import { lt, sessions, sql } from '@mono/db';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { DATABASE } from '../database';

/**
 * Periodically removes expired sessions from the database.
 *
 * Runs every 6 hours. Without this, the sessions table grows
 * indefinitely with stale refresh tokens.
 */
@Injectable()
export class SessionPruningService {
  private readonly logger = new Logger(SessionPruningService.name);

  constructor(@Inject(DATABASE) private readonly db: Database) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async pruneExpiredSessions(): Promise<void> {
    const result = await this.db
      .delete(sessions)
      .where(lt(sessions.expiresAt, sql`NOW()`))
      .returning({ id: sessions.id });

    if (result.length > 0) {
      this.logger.log(`Pruned ${result.length} expired session(s)`);
    }
  }
}
