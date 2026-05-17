import type { ErrorCode, ValidationErrorDetail } from '@mono/api-contracts';
import { CODE_BY_HTTP_STATUS } from '@mono/api-contracts';
import type { Logger } from '@mono/logger/node';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';

import { ROOT_LOGGER } from '../../logging';
import { BusinessException } from '../exceptions/business.exception';

/** Generic message used for unexpected errors in production. */
const PRODUCTION_GENERIC_MESSAGE = 'Internal server error';

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
    /** Only set in non-production environments. */
    stack?: string;
  };
}

/**
 * Catches every exception escaping a controller, normalizes it into the
 * shared `{ error: { code, message, details?, requestId } }` shape, sets the
 * right HTTP status, and logs at a severity that matches the error category.
 *
 * Taxonomy:
 *   - `BusinessException` → user-safe message, preserved verbatim, `warn`.
 *   - `ZodError`         → 422 + dotted-path validation details, `info`.
 *   - `HttpException`    → mapped to a known code, `warn`. Messages in 4xx
 *                          framework exceptions are preserved (they come from
 *                          NestJS / known guards); 5xx messages are scrubbed
 *                          in production.
 *   - Anything else      → 500 `INTERNAL_ERROR`, full stack logged, message
 *                          scrubbed to a generic string in production.
 *
 * See `docs/ERROR-HANDLING.md` for the operator-facing version.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@Inject(ROOT_LOGGER) private readonly logger: Logger) {}

  // NODE_ENV is read on every request so tests can flip it; in long-lived
  // server processes this is a single string compare, cost is negligible.
  private get isProduction(): boolean {
    return process.env['NODE_ENV'] === 'production';
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const requestId = req.correlationId;
    const child = this.logger.child({ requestId });

    const { status, body, severity } = this.mapException(exception, this.isProduction);

    // Always set requestId on a fresh copy so we don't mutate an exception's
    // own body (matters if the same exception is logged twice or re-thrown).
    body.error = { ...body.error, requestId };

    const logFields = {
      status,
      method: req.method,
      url: req.url,
      code: body.error.code,
      userId: req.user?.id,
    };

    if (severity === 'error') {
      child.error(
        { ...logFields, err: exception },
        body.error.message,
      );
    } else if (severity === 'warn') {
      child.warn(logFields, body.error.message);
    } else {
      child.info(logFields, body.error.message);
    }

    res.status(status).json(body);
  }

  // ─── Mapping ────────────────────────────────────────────────────────────

  private mapException(
    exception: unknown,
    isProd: boolean,
  ): { status: number; body: ErrorResponseBody; severity: 'info' | 'warn' | 'error' } {
    // 1. BusinessException — user-safe by construction, preserve verbatim.
    if (exception instanceof BusinessException) {
      const status = exception.getStatus();
      const original = exception.getResponse() as ErrorResponseBody;
      return {
        status,
        // Shallow clone so the filter doesn't mutate the exception's own body
        // (matters if the exception is logged twice or re-thrown by middleware).
        body: { error: { ...original.error } },
        severity:
          status >= 500
            ? 'error'
            : status === HttpStatus.UNPROCESSABLE_ENTITY
              ? 'info'
              : 'warn',
      };
    }

    // 2. ZodError thrown outside the pipe (rare; pipes throw BusinessException).
    if (exception instanceof ZodError) {
      return {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        body: {
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Request validation failed',
            details: zodIssuesToDetails(exception),
          },
        },
        severity: 'info',
      };
    }

    // 3. NestJS HttpException — known framework / guard / pipe throws.
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const code = statusToCode(status);

      // The shape already conforms (e.g. legacy ZodValidationPipe before this
      // PR). Pass it through but ensure `code` is set and matches the new
      // taxonomy.
      if (
        typeof body === 'object' &&
        body !== null &&
        'error' in body &&
        typeof (body as { error: unknown }).error === 'object'
      ) {
        const errObj = (body as ErrorResponseBody).error;
        return {
          status,
          body: {
            error: {
              code: errObj.code ?? code,
              message: errObj.message ?? exception.message,
              details: errObj.details,
            },
          },
          severity: status >= 500 ? 'error' : status === 422 ? 'info' : 'warn',
        };
      }

      const message =
        typeof body === 'object' && body !== null && 'message' in body
          ? String((body as { message: unknown }).message)
          : exception.message;

      // 5xx with a developer-supplied message: scrub in production.
      const safeMessage =
        status >= 500 && isProd ? PRODUCTION_GENERIC_MESSAGE : message;

      return {
        status,
        body: { error: { code, message: safeMessage } },
        severity: status >= 500 ? 'error' : 'warn',
      };
    }

    // 4. Anything else — treat as unexpected.
    const stack = exception instanceof Error ? exception.stack : undefined;
    const devMessage =
      exception instanceof Error ? exception.message : 'Unknown error';
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        error: {
          code: 'INTERNAL_ERROR',
          message: isProd ? PRODUCTION_GENERIC_MESSAGE : devMessage,
          ...(isProd ? {} : { stack }),
        },
      },
      severity: 'error',
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusToCode(status: number): ErrorCode | string {
  return CODE_BY_HTTP_STATUS[status] ?? `HTTP_${status}`;
}

export function zodIssuesToDetails(error: ZodError): ValidationErrorDetail[] {
  return error.issues.map((issue) => ({
    path: issue.path.length === 0 ? '(root)' : issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}
