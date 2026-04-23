import type { AuthUser } from '@mono/auth';
import { Role } from '@mono/auth';
import { getDb, users } from '@mono/db';
import { Controller, Get } from '@nestjs/common';

import { Roles } from '../../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  private readonly db = getDb();

  /**
   * GET /users
   *
   * List all users. Requires admin role.
   * Returns user profiles WITHOUT sensitive data (passwordHash).
   */
  @Roles(Role.ADMIN)
  @Get()
  async list(): Promise<{
    data: AuthUser[];
  }> {
    const rows = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      })
      .from(users);

    return {
      data: rows.map((r) => ({
        ...r,
        role: r.role as AuthUser['role'],
      })),
    };
  }
}
