import { LoggerService } from '@nestjs/common';

import type { Logger } from '@mono/logger/node';

/**
 * Adapts our Pino-based Logger to NestJS's LoggerService interface so that
 * framework-internal logs (e.g. route registration) also flow through Pino.
 */
export class PinoLoggerAdapter implements LoggerService {
  constructor(private readonly logger: Logger) {}

  log(message: string, context?: string): void {
    this.logger.info({ context }, message);
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error({ context, trace }, message);
  }

  warn(message: string, context?: string): void {
    this.logger.warn({ context }, message);
  }

  debug(message: string, context?: string): void {
    this.logger.debug({ context }, message);
  }

  verbose(message: string, context?: string): void {
    this.logger.trace({ context }, message);
  }
}
