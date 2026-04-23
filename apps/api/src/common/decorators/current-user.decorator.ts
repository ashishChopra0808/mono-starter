import { AuthUser } from '@mono/auth';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Parameter decorator that extracts the authenticated user from the request.
 *
 * Must be used on routes protected by JwtAuthGuard (i.e., NOT @Public()).
 *
 * @example
 * ```ts
 * @Get('me')
 * getMe(@CurrentUser() user: AuthUser): AuthUser {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as AuthUser;
  },
);
