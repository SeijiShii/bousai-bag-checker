import { sql } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { users } from '@/db/schema';
import type * as schema from '@/db/schema';

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

// service-hub が pull する MVP 最小スキーマ (論点-003)。PII を一切含めない (O48/SEC-002)。
export interface ServiceInfo {
  service: 'bousai-bag-checker';
  status: 'ok' | 'degraded';
  user_count: number;
  error_count_24h: number;
  version: string;
  generated_at: string;
}

export interface MetricsSource {
  /** 直近24hのエラー数 (Sentry/自前ログ)。取得不可なら null。 */
  errorCount24h(): Promise<number | null>;
}

const VERSION = '0.0.0';

/** 集計値のみ返す (PII なし)。集計失敗時は status=degraded + 取得可能分。 */
export async function collectMetrics(db: AnyDb, metrics: MetricsSource): Promise<ServiceInfo> {
  let userCount = 0;
  let errorCount = 0;
  let status: ServiceInfo['status'] = 'ok';
  try {
    const rows = await db.select({ c: sql<number>`count(*)::int` }).from(users);
    userCount = rows[0]?.c ?? 0;
    const e = await metrics.errorCount24h();
    if (e === null) status = 'degraded';
    else errorCount = e;
  } catch {
    status = 'degraded';
  }
  return {
    service: 'bousai-bag-checker',
    status,
    user_count: userCount,
    error_count_24h: errorCount,
    version: VERSION,
    generated_at: new Date().toISOString(),
  };
}
