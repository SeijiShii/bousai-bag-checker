import type { ApiReq, ApiRes } from './_lib/handler';

/**
 * GET /api/service-info — 旧 endpoint の deprecation stub。
 *
 * perspectives O48 が 2026-05-28 に契約改訂 ([D20260528-001/002]):
 * - 新 endpoint: `/api/hub/service-info`
 * - 新 secret env: `HUB_SERVICE_INFO_SECRET` (全サービス共通、`SERVICE_INFO_TOKEN` 廃止)
 *
 * HUB は新 endpoint を pull するため旧 URL は廃止。互換層を残さず 410 Gone で fail-fast。
 * クライアント混乱回避 + 旧 URL アクセスの可視化 (アクセスログで気付ける) のため stub を残す。
 */
export default function handler(_req: ApiReq, res: ApiRes): void {
  res.status(410).json({
    error: 'deprecated',
    moved_to: '/api/hub/service-info',
    notice:
      'service-info contract was updated 2026-05-28 (perspectives O48). Use /api/hub/service-info with HUB_SERVICE_INFO_SECRET.',
  });
}
