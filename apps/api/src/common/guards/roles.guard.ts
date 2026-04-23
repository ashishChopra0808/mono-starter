import { AuthUser, hasRole, Role } from '@mono/auth';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Authorization guard — checks if the authenticated user's role
 * meets the requirement declared by `@Roles()`.
 *
 * Uses role hierarchy: admin > editor > user.
 * If no `@Roles()` decorator is present, the route is accessible
 * to any authenticated user.
 *
 * Must be registered AFTER JwtAuthGuard (so `request.user` exists).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() decorator → any authenticated user can access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthUser | undefined;

    if (!user) {
      throw new ForbiddenException('No authenticated user');
    }

    // User must satisfy at least one of the required roles (via hierarchy)
    const authorized = requiredRoles.some((role) => hasRole(user.role, role));

    if (!authorized) {
      throw new ForbiddenException(
        `Role '${user.role}' does not have access. Required: ${requiredRoles.join(' or ')}`,
      );
    }

    return true;
  }
}
