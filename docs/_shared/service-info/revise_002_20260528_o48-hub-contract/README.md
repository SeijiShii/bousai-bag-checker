# 改修: O48 ServiceHUB 連携 2026-05-28 契約改訂への retrofit

- **issue / slug**: 002 / o48-hub-contract-2026-05-28
- **実施日**: 2026-05-28
- **対象機能**: `../README.md` (_shared/service-info)
- **基準 SPEC**: `../001__shared_service-info_SPEC.md`
- **過去 revise**: `../revise_audit-p001_20260527_wire-endpoint/` (Vercel Function 配線)
- **改修要望**: perspectives.md O48 が 2026-05-28 に契約改訂 ([D20260528-001/002])。共通シークレット化 + endpoint path 変更 + MAU 自己申告に追従する (CF-20260528-010 で audit が drift 検出)。
- **状態**: 設計中

## 改修サマリ

| 項目 | 旧契約 (現実装) | 新契約 (2026-05-28 改訂) |
|---|---|---|
| endpoint path | `/api/service-info` | `/api/hub/service-info` |
| secret env | `SERVICE_INFO_TOKEN` (per-service) | `HUB_SERVICE_INFO_SECRET` (全サービス共通) |
| response | `{service, status, user_count, error_count_24h, version, generated_at}` | `{schemaVersion, service, status, metrics?[], version?, extra?}` |
| MAU 自己申告 | なし | `metrics[]{key:"mau", value}` 必須 |
| 登録方法 | (本 PJ から HUB へ呼び出し) 該当なし | HUB 側 admin write、サービス側からの呼び出し不要 |

## このフォルダに置くドキュメント

- `001_REVISE_SPEC.md` — 変更仕様書 (変更前 vs 変更後)
- `002_REVISE_PLAN.md` — 変更計画書
- `003_REVISE_UNIT_TEST.md` — 単体テスト計画
- `004_REVISE_E2E_TEST.md` — E2E 計画 (リグレッション中心)
- `101_REVISE_IMPL_REPORT.md` — 実装レポート (/flow:tdd 生成)

## 関連
- 親機能 INDEX: `../INDEX.md`
- 基準 SPEC: `../001__shared_service-info_SPEC.md`
- AUDIT_20260528_1211: 旧 audit (drift 見逃し、CF-20260528-010 で改善)
- AI_LOG: `../../AI_LOG/D20260528_048_resume_continuous.md` (drift 検出 + dispatch 経緯)
