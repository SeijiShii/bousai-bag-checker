# 改修: Resend SDK 実 wiring (release seam 完成)

- **issue / slug**: 001 / resend-sdk-wiring
- **実施日**: 2026-05-28
- **対象機能**: ../README.md
- **基準 SPEC**: ../001__shared_notification_SPEC.md
- **改修要望**: auth/billing と同形 pattern。composition.ts の sender 注入を Resend SDK 経由 makeResendSender 実装に置換。composition の SDK seam (Clerk/Stripe/Resend) 3 つ目で完成。
- **状態**: 設計中

## 関連
- 親機能: ../README.md
- 完了済 revise: ../../auth/revise_001_clerk-sdk-wiring/, ../../billing/revise_001_stripe-sdk-wiring/
- 残: Upstash rate limit (任意、後続検討)
