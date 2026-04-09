/**
 * Default Pino redaction paths. These dot-paths are replaced with "[Redacted]"
 * at the serialization level — sensitive data never reaches the transport.
 */
export const REDACT_PATHS: string[] = [
  'password',
  'secret',
  'token',
  'authorization',
  'cookie',
  'ssn',
  'creditCard',
  'req.headers.authorization',
  'req.headers.cookie',
];

/** Manually mask a string value (e.g. for logging partial tokens). */
export function redactValue(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return '[Redacted]';
  return '*'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
}
