import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type * as schema from "@/db/schema";
import type { RateLimiter } from "@/services/ratelimit";
import {
  collectMetrics,
  type MetricsSource,
  type ServiceInfoResponse,
} from "./collectMetrics";

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

export interface ServiceInfoResult {
  status: 200 | 401 | 429;
  body: ServiceInfoResponse | { error: string };
}

export interface ServiceInfoDeps {
  db: AnyDb;
  metrics: MetricsSource;
  rateLimiter: RateLimiter;
  /** 共有シークレット (HUB_SERVICE_INFO_SECRET、サーバー専用)。service-hub 契約 (perspectives O48 2026-05-28 改訂、全サービス共通)。 */
  expectedToken: string;
}

/**
 * GET /api/hub/service-info ハンドラ (SEC-004 認可スコープ + PII 非混入)。
 * @param providedToken リクエストヘッダのトークン
 * @param clientKey レート制限キー (IP/トークン)
 */
export async function handleServiceInfo(
  deps: ServiceInfoDeps,
  providedToken: string | null,
  clientKey: string,
): Promise<ServiceInfoResult> {
  if (!(await deps.rateLimiter.allow(clientKey))) {
    return { status: 429, body: { error: "rate_limited" } };
  }
  // トークン不一致は集計値も返さない (SEC-004)
  if (!providedToken || providedToken !== deps.expectedToken) {
    return { status: 401, body: { error: "unauthorized" } };
  }
  const info = await collectMetrics(deps.db, deps.metrics);
  return { status: 200, body: info };
}
