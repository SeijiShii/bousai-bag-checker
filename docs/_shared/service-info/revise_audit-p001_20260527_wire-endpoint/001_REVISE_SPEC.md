# _shared/service-info 変更仕様書 (O48 endpoint 配線)

> **改修種別**: 拡張 (未配線エンドポイントの runtime 公開)
> **issue / slug**: audit-p001 / wire-endpoint
> **基準 SPEC**: `../001__shared_service-info_SPEC.md`
> **最終更新**: 2026-05-27
> **タグ**: cross-cutting (API エンドポイント、HUB 間トークン認可)

---

## 1. 変更概要

O48 service-info の core ロジック (`handleServiceInfo` + `collectMetrics`、SEC-004 認可 + PII 非混入、7 unit green) は実装済だが、**Vercel Function (`api/service-info.ts`) が存在しない**ため service-hub が `GET /api/service-info` を実行時に pull できない (404)。本改修で endpoint を配線し、require 観点 O48 を routing 層まで実装完了させる。挙動 (認可・集計) は変更せず、**実行時公開のみ追加**。

## 2. 変更前 vs 変更後

### 2.1 UC 変更
| UC ID | 変更前 | 変更後 | 理由 |
|---|---|---|---|
| O48 pull | core handler のみ (呼び出し元なし) | `GET /api/service-info` で公開、service-hub が pull 可 | endpoint 未配線の解消 |

### 2.2 入出力変更
| 対象 | 変更前 | 変更後 | 互換性 |
|---|---|---|---|
| `GET /api/service-info` | 404 (ルート不在) | 200 (有効トークン) / 401 (不一致) / 429 (レート超過) / 405 (非 GET) / 503 (`SERVICE_INFO_TOKEN` 未設定) | 新規追加 (後方互換) |
| トークン受け渡し | (未定義) | `Authorization: Bearer <token>` または `X-Service-Info-Token: <token>` | — |

### 2.3 データモデル変更
| エンティティ | 変更内容 | マイグレーション要否 |
|---|---|---|
| (なし) | 集計のみ、スキーマ変更なし | 不要 |

### 2.4 バリデーション・エラー変更
| 対象 | 変更前 | 変更後 |
|---|---|---|
| トークン未設定 (運用ミス) | — | **fail-closed**: `SERVICE_INFO_TOKEN` 未設定なら 503 (集計値を誤って全開放しない) |
| 非 GET メソッド | — | 405 Method Not Allowed |

## 3. 影響範囲

| 対象 | 影響度 | 説明 |
|---|---|---|
| _shared/service-info | 高 | 直接対象 (endpoint 配線) |
| api/ | 中 | `api/service-info.ts` 新規 1 ファイル |
| 既存 core handler | なし | `handleServiceInfo` は無変更で再利用 |
| 他 feature | なし | 独立エンドポイント |

## 4. 後方互換性

- **互換維持**: ✅ (新規エンドポイント追加のみ、既存挙動・既存 API に影響なし)

## 5. ロールバック方針

- **コード revert で戻せる**: ✅ (`api/service-info.ts` + テスト削除で完全復元、DB 変更なし)

## 6. リリース戦略

- **方式**: 一括 (新規エンドポイント、フラグ不要)
- `SERVICE_INFO_TOKEN` を `.env.local` / デプロイ先 env に設定 (release P4.7 工程)。未設定時は 503 で fail-closed のため誤公開なし。

## 7. 詳細仕様 (新仕様)

### 7.1 詳細 UC
service-hub が定期的に `GET /api/service-info` を共有トークン付きで pull → アプリ層の運用指標 (user_count / error_count_24h / status / version) を JSON で取得。

### 7.2 入出力
- **Request**: `GET /api/service-info`、ヘッダ `Authorization: Bearer <SERVICE_INFO_TOKEN>` (または `X-Service-Info-Token`)
- **Response 200**: `ServiceInfo` (MVP 最小スキーマ、PII なし) — `{service, status, user_count, error_count_24h, version, generated_at}`
- **401**: トークン欠落/不一致 (集計値も返さない、SEC-004)
- **429**: レート超過 (公開 EP 共通レート制限、IP 単位)
- **405**: 非 GET
- **503**: `SERVICE_INFO_TOKEN` サーバー未設定 (fail-closed)

### 7.3 データモデル
変更なし (`collectMetrics` が users テーブル件数を集計)。

### 7.4 バリデーション・エラー
- トークン検証は既存 `handleServiceInfo` に委譲 (401)。
- error metrics 取得は `MetricsSource.errorCount24h`。**実 Sentry は release で配線** (O35)。未配線時は `null` を返し `status=degraded` (正直なシグナル: エラー監視は未接続)。release で Sentry 接続後 `ok` に遷移。

### 7.5 機能固有 NFR + 既存連携
- 公開 EP のため共通レート制限 (`InMemoryRateLimiter`、dev/MVP)。release で Upstash 注入可。
- PII 非混入は `collectMetrics` が保証済 (集計値のみ)。

## 8. タグ別追加項目
- cross-cutting: 既存 api/ ルート規約 (`export default handler(req, res)`) に準拠。

## 9. 未決事項
- [論点-S-svc-1] service-hub 契約スキーマ確定後、レスポンス拡張 (元 feature から継続、本改修では MVP 最小のまま)。現時点で新規論点なし (2026-05-27)。

## 10. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (AUDIT-perspective-001 起点) | /flow:revise |
