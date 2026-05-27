# 改修: O48 service-info エンドポイント配線 (api/service-info.ts)

- **issue / slug**: audit-p001 / wire-endpoint
- **実施日**: 2026-05-27
- **対象機能**: ../README.md (_shared/service-info)
- **基準 SPEC**: ../001__shared_service-info_SPEC.md
- **改修要望**: AUDIT_20260527_1549.md [AUDIT-perspective-001] (High)。core handler (`handleServiceInfo` + `collectMetrics`、7 unit green) は実装済だが `api/service-info.ts` Vercel Function が未配線で、service-hub が `GET /api/service-info` を実行時 pull できない (404)。endpoint を配線する。
- **状態**: 設計中

## このフォルダに置くドキュメント
- `001_REVISE_SPEC.md` — 変更仕様 (endpoint 配線、トークン抽出、fail-closed)
- `002_REVISE_PLAN.md` — 変更計画 (新規 api/service-info.ts + smoke test)
- `003_REVISE_UNIT_TEST.md` — テスト計画 (配線スモーク: token 抽出 / 401 / 200 / 405 / 503)
- (E2E は cross-cutting API のため N/A。契約スモークでカバー = 元 feature 方針踏襲)

## 関連
- AUDIT レポート: ../../../AUDIT_20260527_1549.md#audit-perspective-001
- 元 feature: D20260527_012_feature__shared_service-info / D20260527_025_tdd__shared_service-info
- no-key Class A (実 Clerk/Stripe/Resend 不要、SERVICE_INFO_TOKEN は設定可能な共有シークレット)
