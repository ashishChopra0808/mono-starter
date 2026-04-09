import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { z } from 'zod';

/**
 * NestJS pipe that validates input against a Zod schema.
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

    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    throw new BadRequestException({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details,
      },
    });
  }
}
