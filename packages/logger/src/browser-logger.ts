import type { BrowserLoggerConfig, Logger, LogLevel } from './types.js';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

function isProduction(): boolean {
  try {
    return process.env.NODE_ENV === 'production';
  } catch {
    return false;
  }
}

export function createBrowserLogger(config?: BrowserLoggerConfig): Logger {
  const prefix = config?.prefix ? `[${config.prefix}]` : '';
  const enabled = config?.enabled ?? true;
  const level = config?.level ?? (isProduction() ? 'warn' : 'debug');
  const minPriority = LOG_LEVEL_PRIORITY[level];

  function shouldLog(methodLevel: LogLevel): boolean {
    return enabled && LOG_LEVEL_PRIORITY[methodLevel] >= minPriority;
  }

  function log(
    methodLevel: LogLevel,
    consoleFn: (...args: unknown[]) => void,
    args: [Record<string, unknown>, string?] | [string],
  ): void {
    if (!shouldLog(methodLevel)) return;
    const parts: unknown[] = prefix ? [prefix] : [];
    if (typeof args[0] === 'string') {
      parts.push(args[0]);
    } else {
      if (args[1]) parts.push(args[1]);
      parts.push(args[0]);
    }
    consoleFn(...parts);
  }

  function makeMethod(
    methodLevel: LogLevel,
    consoleFn: (...args: unknown[]) => void,
  ) {
    return (...args: [Record<string, unknown>, string?] | [string]): void => {
      log(methodLevel, consoleFn, args);
    };
  }

  const logger: Logger = {
    fatal: makeMethod('fatal', console.error),
    error: makeMethod('error', console.error),
    warn: makeMethod('warn', console.warn),
    info: makeMethod('info', console.info),
    debug: makeMethod('debug', console.debug),
    trace: makeMethod('trace', console.debug),
    child(_bindings: Record<string, unknown>): Logger {
      return logger;
    },
  };

  return logger;
}
