import { AuthUser, TokenPayload } from '@mono/auth';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { TokenService } from '../../app/auth/token.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Global authentication guard.
 *
 * - Extracts JWT from `Authorization: Bearer <token>` header
 * - Verifies and decodes the token
 * - Attaches `AuthUser` to `request.user`
 * - Skips routes decorated with `@Public()`
 *
 * Register globally in AppModule:
 * ```ts
 * { provide: APP_GUARD, useClass: JwtAuthGuard }
 * ```
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    let payload: TokenPayload;
    try {
      payload = this.tokenService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach user info from the token to the request.
    // Note: email and name are NOT in the JWT (to keep it small).
    // Downstream code that needs the full profile should call AuthService.me().
    // The @CurrentUser() decorator provides id and role — sufficient for
    // authorization decisions and DB lookups.
    const user: AuthUser = {
      id: payload.sub,
      email: '', // Not in token — use AuthService.me() for full profile
      name: null,
      role: payload.role,
    };
    request.user = user;

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
