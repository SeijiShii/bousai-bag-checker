import { describe, it, expect } from 'vitest';
import handler from './service-info';
import type { ApiReq, ApiRes } from './_lib/handler';

function mockReq(over: Partial<ApiReq> = {}): ApiReq {
  return { method: 'GET', query: {}, headers: {}, ...over };
}

function mockRes() {
  const captured: { status: number; body: unknown } = { status: 0, body: undefined };
  const res: ApiRes = {
    status(code: number) {
      captured.status = code;
      return res;
    },
    json(body: unknown) {
      captured.body = body;
    },
    send() {},
    setHeader() {},
  };
  return { res, captured };
}

describe('GET /api/service-info — deprecation stub (O48 2026-05-28 改訂後)', () => {
  it('U-NEW-3: 410 Gone + moved_to=/api/hub/service-info を返す', () => {
    const { res, captured } = mockRes();
    handler(mockReq({ headers: { authorization: 'Bearer secret' } }), res);
    expect(captured.status).toBe(410);
    const body = captured.body as Record<string, string>;
    expect(body.error).toBe('deprecated');
    expect(body.moved_to).toBe('/api/hub/service-info');
  });

  it('全 method で 410 (POST/PUT 含む)', () => {
    for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
      const { res, captured } = mockRes();
      handler(mockReq({ method }), res);
      expect(captured.status).toBe(410);
    }
  });

  it('token 検証はしない (旧 URL なので集計値も返さない)', () => {
    const { res, captured } = mockRes();
    handler(mockReq({ headers: { authorization: 'Bearer secret' } }), res);
    expect(captured.status).toBe(410);
    const body = captured.body as Record<string, unknown>;
    expect(body).not.toHaveProperty('metrics');
    expect(body).not.toHaveProperty('user_count');
    expect(body).not.toHaveProperty('schemaVersion');
  });
});
