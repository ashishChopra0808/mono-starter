import type { ErrorCode } from '@mono/api-contracts';
import { HTTP_STATUS_BY_CODE } from '@mono/api-contracts';
import { HttpException } from '@nestjs/common';

/**
 * The opt-in channel for "this error message is safe to show users."
 *
 * The global exception filter recognizes `BusinessException` and forwards its
 * `code` and `message` verbatim to the client (even in production). Anything
 * else — `new Error(...)`, framework exceptions with internal messages, etc. —
 * gets its message scrubbed in production.
 *
 * Usage:
 *   throw new BusinessException({
 *     code: 'PROFILE_NOT_FOUND',
 *     message: 'No profile exists for that user.',
 *   });
 *
 * @see docs/ERROR-HANDLING.md
 */
export class BusinessException extends HttpException {
  readonly code: string;
  readonly details: unknown;
  readonly userSafeMessage = true as const;

  constructor(args: {
    code: ErrorCode | string;
    message: string;
    /** Optional HTTP status override. Defaults to `HTTP_STATUS_BY_CODE[code]` or 400. */
    status?: number;
    /** Structured context for clients (e.g. validation field list). */
    details?: unknown;
  }) {
    const status =
      args.status ?? HTTP_STATUS_BY_CODE[args.code as ErrorCode] ?? 400;
    super(
      { error: { code: args.code, message: args.message, details: args.details } },
      status,
    );
    this.code = args.code;
    this.details = args.details;
  }
}
