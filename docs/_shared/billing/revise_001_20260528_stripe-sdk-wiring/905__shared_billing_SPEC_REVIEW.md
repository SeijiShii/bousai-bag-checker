<!-- auto-generated-start -->
# 設計レビューレポート — _shared/billing revise_001 Stripe SDK 実 wiring

**レビュー日**: 2026-05-28
**レビュー実施者**: Claude (Opus 4.7 1M) + seiji
**対象**: `_shared/billing/revise_001_20260528_stripe-sdk-wiring/`
**入力**: 001_REVISE_SPEC + 002_REVISE_PLAN + 003_REVISE_UNIT_TEST + 004_REVISE_E2E_TEST + concept.md + 既存実装 (`src/services/billing/*`, `api/_lib/composition.ts`)
**観点ソース**: 組み込みチェックリスト + `~/.claude/review-perspectives.md` (P1..P5)
**モード**: auto-pick (--auto)
**severity-threshold**: low

## 1. レビューサマリー

| 観点 | 評価 | 備考 |
|------|------|------|
| 仕様の明確性 | OK | factory signature / StripeConfig / env 要件 / API 詳細すべて明確 |
| 既存パターンとの一貫性 | OK | O35 inject seam (auth revise_001 と同形 pattern)、makeBilling との責務分離維持 |
| API 設計 | OK | factory + ConfigInterface パターン (clerk と同じ) |
| エラーハンドリング | OK | webhook 失敗時 null + PII なし、payment_status guard あり |
| テストカバレッジ | OK | 8 ケース (createCheckout 正常/ゲスト + verifyWebhook 4 分岐 + 境界) |
| 影響範囲・副作用 | OK | composition.ts seam 1 箇所、PaymentGateway interface 不変で破壊リスクなし |
| API 流用・責務逸脱 | OK | factory は Stripe API adapter のみ、責務逸脱なし |
| 既存実装の再利用 | OK | PaymentGateway / CheckoutSession / VerifiedTip / makeBilling 全て再利用 |
| データ移行・互換性 | OK | 不要 |
| 学習済み観点 (P1-P5) | N/A | 本 revise scope 外 |

**結論**: auth revise_001 と同形 pattern + 設計品質高、Info 級 2 件のみ (実装時の明確性向上)。

## 2. 指摘事項 (severity 降順)

### [R1] Info: `stripe` SDK バージョン pin 明示

- **対象**: `002_REVISE_PLAN.md` §5 Phase 1
- **現状**: 「バージョン: latest stable (確認後 SPEC 反映)」と曖昧
- **問題**: stripe SDK は major version で signature 変動の可能性、明示なしだと audit drift 検知不可
- **推奨**: PLAN §5 Phase 1 に「`^17.x.x` 系 (現行安定版、Node.js 18+ 対応) を採用、major 上げは別 revise」を明示 (auth R2 と同 pattern)
- **chosen**: 推奨を PLAN §5 に追記
- **反映先**: `002_REVISE_PLAN.md` §5

### [R2] Info: stripe `apiVersion` 明示推奨

- **対象**: `001_REVISE_SPEC.md` §7.1 `new Stripe(config.secretKey)` 部分
- **現状**: `new Stripe(config.secretKey)` (apiVersion 未指定 = SDK default を使用)
- **問題**: Stripe API は破壊的変更ありえる、明示的に `apiVersion: '2024-XX-XX.acacia'` のような最新安定版を pin することで予期せぬ挙動変化を防ぐ (Stripe 公式推奨)
- **推奨**: SPEC §7.1 snippet に `new Stripe(config.secretKey, { apiVersion: '2024-12-18.acacia' })` (実装時に Stripe SDK latest が指す basil/acacia を確認して指定) を反映
- **chosen**: 推奨を SPEC §7.1 に追記
- **反映先**: `001_REVISE_SPEC.md` §7.1

## 3. コードベース調査結果

### 3.1 既存パターン
- `src/services/auth/clerkAuthClient.ts` の factory pattern (R1 = req 型 narrowing、R2 = version pin、R3 = 後続 revise 予告): 完全に踏襲可
- `src/services/billing/makeBilling.test.ts` の mock PaymentGateway pattern: `{ createCheckout: async (...) => {...}, verifyWebhook: (...) => {...} }` — Stripe gateway test も `vi.hoisted` で `stripe` を mock 化する同 pattern

### 3.2 影響範囲分析

| 変更対象 | 既存呼び出し箇所 | 呼び出し元前提 | 破壊リスク |
|---|---|---|---|
| `PaymentGateway` interface | makeBilling.ts (注入), makeBilling.test.ts (mock), paymentGateway.ts (定義), composition.ts (注入箇所) | `createCheckout` + `verifyWebhook` の 2 method、interface 不変 | **なし** |
| `composition.ts` の gateway 注入 | composition() 内 1 箇所 (現状コメント、未注入) | makeApiCore に optional gateway を渡す | **なし** (optional 引数、既存テストは mock 直接 inject) |

### 3.3 API 責務の評価
- `makeStripeGateway` の責務 = 「Stripe API adapter」のみ。`makeBilling` の DB 記録 / 冪等性 / 投げ銭 100円固定は makeBilling 側に既存実装 = 責務分離維持。

## 4. 設計判断ログ

| # | 判断項目 | 結論 | chosen_type | 反映先 |
|---|---|---|---|---|
| D1 | stripe SDK バージョン pin (R1) | `^17.x.x` 系明示 | auto-recommended | 002_REVISE_PLAN.md §5 |
| D2 | stripe apiVersion 明示 (R2) | SPEC §7.1 snippet に apiVersion 追加 | auto-recommended | 001_REVISE_SPEC.md §7.1 |

## 5. 次のステップ
- 反映済み 001/002 を確認 (R1/R2 コメント付与)
- `/flow:tdd _shared/billing/revise_001_20260528_stripe-sdk-wiring` で実装着手

<!-- auto-generated-end -->
