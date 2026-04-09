import pino from 'pino';

import type { Logger, ServerLoggerConfig } from './types.js';
import { REDACT_PATHS } from './redact.js';

export function createLogger(config?: ServerLoggerConfig): Logger {
  const isDev = process.env.NODE_ENV !== 'production';

  const redactPaths = [
    ...REDACT_PATHS,
    ...(config?.redactPaths ?? []),
  ];

  const options: pino.LoggerOptions = {
    name: config?.name,
    level: config?.level ?? (isDev ? 'debug' : 'info'),
    redact: {
      paths: redactPaths,
      censor: '[Redacted]',
    },
  };

  if (isDev && !config?.disablePretty) {
    options.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss.l',
        ignore: 'pid,hostname',
      },
    };
  }

  return pino(options) as unknown as Logger;
}
