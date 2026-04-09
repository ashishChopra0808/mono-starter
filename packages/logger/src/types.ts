export type LogLevel =
  | 'fatal'
  | 'error'
  | 'warn'
  | 'info'
  | 'debug'
  | 'trace';

export interface Logger {
  fatal(obj: Record<string, unknown>, msg?: string): void;
  fatal(msg: string): void;
  error(obj: Record<string, unknown>, msg?: string): void;
  error(msg: string): void;
  warn(obj: Record<string, unknown>, msg?: string): void;
  warn(msg: string): void;
  info(obj: Record<string, unknown>, msg?: string): void;
  info(msg: string): void;
  debug(obj: Record<string, unknown>, msg?: string): void;
  debug(msg: string): void;
  trace(obj: Record<string, unknown>, msg?: string): void;
  trace(msg: string): void;
  child(bindings: Record<string, unknown>): Logger;
}

export interface ServerLoggerConfig {
  /** Logger name — appears in log output as `name` field */
  name?: string;
  /** Minimum log level. Defaults to 'debug' in dev, 'info' in production */
  level?: LogLevel;
  /** Additional dot-paths to redact from logs */
  redactPaths?: string[];
  /** Disable pretty-printing even in development */
  disablePretty?: boolean;
}

export interface BrowserLoggerConfig {
  /** Prefix tag shown before log messages, e.g. "[web]" */
  prefix?: string;
  /** Minimum log level. Defaults to 'debug' in dev, 'warn' in production */
  level?: LogLevel;
  /** Completely disable all logging output */
  enabled?: boolean;
}
