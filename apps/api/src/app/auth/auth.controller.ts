import type { AuthSession, AuthUser } from '@mono/auth';
import type { UserProfile } from '@mono/validation';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../validation/zod-validation.pipe';
import {
  type RefreshDto,
  type SignInDto,
  refreshSchema,
  signInSchema,
} from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/sign-in
   *
   * Authenticate with email + password. Returns access and refresh tokens.
   */
  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body(new ZodValidationPipe(signInSchema)) body: SignInDto,
  ): Promise<{ data: AuthSession }> {
    const session = await this.authService.signIn(body.email, body.password);
    return { data: session };
  }

  /**
   * POST /auth/refresh
   *
   * Exchange a refresh token for new access + refresh tokens.
   * The old refresh token is invalidated (rotation).
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body(new ZodValidationPipe(refreshSchema)) body: RefreshDto,
  ): Promise<{ data: AuthSession }> {
    const session = await this.authService.refresh(body.refreshToken);
    return { data: session };
  }

  /**
   * POST /auth/sign-out
   *
   * Invalidate a refresh token (delete the session).
   * Requires authentication — the caller must provide a valid access token.
   */
  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(
    @Body(new ZodValidationPipe(refreshSchema)) body: RefreshDto,
  ): Promise<void> {
    await this.authService.signOut(body.refreshToken);
  }

  /**
   * GET /auth/me
   *
   * Returns the currently authenticated user's enriched profile.
   * Includes computed permissions and account creation timestamp.
   * Requires a valid access token.
   */
  @Get('me')
  async me(@CurrentUser() user: AuthUser): Promise<{ data: UserProfile }> {
    const profile = await this.authService.me(user.id);
    return { data: profile };
  }
}
