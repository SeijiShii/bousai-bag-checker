# 実装レポート: _shared/billing revise_001 — Stripe SDK 実 wiring

## 実装日時
2026-05-28 20:46 (JST)

## モード
revise (release seam 完成、auth と同形)

## 関連ドキュメント
- 001_REVISE_SPEC.md / 002_REVISE_PLAN.md / 003_REVISE_UNIT_TEST.md / 004_REVISE_E2E_TEST.md
- 905__shared_billing_SPEC_REVIEW.md
- AI_LOG: ../../AI_LOG/D20260528_061_tdd__shared_billing.md

## 変更一覧

### Phase 1: stripe SDK インストール
- `npm install stripe` → 実態 `^22.2.0` (SPEC `^17` 想定だが latest)
- `Stripe.LatestApiVersion` = `2026-05-27.dahlia` を採用 (apiVersion pin、spec-review R2)

### Phase 2: stripeGateway.ts + test (TDD)
- 新規: `src/services/billing/stripeGateway.ts` (~50 LOC)
- 新規: `src/services/billing/stripeGateway.test.ts` (9 ケース、vi.hoisted で stripe mock)
- TDD: RED (mock 未設定) → GREEN (factory 実装で 9/9 pass) → IMPROVE (PII-safe error log)

### Phase 3: composition.ts 改修
- `getGateway()` 関数追加 (env 未設定なら undefined → handler 側で 503 想定)
- `makeApiCore(db, { gateway: getGateway() })` に変更
- makeBilling.test の mock PaymentGateway は引き続き機能、interface 不変

### Phase 4: 全テスト維持確認
- typecheck pass
- unit: **177/177 pass** (168 → +9 stripeGateway)
- 既存破壊なし (interface 不変、seam 内部のみ差替)

## 実装計画からの差分

| 項目 | 内容 |
|------|------|
| 計画にない追加変更 | なし |
| 計画から省略 | なし |
| 想定外 | (1) stripe v22 (SPEC v17 想定から進んでいた、API 同形) (2) apiVersion = `2026-05-27.dahlia` (SPEC 例の acacia から更新) |

## PR Description

### タイトル
_shared/billing: Stripe SDK 実 wiring (release seam 完成、revise_001)

### 変更内容
- 新規: stripeGateway.ts (makeStripeGateway factory) + test (9 ケース)
- 変更: composition.ts gateway 注入 (getGateway() で env チェック)
- 追加 dep: stripe@^22.2.0

### テスト
- typecheck pass
- unit: 177/177 (前回 168 + 新規 9) green
