import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { CorrelationIdMiddleware } from './correlation-id.middleware';

function makeReqRes(headers: Record<string, string | undefined> = {}) {
  const req = { headers } as unknown as Request;
  const setHeader = vi.fn();
  const res = { setHeader } as unknown as Response;
  return { req, res, setHeader };
}

describe('CorrelationIdMiddleware', () => {
  it('uses x-request-id from the request when present', () => {
    const mw = new CorrelationIdMiddleware();
    const { req, res, setHeader } = makeReqRes({ 'x-request-id': 'incoming-rid' });
    const next: NextFunction = vi.fn();

    mw.use(req, res, next);

    expect(req.correlationId).toBe('incoming-rid');
    expect(setHeader).toHaveBeenCalledWith('x-request-id', 'incoming-rid');
    expect(setHeader).toHaveBeenCalledWith('x-correlation-id', 'incoming-rid');
    expect(next).toHaveBeenCalledOnce();
  });

  it('accepts the legacy x-correlation-id header when x-request-id is absent', () => {
    const mw = new CorrelationIdMiddleware();
    const { req, setHeader } = makeReqRes({ 'x-correlation-id': 'legacy-id' });
    mw.use(req, { setHeader } as unknown as Response, vi.fn());

    expect(req.correlationId).toBe('legacy-id');
    expect(setHeader).toHaveBeenCalledWith('x-request-id', 'legacy-id');
    expect(setHeader).toHaveBeenCalledWith('x-correlation-id', 'legacy-id');
  });

  it('prefers x-request-id over x-correlation-id when both are sent', () => {
    const mw = new CorrelationIdMiddleware();
    const { req, setHeader } = makeReqRes({
      'x-request-id': 'rid',
      'x-correlation-id': 'cid',
    });
    mw.use(req, { setHeader } as unknown as Response, vi.fn());
    expect(req.correlationId).toBe('rid');
  });

  it('generates a fresh UUID when neither header is set', () => {
    const mw = new CorrelationIdMiddleware();
    const a = makeReqRes();
    const b = makeReqRes();
    mw.use(a.req, a.res, vi.fn());
    mw.use(b.req, b.res, vi.fn());

    expect(a.req.correlationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(b.req.correlationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(a.req.correlationId).not.toEqual(b.req.correlationId);
  });

  it('treats an empty incoming header as missing', () => {
    const mw = new CorrelationIdMiddleware();
    const { req, setHeader } = makeReqRes({ 'x-request-id': '' });
    mw.use(req, { setHeader } as unknown as Response, vi.fn());
    expect(req.correlationId).toMatch(/^[0-9a-f-]{36}$/);
  });
});
