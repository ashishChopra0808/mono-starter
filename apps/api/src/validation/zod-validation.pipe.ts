import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { z } from 'zod';

import { BusinessException } from '../common/exceptions/business.exception';
import { zodIssuesToDetails } from '../common/filters/global-exception.filter';

/**
 * NestJS pipe that validates input against a Zod schema.
 *
 * On failure, throws a `BusinessException` with code `VALIDATION_FAILED` and a
 * dotted-path `details` array. The global exception filter renders it as a
 * 422 response with the standard error envelope.
 *
 * Usage:
 *   @Post()
 *   create(@Body(new ZodValidationPipe(createProjectSchema)) body: CreateProject) { ... }
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodType) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    const result = this.schema.safeParse(value);

    if (result.success) {
      return result.data;
    }

    throw new BusinessException({
      code: 'VALIDATION_FAILED',
      message: 'Request validation failed',
      details: zodIssuesToDetails(result.error),
    });
  }
}
