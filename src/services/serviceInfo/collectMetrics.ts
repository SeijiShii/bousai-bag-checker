import { sql } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { users } from '@/db/schema';
import type * as schema from '@/db/schema';

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

// service-hub 連携用 service-info contract (perspectives O48、2026-05-28 改訂)。
// HUB が pull するアプリ層指標。schemaVersion 固定 + metrics[] 自己申告 + extra 自由フィールド。
// PII を一切含めない (SEC-002、O48)。
export interface ServiceInfoMetric {
  key: string;
  value: number;
  unit?: string;
}

export interface ServiceInfoResponse {
  schemaVersion: 1;
  service: 'bousai-bag-checker';
  status: 'ok' | 'degraded' | 'down';
  metrics: ServiceInfoMetric[];
  version: string;
  extra: {
    generated_at: string;
  };
}

export interface MetricsSource {
  /** 直近24hのエラー数 (Sentry/自前ログ)。取得不可なら null。 */
  errorCount24h(): Promise<number | null>;
}

const VERSION = '0.0.0';
const SCHEMA_VERSION = 1 as const;
const SERVICE_NAME = 'bousai-bag-checker' as const;

// 直近 30 日に updated_at が更新された unique user 数を MAU として自己申告 (O48 [D20260528-002])。
// users.updated_at の touch は auth middleware で実施 (案 A、論点-001)。
export async function collectMetrics(
  db: AnyDb,
  metrics: MetricsSource,
): Promise<ServiceInfoResponse> {
  let usersTotal = 0;
  let mau = 0;
  let errorCount = 0;
  let status: ServiceInfoResponse['status'] = 'ok';

  try {
    const totalRows = await db.select({ c: sql<number>`count(*)::int` }).from(users);
    usersTotal = totalRows[0]?.c ?? 0;

    const mauRows = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(users)
      .where(sql`${users.updatedAt} > now() - interval '30 days'`);
    mau = mauRows[0]?.c ?? 0;

    const e = await metrics.errorCount24h();
    if (e === null) status = 'degraded';
    else errorCount = e;
  } catch {
    status = 'degraded';
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    service: SERVICE_NAME,
    status,
    metrics: [
      { key: 'mau', value: mau, unit: 'users' },
      { key: 'users_total', value: usersTotal, unit: 'users' },
      { key: 'error_count_24h', value: errorCount, unit: 'errors' },
    ],
    version: VERSION,
    extra: {
      generated_at: new Date().toISOString(),
    },
  };
}
