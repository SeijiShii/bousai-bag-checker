import { describe, it, expect, beforeEach } from 'vitest';
import { makeTestDb } from '@/db/test-helpers';
import { users } from '@/db/schema';
import { handleServiceInfo, type ServiceInfoDeps } from './handler';
import { collectMetrics, type MetricsSource } from './collectMetrics';
import { InMemoryRateLimiter, allowAllRateLimiter } from '@/services/ratelimit';

type TestDb = Awaited<ReturnType<typeof makeTestDb>>;

let db: TestDb;
const okMetrics: MetricsSource = { errorCount24h: async () => 0 };

beforeEach(async () => {
  db = await makeTestDb();
});

function deps(overrides: Partial<ServiceInfoDeps> = {}): ServiceInfoDeps {
  return { db, metrics: okMetrics, rateLimiter: allowAllRateLimiter, expectedToken: 'secret', ...overrides };
}

describe('collectMetrics', () => {
  it('U-N1: user_count を集計、最小スキーマ + PII なし', async () => {
    await db.insert(users).values([{ clerkUserId: 'a' }, { clerkUserId: 'b' }]);
    const info = await collectMetrics(db, okMetrics);
    expect(info.user_count).toBe(2);
    expect(info.status).toBe('ok');
    // PII を含むキーがない
    expect(Object.keys(info)).toEqual(['service', 'status', 'user_count', 'error_count_24h', 'version', 'generated_at']);
  });

  it('U-E3: メトリクス取得失敗 → status=degraded', async () => {
    const info = await collectMetrics(db, { errorCount24h: async () => null });
    expect(info.status).toBe('degraded');
  });
});

describe('handleServiceInfo (SEC-004)', () => {
  it('U-N2: 正しいトークン → 200 + JSON', async () => {
    const res = await handleServiceInfo(deps(), 'secret', 'ip1');
    expect(res.status).toBe(200);
    expect((res.body as { service: string }).service).toBe('bousai-bag-checker');
  });

  it('U-E1: トークン不一致 → 401、集計値を返さない', async () => {
    const res = await handleServiceInfo(deps(), 'wrong', 'ip1');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'unauthorized' });
  });

  it('U-E1: トークンなし → 401', async () => {
    const res = await handleServiceInfo(deps(), null, 'ip1');
    expect(res.status).toBe(401);
  });

  it('U-E2: レート超過 → 429 (トークン検証前にブロック)', async () => {
    const rl = new InMemoryRateLimiter(1, 60_000);
    const d = deps({ rateLimiter: rl });
    expect((await handleServiceInfo(d, 'secret', 'ipX')).status).toBe(200);
    expect((await handleServiceInfo(d, 'secret', 'ipX')).status).toBe(429);
  });

  it('U-P1: レスポンス JSON に PII を含まない', async () => {
    await db.insert(users).values({ clerkUserId: 'c' });
    const res = await handleServiceInfo(deps(), 'secret', 'ip1');
    const json = JSON.stringify(res.body);
    expect(json).not.toContain('clerk');
    expect(json).not.toMatch(/@/); // メールなし
  });
});
