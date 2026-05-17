import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { BusinessException } from '../exceptions/business.exception';
import { GlobalExceptionFilter, zodIssuesToDetails } from './global-exception.filter';

function makeHost(req: Partial<Request> = {}) {
  const status = vi.fn().mockReturnThis();
  const json = vi.fn();
  const res = { status, json } as unknown as Response;
  return {
    res,
    status,
    json,
    host: {
      switchToHttp: () => ({
        getRequest: <T>() =>
          ({
            method: 'GET',
            url: '/test',
            correlationId: 'req-test-id',
            ...req,
          }) as T,
        getResponse: <T>() => res as T,
      }),
    } as never,
  };
}

function makeLogger() {
  const child = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  return {
    logger: {
      child: vi.fn().mockReturnValue(child),
    } as never,
    child,
  };
}

describe('GlobalExceptionFilter', () => {
  beforeEach(() => {
    delete process.env['NODE_ENV'];
  });

  it('preserves a BusinessException message and code verbatim', () => {
    const { logger, child } = makeLogger();
    const { host, status, json } = makeHost();
    const filter = new GlobalExceptionFilter(logger);

    filter.catch(
      new BusinessException({
        code: 'PROFILE_NOT_FOUND',
        message: 'No profile for that user',
        status: 404,
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'PROFILE_NOT_FOUND',
        message: 'No profile for that user',
        details: undefined,
        requestId: 'req-test-id',
      },
    });
    expect(child.warn).toHaveBeenCalled();
  });

  it('renders a 422 with dotted-path details when BusinessException carries validation', () => {
    const { logger, child } = makeLogger();
    const { host, status, json } = makeHost();
    const filter = new GlobalExceptionFilter(logger);

    filter.catch(
      new BusinessException({
        code: 'VALIDATION_FAILED',
        message: 'Request validation failed',
        details: [{ path: 'address.street', message: 'Required' }],
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(422);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Request validation failed',
        details: [{ path: 'address.street', message: 'Required' }],
        requestId: 'req-test-id',
      },
    });
    expect(child.info).toHaveBeenCalled();
  });

  it('maps a raw ZodError to 422 with dotted paths', () => {
    const { logger } = makeLogger();
    const { host, status, json } = makeHost();
    const filter = new GlobalExceptionFilter(logger);

    const schema = z.object({ user: z.object({ email: z.string().email() }) });
    const parsed = schema.safeParse({ user: { email: 'not-an-email' } });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    filter.catch(parsed.error, host);

    expect(status).toHaveBeenCalledWith(422);
    const body = json.mock.calls[0]![0] as {
      error: { code: string; details: { path: string }[] };
    };
    expect(body.error.code).toBe('VALIDATION_FAILED');
    expect(body.error.details[0]!.path).toBe('user.email');
  });

  it('maps an HttpException status to a known error code', () => {
    const { logger } = makeLogger();
    const { host, status, json } = makeHost();
    const filter = new GlobalExceptionFilter(logger);

    filter.catch(new ForbiddenException('nope'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(json).toHaveBeenCalledWith({
      error: { code: 'FORBIDDEN', message: 'nope', requestId: 'req-test-id' },
    });
  });

  it('passes through an HttpException whose body already has the envelope shape', () => {
    const { logger } = makeLogger();
    const { host, status, json } = makeHost();
    const filter = new GlobalExceptionFilter(logger);

    const legacy = new BadRequestException({
      error: { code: 'LEGACY_CODE', message: 'legacy', details: [1, 2] },
    });
    filter.catch(legacy, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'LEGACY_CODE',
        message: 'legacy',
        details: [1, 2],
        requestId: 'req-test-id',
      },
    });
  });

  it('scrubs 5xx HttpException messages in production', () => {
    process.env['NODE_ENV'] = 'production';
    const { logger } = makeLogger();
    const { host, status, json } = makeHost();
    const filter = new GlobalExceptionFilter(logger);

    filter.catch(new InternalServerErrorException('db password leaked'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        requestId: 'req-test-id',
      },
    });
  });

  it('keeps 5xx HttpException messages outside production', () => {
    process.env['NODE_ENV'] = 'development';
    const { logger } = makeLogger();
    const { host, json } = makeHost();
    const filter = new GlobalExceptionFilter(logger);

    filter.catch(new InternalServerErrorException('boom'), host);

    const body = json.mock.calls[0]![0] as { error: { message: string } };
    expect(body.error.message).toBe('boom');
  });

  it('maps an unknown Error to 500 INTERNAL_ERROR with stack in dev', () => {
    process.env['NODE_ENV'] = 'development';
    const { logger, child } = makeLogger();
    const { host, status, json } = makeHost();
    const filter = new GlobalExceptionFilter(logger);

    filter.catch(new Error('totally unexpected'), host);

    expect(status).toHaveBeenCalledWith(500);
    const body = json.mock.calls[0]![0] as { error: { message: string; stack?: string } };
    expect(body.error.message).toBe('totally unexpected');
    expect(body.error.stack).toMatch(/Error: totally unexpected/);
    expect(child.error).toHaveBeenCalled();
  });

  it('strips message and omits stack for an unknown Error in production', () => {
    process.env['NODE_ENV'] = 'production';
    const { logger } = makeLogger();
    const { host, status, json } = makeHost();
    const filter = new GlobalExceptionFilter(logger);

    filter.catch(new Error('totally unexpected'), host);

    expect(status).toHaveBeenCalledWith(500);
    const body = json.mock.calls[0]![0] as { error: { message: string; stack?: string } };
    expect(body.error.message).toBe('Internal server error');
    expect(body.error.stack).toBeUndefined();
  });

  it('logs at warn for 4xx, error for 5xx, info for 422', () => {
    const { logger, child } = makeLogger();
    const { host: h1 } = makeHost();
    const filter = new GlobalExceptionFilter(logger);

    filter.catch(new NotFoundException('x'), h1);
    expect(child.warn).toHaveBeenCalledTimes(1);

    filter.catch(new HttpException('y', 502), makeHost().host);
    expect(child.error).toHaveBeenCalledTimes(1);

    filter.catch(
      new BusinessException({ code: 'VALIDATION_FAILED', message: 'z' }),
      makeHost().host,
    );
    expect(child.info).toHaveBeenCalledTimes(1);
  });

  it('logs a 5xx BusinessException at error severity', () => {
    const { logger, child } = makeLogger();
    const { host } = makeHost();
    const filter = new GlobalExceptionFilter(logger);

    filter.catch(
      new BusinessException({
        code: 'SERVICE_UNAVAILABLE',
        message: 'Upstream is down',
        status: 503,
      }),
      host,
    );

    expect(child.error).toHaveBeenCalledOnce();
    expect(child.warn).not.toHaveBeenCalled();
  });

  it('does not mutate the original BusinessException body across two .catch() calls', () => {
    const { logger } = makeLogger();
    const filter = new GlobalExceptionFilter(logger);

    const exception = new BusinessException({
      code: 'CONFLICT',
      message: 'Duplicate',
    });
    const originalBody = exception.getResponse();

    const a = makeHost({ correlationId: 'req-A' });
    const b = makeHost({ correlationId: 'req-B' });
    filter.catch(exception, a.host);
    filter.catch(exception, b.host);

    // The exception's original body must stay untouched between calls.
    expect(originalBody).toEqual({
      error: { code: 'CONFLICT', message: 'Duplicate', details: undefined },
    });
    // Each response must carry the correct correlation id.
    const bodyA = a.json.mock.calls[0]![0] as { error: { requestId: string } };
    const bodyB = b.json.mock.calls[0]![0] as { error: { requestId: string } };
    expect(bodyA.error.requestId).toBe('req-A');
    expect(bodyB.error.requestId).toBe('req-B');
  });
});

describe('zodIssuesToDetails', () => {
  it('joins paths with dots and renders an empty path as "(root)"', () => {
    const schema = z.object({ a: z.object({ b: z.string() }) });
    const r1 = schema.safeParse({ a: { b: 1 } });
    expect(r1.success).toBe(false);
    if (r1.success) return;
    expect(zodIssuesToDetails(r1.error)[0]!.path).toBe('a.b');

    const root = z.string();
    const r2 = root.safeParse(123);
    expect(r2.success).toBe(false);
    if (r2.success) return;
    expect(zodIssuesToDetails(r2.error)[0]!.path).toBe('(root)');
  });
});
