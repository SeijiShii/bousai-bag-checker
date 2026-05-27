import { getDb } from '../src/db/client';
import {
  collectMetrics,
  handleServiceInfo,
  type MetricsSource,
  type ServiceInfoDeps,
} from '../src/services/serviceInfo';
import { InMemoryRateLimiter, type RateLimiter } from '../src/services/ratelimit';
import { clientKey, type ApiReq, type ApiRes } from './_lib/handler';

/**
 * GET /api/service-info — service-hub が pull する運用指標 (O48)。
 * 共有トークン認可 (SEC-004) + 公開 EP レート制限 + PII 非混入 (集計値のみ)。
 * core ロジックは src/services/serviceInfo に既存、本ファイルは Vercel Function 配線のみ。
 */

// 公開 EP 共通レート制限 (IP 単位、60 req/分)。release で Upstash 注入可。
let sharedLimiter: RateLimiter | undefined;

// エラーメトリクスは Sentry 配線 (release P4.7) まで取得不可 → null = status:degraded (正直なシグナル)。
const metrics: MetricsSource = { errorCount24h: async () => null };

function buildDeps(): ServiceInfoDeps {
  if (!sharedLimiter) sharedLimiter = new InMemoryRateLimiter(60, 60_000);
  return {
    db: getDb(),
    metrics,
    rateLimiter: sharedLimiter,
    expectedToken: process.env.SERVICE_INFO_TOKEN ?? '',
  };
}

/** トークンを Authorization: Bearer / X-Service-Info-Token から取り出す (どちらか)。 */
export function extractToken(req: ApiReq): string | null {
  const auth = req.headers['authorization'];
  const a = Array.isArray(auth) ? auth[0] : auth;
  if (a && a.startsWith('Bearer ')) return a.slice(7);
  const x = req.headers['x-service-info-token'];
  const xv = Array.isArray(x) ? x[0] : x;
  return xv ?? null;
}

/** テストから deps を注入できるコア (handleServiceInfo へ委譲)。 */
export async function serviceInfoRoute(
  req: ApiReq,
  res: ApiRes,
  deps: ServiceInfoDeps,
): Promise<void> {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  // SERVICE_INFO_TOKEN 未設定なら fail-closed (集計値を誤って全開放しない)。
  if (!deps.expectedToken) {
    res.status(503).json({ error: 'service-info disabled' });
    return;
  }
  const result = await handleServiceInfo(deps, extractToken(req), clientKey(req));
  res.status(result.status).json(result.body);
}

export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  await serviceInfoRoute(req, res, buildDeps());
}

// collectMetrics を再 export (将来の契約拡張時の参照点、論点-S-svc-1)。
export { collectMetrics };
