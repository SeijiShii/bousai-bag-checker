# 実装レポート: _shared/service-info O48 endpoint 配線

## 実装日時
2026-05-27 (JST) / **モード**: revise (cross-cutting) / 起点: AUDIT-perspective-001 (High)

## 関連ドキュメント
- 001/002/003 (revise_audit-p001) / AUDIT_20260527_1549.md / [AI_LOG](../../../AI_LOG/D20260527_037_revise__shared_service-info.md)

## 変更一覧
- `api/service-info.ts` (新規): Vercel Function。`extractToken` (Authorization: Bearer / X-Service-Info-Token) + `serviceInfoRoute` (deps 注入可コア) + `export default handler` (composition: getDb + collectMetrics + InMemoryRateLimiter(60/分) + `SERVICE_INFO_TOKEN`)。405 (非 GET) / 503 (token 未設定 fail-closed) ガード。core `handleServiceInfo` へ委譲 (無変更再利用)。
- `api/service-info.test.ts` (新規): 配線スモーク 9 ケース (token 抽出 ×3 + 200/401×2/503/405/429)。
- `vitest.config.ts`: `include` に `api/**/*.test.ts` 追加 (api エンドポイントテストを実行対象化)。

## 実装計画からの差分
| 項目 | 内容 |
|---|---|
| error metrics | Sentry 未配線のため `errorCount24h: () => null` → status=degraded (release で Sentry 配線後 ok。SPEC §7.4 既知) |
| fail-closed | `SERVICE_INFO_TOKEN` 未設定時 503 を追加 (誤公開防止、計画通り) |
| test glob | api/ が vitest include 外だったため 1 行追加 (計画 §2 で識別) |

## テスト結果
- **api/service-info.test.ts: 9/9 green**、既存 core handler.test.ts: 7/7 維持
- **全体: 28 files / 145 tests green** (136 → 145、+9)、`tsc --noEmit` clean

## 監査 finding 解消の確認
- [AUDIT-perspective-001] High 解消: `api/service-info.ts` が `handleServiceInfo` を import (`grep -rn serviceInfo api/` でヒット)、`GET /api/service-info` が runtime 公開 (404 → 200/401/429/405/503)。service-hub が pull 可能に。
- 残: `SERVICE_INFO_TOKEN` 実値設定 + デプロイ後疎通 (O51) は release (P4.7) 工程。

## PR Description
### 概要
O48 service-info の core handler を Vercel Function (`api/service-info.ts`) に配線。service-hub が運用指標を pull できるようにする (共有トークン認可 + レート制限 + PII 非混入 + fail-closed)。
### テスト
配線スモーク 9 green、全体 145 green、typecheck clean。DB 変更なし、後方互換 (新規 EP 追加のみ)。
