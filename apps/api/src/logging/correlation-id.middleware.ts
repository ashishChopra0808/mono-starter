import { randomUUID } from 'node:crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction,Request, Response } from 'express';

const HEADER = 'x-correlation-id';

declare module 'express' {
  interface Request {
    correlationId: string;
  }
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers[HEADER] as string | undefined) ?? randomUUID();
    req.correlationId = correlationId;
    res.setHeader(HEADER, correlationId);
    next();
  }
}
