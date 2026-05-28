# 実装レポート: _shared/service-info (revise 002 — O48 2026-05-28 契約改訂への retrofit)

## 実装日時
2026-05-28 12:40 (+09:00)

## モード
revise

## 関連ドキュメント
- [001_REVISE_SPEC.md](./001_REVISE_SPEC.md) — 変更仕様書
- [002_REVISE_PLAN.md](./002_REVISE_PLAN.md) — 変更計画書
- [003_REVISE_UNIT_TEST.md](./003_REVISE_UNIT_TEST.md) — 単体テスト計画
- [004_REVISE_E2E_TEST.md](./004_REVISE_E2E_TEST.md) — E2E テスト計画 (curl ベース、scope 外明記)
- [AI_LOG セッション](../../AI_LOG/D20260528_048_resume_continuous.md) — 設計判断ログ (CF-20260528-010 経由)

## 注意事項
本レポートのファイルパスと行番号は実装日時時点のもの。

## 変更一覧

### Phase A: 新 endpoint + response shape (重 → メイン直接実装)

- **新規 `api/hub/service-info.ts`** (移動): 旧 `api/service-info.ts` ベース、`HUB_SERVICE_INFO_SECRET` 参照、コメント・JSDoc 全面更新
- **`src/services/serviceInfo/collectMetrics.ts`** (大規模変更):
  - `ServiceInfo` 旧 interface 削除
  - `ServiceInfoResponse` 新 interface 追加 (`schemaVersion: 1` + `metrics[]` + `extra`)
  - `ServiceInfoMetric` 型追加 (`{key, value, unit?}`)
  - MAU 算出 SQL 追加: `count(*) WHERE updated_at > now() - interval '30 days'`
  - response に `metrics[]` で `{mau, users_total, error_count_24h}` を格納、`generated_at` を `extra` へ移動
- **`src/services/serviceInfo/handler.ts`** (型 + コメント): `ServiceInfo` → `ServiceInfoResponse`、env 名・endpoint path のコメント更新 (ロジック変更なし)
- **`src/services/serviceInfo/index.ts`** (export 更新): `ServiceInfo` → `ServiceInfoResponse` / `ServiceInfoMetric` を export
- **`src/services/serviceInfo/handler.test.ts`** (全面更新): 新 shape (`schemaVersion` + `metrics[]` + `extra`) 用テスト、MAU 算出 (U-NEW-4)、境界 (U-NEW-9) を追加
- **新規 `api/hub/service-info.test.ts`**: 新 endpoint 配線テスト (`/api/hub/service-info`、`HUB_SERVICE_INFO_SECRET` 未設定で 503 等)

### Phase B: 旧 endpoint deprecation + env rename (軽 → メイン直接)

- **`api/service-info.ts`** (deprecation stub に置換): 全 method で 410 Gone + `{error:"deprecated", moved_to:"/api/hub/service-info"}` を返す
- **`api/service-info.test.ts`** (全面書き換え): 410 stub の動作確認 (token 検証しない、全 method で 410、集計値返さない)
- **`.env.example`**: `SERVICE_INFO_TOKEN` → `HUB_SERVICE_INFO_SECRET` rename + コメント更新 (perspectives 2026-05-28 改訂注記)
- **`.env.local`**: `SERVICE_INFO_TOKEN` → `HUB_SERVICE_INFO_SECRET` rename (value 流用)

### Phase C: MAU updated_at touch (案 A) — 既存実装で完結、追加コード不要 ✨

**重要な発見** (論点-001 自動解決): `src/services/auth/makeAuth.ts:getOrCreateUser` が既に **認証通過のたびに `users.updated_at` を touch する upsert** を実装済 (`onConflictDoUpdate({ set: { updatedAt: new Date() }})`)。`requireUser` → `getAuthUserId` → `getOrCreateUser` の経路で全 API request で touch が走る。

→ Phase C で計画していた auth middleware への追加実装は **不要**。MAU = 「直近 30 日に認証通過した unique user 数」が自然に成立する。

論点-001 (MAU updated_at touch 戦略) の status を **解決済 (案 A 同等、既存 getOrCreateUser upsert で達成)** に更新。

## 実装計画からの差分

| 項目 | 内容 |
|------|------|
| 計画にない追加変更 | なし |
| 計画から省略した変更 | **Phase C の auth middleware 追加実装** — 既存 `getOrCreateUser` の upsert が同等のロジックを実装済のため不要と判明 (実装中の発見) |
| 想定外の問題と対処 | なし (Phase A の response shape 変更でテスト 12 件書き換えが必要だったが、計画範囲内) |

## PR Description

### タイトル
_shared/service-info: O48 ServiceHUB 2026-05-28 契約改訂への retrofit

### 概要
perspectives.md O48 が 2026-05-28 に改訂 ([D20260528-001/002])。共通シークレット化 + endpoint path 変更 + MAU 自己申告に追従する retrofit を実施。`/flow:audit` の新 contract drift 検出 (CF-20260528-010) で検知され dispatch された Class A 改修。

### 変更内容
- endpoint: `/api/service-info` (410 Gone deprecation stub に置換) → 新 `/api/hub/service-info`
- secret env: `SERVICE_INFO_TOKEN` (廃止) → `HUB_SERVICE_INFO_SECRET` (全サービス共通)
- response: flat shape → `{schemaVersion:1, metrics[]{mau,users_total,error_count_24h}, extra.generated_at}` 構造
- MAU 自己申告: `users.updated_at > now() - interval '30 days'` で算出 (auth `getOrCreateUser` の既存 upsert で touch 完結)
- 旧 URL は 410 Gone でクライアントに新 URL を案内

### テスト
- service-info 関連: 21 tests green (handler.test.ts 9 / api/hub/service-info.test.ts 9 / api/service-info.test.ts 3)
- 全体: 161 tests green (回帰なし)
- build: typecheck + vite build OK
- 新 contract drift 検証: `HUB_SERVICE_INFO_SECRET` 10 occurrences / `/api/hub/service-info` 8 occurrences、旧 signal は deprecation stub の説明テキスト + コメントのみ
