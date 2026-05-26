# 実装レポート: _shared/service-info

## 実装日時
2026-05-27 (JST) / **モード**: feature (cross-cutting)

## 関連ドキュメント
- 001/002/003 (_shared/service-info) / [AI_LOG](../../AI_LOG/D20260527_025_tdd__shared_service-info.md)

## 変更一覧
- `src/services/ratelimit/rateLimiter.ts`: **共通レート制限**(RateLimiter interface + InMemoryRateLimiter、injectable)。spec-review R1 解消(feedback/tip/service-info 共有)
- `src/services/serviceInfo/collectMetrics.ts`: MVP 最小スキーマ(論点-003)集計、PII 非混入、失敗時 degraded
- `src/services/serviceInfo/handler.ts`: トークン検証(401)+ レート制限(429)+ 集計返却(200)
- `.env.example`: SERVICE_INFO_TOKEN 追記

## 実装計画からの差分
| 項目 | 内容 |
|---|---|
| 共通化 | レート制限を `_shared/ratelimit` に切り出し(R1)。実 Upstash は release(injectable) |
| 契約 | MVP 最小スキーマ先行(論点-003)。service-hub 契約確定後に拡張(論点-S-svc-1) |

## PR Description
### 概要
service-hub が pull する運用指標エンドポイント。共有トークン認可 + レート制限 + PII 非混入。共通レート制限ヘルパも新設。
### テスト
7 テスト green(集計/degraded + 認可 401/429 + PII 非混入)。typecheck clean。
