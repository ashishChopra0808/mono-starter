import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

import type { Logger } from '@mono/logger/node';

export const ROOT_LOGGER = Symbol('ROOT_LOGGER');

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@Inject(ROOT_LOGGER) private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const { method, url, correlationId } = req;

    const child = this.logger.child({ correlationId });
    child.info({ method, url }, 'Incoming request');

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = http.getResponse<Response>();
        const durationMs = Date.now() - start;
        child.info(
          { method, url, statusCode: res.statusCode, durationMs },
          'Request completed',
        );
      }),
    );
  }
}
