import { randomBytes } from 'node:crypto';

import { Role, TokenPayload } from '@mono/auth';
import { apiEnv } from '@mono/env/api';
import { Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';

/** Access token lifetime in seconds (15 minutes). */
const ACCESS_TOKEN_TTL = 15 * 60;

/** Refresh token lifetime in milliseconds (7 days). */
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class TokenService {
  private readonly secret = apiEnv.JWT_SECRET;

  /**
   * Creates a short-lived JWT access token.
   */
  createAccessToken(userId: string, role: Role): string {
    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
      sub: userId,
      role,
    };

    return sign(payload, this.secret, { expiresIn: ACCESS_TOKEN_TTL });
  }

  /**
   * Creates an opaque refresh token (random hex string).
   * Stored in the database `sessions` table.
   */
  createRefreshToken(): string {
    return randomBytes(40).toString('hex');
  }

  /**
   * Verifies and decodes a JWT access token.
   * @throws if the token is invalid or expired.
   */
  verifyAccessToken(token: string): TokenPayload {
    return verify(token, this.secret) as TokenPayload;
  }

  /**
   * Returns the expiration date for a new refresh token.
   */
  getRefreshTokenExpiry(): Date {
    return new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  }
}
