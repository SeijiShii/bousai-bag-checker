import { describe, it, expect, beforeEach } from 'vitest';
import { sql } from 'drizzle-orm';
import { makeTestDb } from '@/db/test-helpers';
import { users } from '@/db/schema';
import { handleServiceInfo, type ServiceInfoDeps } from './handler';
import {
  collectMetrics,
  type MetricsSource,
  type ServiceInfoResponse,
} from './collectMetrics';
import { InMemoryRateLimiter, allowAllRateLimiter } from '@/services/ratelimit';

type TestDb = Awaited<ReturnType<typeof makeTestDb>>;

let db: TestDb;
const okMetrics: MetricsSource = { errorCount24h: async () => 0 };

beforeEach(async () => {
  db = await makeTestDb();
});

function deps(overrides: Partial<ServiceInfoDeps> = {}): ServiceInfoDeps {
  return {
    db,
    metrics: okMetrics,
    rateLimiter: allowAllRateLimiter,
    expectedToken: 'secret',
    ...overrides,
  };
}

function metricValue(info: ServiceInfoResponse, key: string): number | undefined {
  return info.metrics.find((m) => m.key === key)?.value;
}

describe('collectMetrics (O48 perspectives 2026-05-28 改訂、新 shape)', () => {
  it('U-NEW-1: schemaVersion=1 + metrics[] (mau/users_total/error_count_24h) + extra.generated_at', async () => {
    await db.insert(users).values([{ clerkUserId: 'a' }, { clerkUserId: 'b' }]);
    const info = await collectMetrics(db, okMetrics);

    expect(info.schemaVersion).toBe(1);
    expect(info.service).toBe('bousai-bag-checker');
    expect(info.status).toBe('ok');
    expect(info.version).toBe('0.0.0');
    expect(info.extra.generated_at).toMatch(/\d{4}-\d{2}-\d{2}T/);

    expect(metricValue(info, 'users_total')).toBe(2);
    expect(metricValue(info, 'mau')).toBe(2); // 新規 insert は updated_at=now()、直近 30 日内
    expect(metricValue(info, 'error_count_24h')).toBe(0);

    // PII を含むキーがない (集計のみ)
    const json = JSON.stringify(info);
    expect(json).not.toContain('clerk');
    expect(json).not.toMatch(/@/);
  });

  it('U-NEW-4: MAU は updated_at > now() - interval 30 days で算出', async () => {
    // 旧 user (updated_at 31 日前) + 新 user (updated_at now)
    await db.insert(users).values({ clerkUserId: 'old' });
    await db.execute(
      sql`UPDATE ${users} SET updated_at = now() - interval '31 days' WHERE clerk_user_id = 'old'`,
    );
    await db.insert(users).values([{ clerkUserId: 'active1' }, { clerkUserId: 'active2' }]);

    const info = await collectMetrics(db, okMetrics);
    expect(metricValue(info, 'users_total')).toBe(3);
    expect(metricValue(info, 'mau')).toBe(2); // 31 日前は除外、直近 2 件のみ
  });

  it('U-NEW-9: 境界 — users 0 件 / status:ok / mau:0 / users_total:0', async () => {
    const info = await collectMetrics(db, okMetrics);
    expect(info.status).toBe('ok');
    expect(metricValue(info, 'mau')).toBe(0);
    expect(metricValue(info, 'users_total')).toBe(0);
  });

  it('U-E3: メトリクス取得失敗 → status=degraded', async () => {
    const info = await collectMetrics(db, { errorCount24h: async () => null });
    expect(info.status).toBe('degraded');
  });
});

describe('handleServiceInfo (SEC-004 + 新 shape)', () => {
  it('U-NEW-2: 正しい HUB_SERVICE_INFO_SECRET → 200 + 新 shape', async () => {
    const res = await handleServiceInfo(deps(), 'secret', 'ip1');
    expect(res.status).toBe(200);
    const body = res.body as ServiceInfoResponse;
    expect(body.schemaVersion).toBe(1);
    expect(body.service).toBe('bousai-bag-checker');
    expect(Array.isArray(body.metrics)).toBe(true);
    expect(body.metrics.map((m) => m.key).sort()).toEqual([
      'error_count_24h',
      'mau',
      'users_total',
    ]);
  });

  it('U-NEW-6: token 不一致 → 401、集計値を返さない', async () => {
    const res = await handleServiceInfo(deps(), 'wrong', 'ip1');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'unauthorized' });
  });

  it('U-E1: トークンなし → 401', async () => {
    const res = await handleServiceInfo(deps(), null, 'ip1');
    expect(res.status).toBe(401);
  });

  it('U-NEW-7: レート超過 → 429 (トークン検証前にブロック)', async () => {
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
    expect(json).not.toMatch(/@/);
  });
});
