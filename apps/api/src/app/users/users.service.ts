import type { AuthUser } from '@mono/auth';
import type { Database } from '@mono/db';
import { users } from '@mono/db';
import { Inject, Injectable } from '@nestjs/common';

import { DATABASE } from '../../database';

/** Columns to select — excludes passwordHash. */
const USER_PROFILE_COLUMNS = {
  id: users.id,
  email: users.email,
  name: users.name,
  role: users.role,
} as const;

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  /**
   * List all users. Returns user profiles WITHOUT sensitive data.
   */
  async list(): Promise<AuthUser[]> {
    const rows = await this.db.select(USER_PROFILE_COLUMNS).from(users);

    return rows.map((r) => ({
      ...r,
      role: r.role as AuthUser['role'],
    }));
  }
}
