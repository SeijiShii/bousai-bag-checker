# 改修: Stripe SDK 実 wiring (release seam 完成)

- **issue / slug**: 001 / stripe-sdk-wiring
- **実施日**: 2026-05-28
- **対象機能**: ../README.md
- **基準 SPEC**: ../001__shared_billing_SPEC.md
- **改修要望**: O35 inject seam パターンに従い `PaymentGateway` interface のみ完成済の seam を `stripe` SDK で実装注入。composition.ts の gateway コメントを `makeStripeGateway` 実装に置換。auth revise_001 (Clerk wiring) と同形 pattern (CF-016 R3 で予告された後続 revise の 1 件)。
- **状態**: 設計完了 (実装は /flow:tdd で)

## 関連
- 親機能 INDEX: `../INDEX.md`
- 基準 SPEC: `../001__shared_billing_SPEC.md`
- 並行 revise (完了): `../../auth/revise_001_20260528_clerk-sdk-wiring/` (Clerk SDK、同形 pattern)
- 並行 revise (予定): `../../notification/revise_*_*_resend-sdk-wiring/` (Resend、同形)
- 関連 perspective: O35 (inject seam pattern)
