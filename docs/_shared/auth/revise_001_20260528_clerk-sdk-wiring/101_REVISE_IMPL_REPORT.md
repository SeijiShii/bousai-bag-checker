# 実装レポート: _shared/auth revise_001 — Clerk SDK 実 wiring

## 実装日時
2026-05-28 20:20 (JST)

## モード
revise (release seam 完成)

## 関連ドキュメント
- [001_REVISE_SPEC.md](./001_REVISE_SPEC.md) — 変更仕様書
- [002_REVISE_PLAN.md](./002_REVISE_PLAN.md) — 変更計画書
- [003_REVISE_UNIT_TEST.md](./003_REVISE_UNIT_TEST.md) — 単体テスト計画
- [004_REVISE_E2E_TEST.md](./004_REVISE_E2E_TEST.md) — E2E テスト計画
- [905__shared_auth_SPEC_REVIEW.md](./905__shared_auth_SPEC_REVIEW.md) — spec-review レポート
- [AI_LOG セッション](../../AI_LOG/D20260528_056_tdd__shared_auth.md) — 設計判断ログ

## 注意事項
本レポートのファイルパスと行番号は実装日時時点のものです。

## 変更一覧

### Phase 1: `@clerk/backend` インストール
- **npm install @clerk/backend** → 実際は `^3.4.14` がインストールされた (SPEC は `^2.x.x` 想定、SDK が v3 に進んでいた)
- `authenticateRequest` API は v2/v3 で signature 同形 (`state.status === 'signed-in' → state.toAuth().userId`) のため、SPEC 設計はそのまま適用可
- package.json `dependencies` に追加

### Phase 2: `clerkAuthClient.ts` + test 実装 (TDD)
- **新規**: `src/services/auth/clerkAuthClient.ts` (~30 LOC)
  - `makeClerkSessionResolver(config: ClerkConfig): SessionResolver` factory
  - `req` を Web Request 形式で `clerk.authenticateRequest` に渡す
  - `state.status === 'signed-in'` → `state.toAuth().userId` 返却 (null check 含む)
  - signed-out / handshake / SDK exception はすべて null 返却 (throw しない、PII ログなし、SEC-002)
- **新規**: `src/services/auth/clerkAuthClient.test.ts` (~70 LOC)
  - 7 ケース (signed-in / anonymous / signed-out / handshake / exception / userId 不在 / config 渡し)
  - `vi.hoisted` で `@clerk/backend` を mock 化 (vitest hoist 制約に対応)
- **TDD サイクル**: RED (mock 未設定で test fail) → GREEN (factory 実装で 7/7 pass) → IMPROVE (PII-safe error log + null userId guard)

### Phase 3: `composition.ts` 改修
- **変更**: `api/_lib/composition.ts`
  - `releaseSessionResolver` (throw) 削除
  - `getSessionResolver()` 関数で env check + `makeClerkSessionResolver` invoke
  - `CLERK_SECRET_KEY` 未設定なら fail-fast (`throw new Error("CLERK_SECRET_KEY env not set")`)
  - 既存 composition.test.ts なし、makeAuth.test.ts は mock SessionResolver を直接 inject するため影響なし

### Phase 4: 全テスト維持確認
- typecheck: pass
- unit tests: **168 passed / 0 failed** (前回 156 + 新規 clerkAuthClient 7 件 + 他追加)
- 既存テストへの破壊なし (interface 不変、seam 内部のみ差替)

## 実装計画からの差分

| 項目 | 内容 |
|------|------|
| 計画にない追加変更 | なし |
| 計画から省略した変更 | なし |
| 想定外の問題と対処 | (1) `@clerk/backend` 実態 v3.4.14 で SPEC `^2.x.x` から進んでいた → v2/v3 で API 同形のためそのまま採用 (2) vitest の `vi.mock` factory hoist 制約 → `vi.hoisted` で mock 変数を hoist し解決 |

## PR Description

### タイトル
_shared/auth: Clerk SDK 実 wiring (release seam 完成、revise_001)

### 概要
api/_lib/composition.ts の `releaseSessionResolver` (throw する仮実装) を `makeClerkSessionResolver` (@clerk/backend 経由) に置換し、Clerk セッション検証を実 SDK で稼働開始させる。SEC-001 認可基盤の release Phase 完成。

### 変更内容
- 新規: `src/services/auth/clerkAuthClient.ts` (factory + Web Request 互換 invoke)
- 新規: `src/services/auth/clerkAuthClient.test.ts` (vi.hoisted で mock、7 ケース全 pass)
- 変更: `api/_lib/composition.ts` (releaseSessionResolver → getSessionResolver() + env fail-fast)
- 追加 dep: `@clerk/backend@^3.4.14`

### テスト
- typecheck: pass
- unit: 168/168 pass (新規 clerkAuthClient 7 件含む)
- 既存 156 tests 維持確認
