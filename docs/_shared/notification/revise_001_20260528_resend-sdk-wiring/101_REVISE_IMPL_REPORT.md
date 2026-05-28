# 実装レポート: _shared/notification revise_001 — Resend SDK 実 wiring

## 実装日時 / モード
2026-05-28 20:55 (JST) / revise (release seam 完成、3 つ目同形)

## 変更一覧

### Phase 1: resend SDK インストール
- `npm install resend` → `^6.12.4`

### Phase 2: resendSender.ts + test (TDD)
- 新規: `src/services/notification/resendSender.ts` (~30 LOC)
- 新規: `src/services/notification/resendSender.test.ts` (5 ケース)
- TDD: RED → GREEN (5/5) → IMPROVE (PII-safe error.name のみ)

### Phase 3: composition.ts sender 注入
- `getSender()` 関数追加 (RESEND_API_KEY + RESEND_FROM_ADDRESS env チェック)
- `makeApiCore(db, { gateway, sender })` に sender 追加
- 残コメントを「rateLimiter (Upstash) は任意・後続検討」に更新

### Phase 4: 全テスト維持確認
- typecheck pass / **182 tests green** (177 → +5 resendSender)

## 計画からの差分

| 項目 | 内容 |
|---|---|
| 計画 vs 実態 | resend `^4.x.x` 想定 → 実態 `^6.12.4` (latest)、API 同形 |

## composition SDK seam 完成

| SDK | factory | revise | 完成日 |
|---|---|---|---|
| Clerk auth | makeClerkSessionResolver | auth/revise_001 | 2026-05-28 |
| Stripe billing | makeStripeGateway | billing/revise_001 | 2026-05-28 |
| Resend notification | makeResendSender | notification/revise_001 | 2026-05-28 |

→ release Phase 1 で実 keys FILL → 全機能稼働可能

## PR Description

### タイトル
_shared/notification: Resend SDK 実 wiring (revise_001、composition seam 3/3 完成)

### 変更内容
- 新規: resendSender.ts + test (5 ケース、vi.hoisted で mock)
- 変更: composition.ts に getSender() 追加 + sender 注入
- 追加 dep: resend@^6.12.4

### テスト
- typecheck pass
- unit: 182/182 (177 → +5) green
