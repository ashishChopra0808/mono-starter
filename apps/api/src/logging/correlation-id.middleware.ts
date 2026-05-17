import { randomUUID } from 'node:crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const REQUEST_ID_HEADER = 'x-request-id';
const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * Stamps each request with a stable id used for log correlation.
 *
 * Inbound: accepts either `x-request-id` (the canonical name used by
 * `@mono/api-client`) or `x-correlation-id` (legacy). Generates a UUID when
 * neither is present.
 *
 * Outbound: echoes the id on BOTH headers so old consumers and the new client
 * line up during the migration.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming =
      (req.headers[REQUEST_ID_HEADER] as string | undefined) ??
      (req.headers[CORRELATION_ID_HEADER] as string | undefined);

    const correlationId =
      incoming && incoming.length > 0 ? incoming : randomUUID();
    req.correlationId = correlationId;
    res.setHeader(REQUEST_ID_HEADER, correlationId);
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    next();
  }
}
