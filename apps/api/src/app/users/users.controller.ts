import type { AuthUser } from '@mono/auth';
import { Role } from '@mono/auth';
import { Controller, Get } from '@nestjs/common';

import { Roles } from '../../common/decorators/roles.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   *
   * List all users. Requires admin role.
   * Returns user profiles WITHOUT sensitive data (passwordHash).
   */
  @Roles(Role.ADMIN)
  @Get()
  async list(): Promise<{ data: AuthUser[] }> {
    const data = await this.usersService.list();
    return { data };
  }
}
