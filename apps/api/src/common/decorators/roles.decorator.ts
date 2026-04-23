import { Role } from '@mono/auth';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Declares the minimum role required to access a route.
 *
 * Uses role hierarchy: admin > editor > user.
 * A user with a higher role can access routes requiring a lower role.
 *
 * @example
 * ```ts
 * @Roles(Role.ADMIN)
 * @Get('users')
 * listUsers(): Promise<User[]> { ... }
 * ```
 */
export const Roles = (...roles: Role[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles);
