import { describe, expect, it, vi } from 'vitest';

import {
  ApiError,
  NetworkError,
  ResponseValidationError,
  UnauthorizedError,
} from './errors.js';
import {
  categorizeError,
  getFieldErrors,
  getUserMessage,
  logError,
} from './format.js';

const makeError = (
  overrides: Partial<ConstructorParameters<typeof ApiError>[0]> = {},
): ApiError =>
  new ApiError({
    kind: 'http',
    status: 400,
    code: 'BAD_REQUEST',
    message: 'bad',
    ...overrides,
  });

describe('categorizeError', () => {
  it('maps subclass identities first', () => {
    expect(
      categorizeError(new UnauthorizedError({ code: 'X', message: 'm' })),
    ).toBe('auth');
    expect(categorizeError(new NetworkError('offline'))).toBe('network');
    expect(
      categorizeError(new ResponseValidationError('shape', {}, undefined)),
    ).toBe('response-validation');
  });

  it('maps by known code', () => {
    expect(categorizeError(makeError({ code: 'FORBIDDEN', status: 403 }))).toBe(
      'permission',
    );
    expect(
      categorizeError(makeError({ code: 'VALIDATION_FAILED', status: 422 })),
    ).toBe('validation');
    expect(
      categorizeError(makeError({ code: 'RATE_LIMITED', status: 429 })),
    ).toBe('rate-limit');
    expect(categorizeError(makeError({ code: 'CONFLICT', status: 409 }))).toBe(
      'conflict',
    );
  });

  it('falls back to status when code is unknown', () => {
    expect(categorizeError(makeError({ code: 'UNKNOWN', status: 404 }))).toBe(
      'not-found',
    );
    expect(categorizeError(makeError({ code: 'UNKNOWN', status: 503 }))).toBe(
      'unexpected',
    );
  });
});

describe('getFieldErrors', () => {
  it('returns {} for non-validation errors', () => {
    expect(getFieldErrors(makeError({ code: 'FORBIDDEN', status: 403 }))).toEqual({});
  });

  it('returns a path→message map for validation errors', () => {
    const err = makeError({
      code: 'VALIDATION_FAILED',
      status: 422,
      details: [
        { path: 'email', message: 'Invalid email' },
        { path: 'address.street', message: 'Required' },
      ],
    });
    expect(getFieldErrors(err)).toEqual({
      email: 'Invalid email',
      'address.street': 'Required',
    });
  });

  it('keeps the first message when a path repeats', () => {
    const err = makeError({
      code: 'VALIDATION_FAILED',
      status: 422,
      details: [
        { path: 'email', message: 'Required' },
        { path: 'email', message: 'Invalid' },
      ],
    });
    expect(getFieldErrors(err)).toEqual({ email: 'Required' });
  });

  it('returns {} when details is not an array of {path,message}', () => {
    const err = makeError({
      code: 'VALIDATION_FAILED',
      status: 422,
      details: 'not-an-array',
    });
    expect(getFieldErrors(err)).toEqual({});
  });
});

describe('getUserMessage', () => {
  it('uses codeMessages first', () => {
    const err = makeError({ code: 'UNAUTHORIZED', status: 401, message: 'invalid jwt' });
    expect(
      getUserMessage(err, { codeMessages: { UNAUTHORIZED: 'Please sign in.' } }),
    ).toBe('Please sign in.');
  });

  it('falls back to server message when no codeMessage matches', () => {
    const err = makeError({ code: 'PROFILE_NOT_FOUND', status: 404, message: 'No profile.' });
    expect(getUserMessage(err)).toBe('No profile.');
  });

  it('falls back to category default when server message is empty', () => {
    const err = makeError({ code: 'INTERNAL_ERROR', status: 500, message: '' });
    expect(getUserMessage(err)).toMatch(/something went wrong/i);
  });

  it('honors per-category overrides', () => {
    const err = makeError({ code: 'INTERNAL_ERROR', status: 500, message: '' });
    expect(
      getUserMessage(err, { categoryMessages: { unexpected: 'Boom.' } }),
    ).toBe('Boom.');
  });

  it('always returns a non-empty string', () => {
    const err = makeError({ code: 'UNKNOWN', status: 0, message: '' });
    const result = getUserMessage(err);
    expect(result.length).toBeGreaterThan(0);
  });

  it('treats whitespace-only server messages as empty', () => {
    const err = makeError({ code: 'INTERNAL_ERROR', status: 500, message: '   ' });
    expect(getUserMessage(err)).toMatch(/something went wrong/i);
  });
});

describe('logError', () => {
  function makeLogger() {
    return {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      fatal: vi.fn(),
      child: vi.fn().mockReturnThis(),
    };
  }

  it('logs validation at info', () => {
    const logger = makeLogger();
    logError(
      logger as never,
      makeError({ code: 'VALIDATION_FAILED', status: 422 }),
    );
    expect(logger.info).toHaveBeenCalledOnce();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('logs unexpected at error', () => {
    const logger = makeLogger();
    logError(logger as never, makeError({ code: 'INTERNAL_ERROR', status: 500 }));
    expect(logger.error).toHaveBeenCalledOnce();
  });

  it('logs auth/permission/network at warn', () => {
    const logger = makeLogger();
    logError(logger as never, new UnauthorizedError({ code: 'UNAUTHORIZED', message: 'x' }));
    logError(logger as never, makeError({ code: 'FORBIDDEN', status: 403 }));
    logError(logger as never, new NetworkError('offline'));
    expect(logger.warn).toHaveBeenCalledTimes(3);
  });

  it('includes requestId in the log payload', () => {
    const logger = makeLogger();
    logError(
      logger as never,
      makeError({
        code: 'FORBIDDEN',
        status: 403,
        requestId: 'req-42',
      }),
    );
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: 'req-42', code: 'FORBIDDEN' }),
      'bad',
    );
  });
});
