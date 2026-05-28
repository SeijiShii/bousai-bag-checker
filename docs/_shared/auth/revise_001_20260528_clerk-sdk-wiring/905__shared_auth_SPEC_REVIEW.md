<!-- auto-generated-start -->
# 設計レビューレポート — _shared/auth revise_001 Clerk SDK 実 wiring

**レビュー日**: 2026-05-28
**レビュー実施者**: Claude (Opus 4.7 1M) + seiji
**対象**: `_shared/auth/revise_001_20260528_clerk-sdk-wiring/` (4 文書)
**入力**: 001_REVISE_SPEC + 002_REVISE_PLAN + 003_REVISE_UNIT_TEST + 004_REVISE_E2E_TEST + concept.md + 既存実装 (`src/services/auth/*`, `api/_lib/composition.ts`)
**観点ソース**: 組み込みチェックリスト + `~/.claude/review-perspectives.md` (P1..P5)
**モード**: auto-pick
**severity-threshold**: low (Info を含む)

## 1. レビューサマリー

| 観点 | 評価 | 備考 |
|------|------|------|
| 仕様の明確性 | OK | factory signature / ClerkConfig / env 要件すべて明確 |
| 既存パターンとの一貫性 | OK | O35 inject seam (既存 makeAuth pattern) を踏襲 |
| API 設計 | OK | factory + Config interface のシンプル形 |
| エラーハンドリング | OK | null on failure、SDK exception は握り潰して null + console.error (PII なし、SEC-002) |
| テストカバレッジ | OK | C-001〜C-201 で正常/異常/境界を網羅、mock pattern も既存 `mockSession` と整合 |
| 影響範囲・副作用 | OK | `composition.ts` の seam 1 箇所のみ、interface (`SessionResolver`) 不変で呼び出し元破壊リスクなし |
| API 流用・責務逸脱 | OK | factory は session 解決のみ、責務逸脱なし |
| 既存実装の再利用 | OK | `SessionResolver` interface / `UnauthorizedError` / `makeAuth` すべて既存を再利用 |
| データ移行・互換性 | OK | 不要 (DB / 設定 / ストレージ変更なし) |
| 権限・認可 | OK | Clerk verify が認可基盤、SEC-001 入口として機能開始 |
| 学習済み観点 (P1-P5) | N/A | P1 計算ロジック / P2 重複網羅 / P3 既存 API 検索 / P4 ファイル肥大 / P5 読み書き整合、いずれも本 revise の scope 外 |

**結論**: 設計品質高、破壊リスクなし、tdd 着手可。指摘は **Info 級 3 件のみ** (実装時の明確性を高める軽微な補強)。

## 2. 指摘事項 (severity 降順)

### [R1] Info: `req` から Authorization header / Cookie を抽出する path を SPEC §7.1 に明示

- **対象**: `001_REVISE_SPEC.md` §7.1 `makeClerkSessionResolver` snippet
- **現状**: コメントで「Vercel ApiReq 互換」と書かれているが、`req: unknown` から具体的にどう header / cookie を抽出するかが SPEC に未記載
- **問題**: 実装時に `req as { headers?: Record<string,string> }` 型 narrowing を挟むか、`@clerk/backend` の `authenticateRequest({ request, ... })` に Web Request 形式で渡すかが暗黙判断になる
- **推奨**: SPEC §7.1 に「`req` を `{ headers, url, method }` 形式で `authenticateRequest` の `request` プロパティに渡す (Web Request 互換 minimum subset)、Vercel ApiReq は標準で同形式を満たす」と 1 行明示
- **種別**: 指摘事項 (auto-pick で自動反映)
- **chosen**: 推奨を SPEC §7.1 に追記
- **反映先**: `001_REVISE_SPEC.md` §7.1

### [R2] Info: `@clerk/backend` バージョン pin 明示

- **対象**: `002_REVISE_PLAN.md` §5 Phase 1 (npm install)
- **現状**: `npm install @clerk/backend` とだけ書かれている
- **問題**: SDK signature 変動 (major version) により `authenticateRequest` API が変わると retrofit 必要、バージョン pin を SPEC に書いておくと監査 + audit drift 検出に役立つ
- **推奨**: PLAN §5 Phase 1 に「`^2.x.x` 系 (現行安定版) を採用、major 上げは別 revise で扱う」と注記
- **種別**: 指摘事項 (auto-pick で自動反映)
- **chosen**: 推奨を PLAN §5 に追記
- **反映先**: `002_REVISE_PLAN.md` §5

### [R3] Info: 後続 revise (billing/notification/upstash) で同 factory pattern を踏襲する想定を §3 影響範囲に明示

- **対象**: `001_REVISE_SPEC.md` §3 影響範囲
- **現状**: 本 revise の影響範囲だけが列挙されている
- **問題**: composition.ts は 4 SDK seam (Stripe/Resend/Clerk/Upstash) を集約する場所。本 revise (Clerk) のあと **billing/notification/upstash 用の同形 factory revise が続く** ことを明示しないと、後続 spec-review で重複指摘が出るリスク
- **推奨**: SPEC §3 影響範囲下に「後続 revise で同 factory pattern (Class A no-key) を踏襲: `_shared/billing` (`makeStripeGateway`)、`_shared/notification` (`makeResendSender`)、任意で Upstash rate limiter」と 1 行追記
- **種別**: 指摘事項 (auto-pick で自動反映)
- **chosen**: 推奨を SPEC §3 に追記
- **反映先**: `001_REVISE_SPEC.md` §3

## 3. コードベース調査結果

### 3.1 既存パターン
- `src/services/auth/makeAuth.test.ts` の `mockSession(clerkUserId)` パターン: `SessionResolver` interface を直接実装する単純 object — 本 revise の `makeClerkSessionResolver` test (mock 化) もこの pattern を継承する設計で整合。
- O35 inject seam pattern (perspectives): factory + Config injection + interface decouple — 本 revise の `makeClerkSessionResolver(config)` は完全踏襲。
- `composition.ts` の lazy singleton (cached) pattern: 既存 `cached` 変数 + null check — 本 revise も同 pattern を維持。

### 3.2 影響範囲分析

| 変更対象 | 既存呼び出し箇所 | 呼び出し元の前提 (契約) | 破壊リスク |
|---|---|---|---|
| `SessionResolver` interface | makeAuth.ts (注入), makeAuth.test.ts (mock), index.ts (export), authClient.ts (定義), composition.ts (注入箇所) — 計 5 ファイル | `resolveClerkUserId(req: unknown): Promise<string \| null>` の単一 method | **なし** (interface 不変、内部実装のみ追加) |
| `composition.ts` の `releaseSessionResolver` | composition() 内 1 箇所 | `SessionResolver` 互換 object を `makeAuth` に渡す | **なし** (interface 不変、object 差し替えのみ) |

### 3.3 API 責務の評価
- `makeClerkSessionResolver` の責務 = 「Clerk session 検証 + userId 抽出」のみ。`makeAuth` の `getOrCreateUser` (DB upsert) や `requireUser` (UnauthorizedError throw) には責務を持ち込まない = O35 単一責務原則に従う。
- 流用懸念なし (新規 factory が他用途に流用されるルートなし)。

## 4. 設計判断ログ

| # | 判断項目 | 結論 | chosen_type | 反映先 |
|---|---|---|---|---|
| D1 | req 型 narrowing の明示 (R1) | SPEC §7.1 に Web Request minimum subset 明示 | auto-recommended | 001_REVISE_SPEC.md §7.1 |
| D2 | @clerk/backend version pin (R2) | PLAN §5 に `^2.x.x` 系明示 | auto-recommended | 002_REVISE_PLAN.md §5 |
| D3 | 後続 revise pattern 踏襲明記 (R3) | SPEC §3 に billing/notification/upstash の同形 factory を予告 | auto-recommended | 001_REVISE_SPEC.md §3 |

## 5. 次のステップ
- 反映済み `001_REVISE_SPEC.md` / `002_REVISE_PLAN.md` を確認 (R1/R2/R3 コメント付与)
- `/flow:tdd _shared/auth/revise_001_20260528_clerk-sdk-wiring` で実装着手

<!-- auto-generated-end -->
