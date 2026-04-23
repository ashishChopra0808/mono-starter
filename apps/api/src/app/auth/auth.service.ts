import type { AuthSession, AuthUser } from '@mono/auth';
import type { User } from '@mono/db';
import { eq, getDb, sessions, users } from '@mono/db';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

import { TokenService } from './token.service';

/** bcrypt cost factor — 10 rounds is ~100ms on modern hardware. */
const SALT_ROUNDS = 10;

/**
 * Maps a database user row to the public-facing AuthUser shape.
 * Strips sensitive fields (passwordHash) and narrows the role type.
 */
function toAuthUser(user: Pick<User, 'id' | 'email' | 'name' | 'role'>): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as AuthUser['role'],
  };
}

/** Columns to select when we only need the public profile (no passwordHash). */
const USER_PROFILE_COLUMNS = {
  id: users.id,
  email: users.email,
  name: users.name,
  role: users.role,
} as const;

@Injectable()
export class AuthService {
  private readonly db = getDb();

  constructor(private readonly tokenService: TokenService) {}

  /**
   * Authenticate a user with email and password.
   * Creates a new session and returns tokens.
   */
  async signIn(email: string, password: string): Promise<AuthSession> {
    // 1. Find user — need passwordHash for verification
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Verify password
    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Create session
    return this.createSession(user);
  }

  /**
   * Rotate a refresh token — issues new access + refresh tokens.
   * The old refresh token is deleted (one-time use).
   *
   * Wrapped in a transaction to prevent race conditions where two
   * concurrent refresh calls with the same token both succeed.
   */
  async refresh(refreshToken: string): Promise<AuthSession> {
    return this.db.transaction(async (tx) => {
      // 1. Find session
      const [session] = await tx
        .select()
        .from(sessions)
        .where(eq(sessions.refreshToken, refreshToken));

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // 2. Check expiry
      if (session.expiresAt < new Date()) {
        // Clean up expired session
        await tx.delete(sessions).where(eq(sessions.id, session.id));
        throw new UnauthorizedException('Refresh token expired');
      }

      // 3. Delete old session (token rotation)
      await tx.delete(sessions).where(eq(sessions.id, session.id));

      // 4. Find user
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, session.userId));

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // 5. Create new session (within the same transaction)
      const accessToken = this.tokenService.createAccessToken(
        user.id,
        user.role as AuthUser['role'],
      );
      const newRefreshToken = this.tokenService.createRefreshToken();
      const expiresAt = this.tokenService.getRefreshTokenExpiry();

      await tx.insert(sessions).values({
        userId: user.id,
        refreshToken: newRefreshToken,
        expiresAt,
      });

      return {
        user: toAuthUser(user),
        accessToken,
        refreshToken: newRefreshToken,
        expiresAt: expiresAt.toISOString(),
      };
    });
  }

  /**
   * Sign out — delete the session by refresh token.
   *
   * Intentionally idempotent: if the token doesn't exist (already signed out,
   * or invalid), we still return success. This avoids leaking information
   * about token validity and makes retry-safe sign-out flows simple.
   */
  async signOut(refreshToken: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.refreshToken, refreshToken));
  }

  /**
   * Get the current user profile.
   *
   * Uses explicit column selection to avoid fetching passwordHash.
   */
  async me(userId: string): Promise<AuthUser> {
    const [user] = await this.db
      .select(USER_PROFILE_COLUMNS)
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return toAuthUser(user);
  }

  /**
   * Hash a password (exposed for seeding and registration).
   */
  async hashPassword(password: string): Promise<string> {
    return hash(password, SALT_ROUNDS);
  }

  // ─── Private ────────────────────────────────────────────────────────────

  private async createSession(
    user: User,
  ): Promise<AuthSession> {
    const accessToken = this.tokenService.createAccessToken(
      user.id,
      user.role as AuthUser['role'],
    );
    const refreshToken = this.tokenService.createRefreshToken();
    const expiresAt = this.tokenService.getRefreshTokenExpiry();

    await this.db.insert(sessions).values({
      userId: user.id,
      refreshToken,
      expiresAt,
    });

    return {
      user: toAuthUser(user),
      accessToken,
      refreshToken,
      expiresAt: expiresAt.toISOString(),
    };
  }
}
