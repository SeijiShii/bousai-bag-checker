import { describe, it, expect, beforeEach } from 'vitest';
import { makeTestDb } from '@/db/test-helpers';
import { users } from '@/db/schema';
import { allowAllRateLimiter, InMemoryRateLimiter } from '@/services/ratelimit';
import type { MetricsSource, ServiceInfoDeps } from '@/services/serviceInfo';
import { serviceInfoRoute, extractToken } from './service-info';
import type { ApiReq, ApiRes } from './_lib/handler';

type TestDb = Awaited<ReturnType<typeof makeTestDb>>;

let db: TestDb;
const okMetrics: MetricsSource = { errorCount24h: async () => 0 };

beforeEach(async () => {
  db = await makeTestDb();
});

function deps(over: Partial<ServiceInfoDeps> = {}): ServiceInfoDeps {
  return { db, metrics: okMetrics, rateLimiter: allowAllRateLimiter, expectedToken: 'secret', ...over };
}

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

describe('extractToken', () => {
  it('RU-N1: Authorization: Bearer から取り出す', () => {
    expect(extractToken(mockReq({ headers: { authorization: 'Bearer secret' } }))).toBe('secret');
  });
  it('RU-N2: X-Service-Info-Token から取り出す', () => {
    expect(extractToken(mockReq({ headers: { 'x-service-info-token': 'secret' } }))).toBe('secret');
  });
  it('RU-E5: ヘッダ皆無なら null', () => {
    expect(extractToken(mockReq())).toBeNull();
  });
});

describe('serviceInfoRoute (O48 endpoint 配線)', () => {
  it('RU-N3: 有効トークン → 200 + 集計 JSON (PII なし)', async () => {
    await db.insert(users).values([{ clerkUserId: 'a' }, { clerkUserId: 'b' }]);
    const { res, captured } = mockRes();
    await serviceInfoRoute(mockReq({ headers: { authorization: 'Bearer secret' } }), res, deps());
    expect(captured.status).toBe(200);
    const body = captured.body as Record<string, unknown>;
    expect(body.service).toBe('bousai-bag-checker');
    expect(body.user_count).toBe(2);
    // PII キーが混入していない (集計のみ)
    expect(Object.keys(body)).toEqual([
      'service',
      'status',
      'user_count',
      'error_count_24h',
      'version',
      'generated_at',
    ]);
  });

  it('RU-E1: トークンなし → 401', async () => {
    const { res, captured } = mockRes();
    await serviceInfoRoute(mockReq(), res, deps());
    expect(captured.status).toBe(401);
  });

  it('RU-E2: トークン不一致 → 401', async () => {
    const { res, captured } = mockRes();
    await serviceInfoRoute(mockReq({ headers: { authorization: 'Bearer wrong' } }), res, deps());
    expect(captured.status).toBe(401);
  });

  it('RU-E3: SERVICE_INFO_TOKEN 未設定 → 503 (fail-closed)', async () => {
    const { res, captured } = mockRes();
    await serviceInfoRoute(mockReq({ headers: { authorization: 'Bearer secret' } }), res, deps({ expectedToken: '' }));
    expect(captured.status).toBe(503);
  });

  it('RU-E4: 非 GET → 405', async () => {
    const { res, captured } = mockRes();
    await serviceInfoRoute(mockReq({ method: 'POST' }), res, deps());
    expect(captured.status).toBe(405);
  });

  it('RU-E6: レート超過 → 429', async () => {
    const limiter = new InMemoryRateLimiter(1, 60_000);
    const { res: r1, captured: c1 } = mockRes();
    await serviceInfoRoute(mockReq({ headers: { authorization: 'Bearer secret' } }), r1, deps({ rateLimiter: limiter }));
    expect(c1.status).toBe(200);
    const { res: r2, captured: c2 } = mockRes();
    await serviceInfoRoute(mockReq({ headers: { authorization: 'Bearer secret' } }), r2, deps({ rateLimiter: limiter }));
    expect(c2.status).toBe(429);
  });
});
