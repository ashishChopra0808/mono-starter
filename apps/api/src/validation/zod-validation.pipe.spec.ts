import type { ArgumentMetadata } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { BusinessException } from '../common/exceptions/business.exception';
import { ZodValidationPipe } from './zod-validation.pipe';

const metadata: ArgumentMetadata = { type: 'body' };

describe('ZodValidationPipe', () => {
  it('returns parsed data when the input matches the schema', () => {
    const schema = z.object({ name: z.string(), age: z.number().int() });
    const pipe = new ZodValidationPipe(schema);
    expect(pipe.transform({ name: 'Ada', age: 30 }, metadata)).toEqual({
      name: 'Ada',
      age: 30,
    });
  });

  it('coerces / strips through the schema rather than re-shaping the input', () => {
    const schema = z
      .object({ name: z.string(), age: z.coerce.number().int() })
      .strict();
    const pipe = new ZodValidationPipe(schema);
    expect(pipe.transform({ name: 'Ada', age: '42' }, metadata)).toEqual({
      name: 'Ada',
      age: 42,
    });
  });

  it('throws a BusinessException with VALIDATION_FAILED on bad input', () => {
    const schema = z.object({ user: z.object({ email: z.string().email() }) });
    const pipe = new ZodValidationPipe(schema);
    try {
      pipe.transform({ user: { email: 'not-an-email' } }, metadata);
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BusinessException);
      const e = err as BusinessException;
      expect(e.code).toBe('VALIDATION_FAILED');
      expect(e.getStatus()).toBe(422);
      const body = e.getResponse() as {
        error: {
          code: string;
          details: { path: string; message: string }[];
        };
      };
      expect(body.error.code).toBe('VALIDATION_FAILED');
      expect(body.error.details[0]!.path).toBe('user.email');
    }
  });
});
