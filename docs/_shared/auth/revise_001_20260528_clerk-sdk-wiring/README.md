# 改修: Clerk SDK 実 wiring (release seam 完成)

- **issue / slug**: 001 / clerk-sdk-wiring
- **実施日**: 2026-05-28
- **対象機能**: ../README.md
- **基準 SPEC**: ../001__shared_auth_SPEC.md
- **改修要望**: O35 inject seam に従って既存実装で **`SessionResolver` interface のみ完成 + 実 Clerk 注入は release 時** と設計された seam を、release P4.7 work として `@clerk/backend` を使う `makeClerkSessionResolver` で完成させる。これにより `composition.ts` 内 `releaseSessionResolver` (throw) を実 SDK 注入に置換 → API 全体で Clerk セッション検証が動作する。
- **状態**: 設計中

## このフォルダに置くドキュメント

- `001_REVISE_SPEC.md` — 変更仕様書
- `002_REVISE_PLAN.md` — 変更計画書
- `003_REVISE_UNIT_TEST.md` — 単体テスト計画
- `004_REVISE_E2E_TEST.md` — E2E テスト計画
- `101_REVISE_IMPL_REPORT.md` — 実装レポート (/flow:tdd で生成予定)

## 関連
- 親機能 INDEX: `../INDEX.md`
- 基準 SPEC: `../001__shared_auth_SPEC.md`
- 関連 composition: `api/_lib/composition.ts` (release seam が throw)
- 並行 revise (loop で順次): _shared/billing (Stripe SDK), _shared/notification (Resend SDK)
- 関連 perspective: O35 (inject seam pattern)
