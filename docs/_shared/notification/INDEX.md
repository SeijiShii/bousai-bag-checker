# notification (横断) ドキュメントインデックス

**最終更新**: 2026-05-26 20:42
**生成元**: /flow:concept (初期化) → /flow:feature (設計)

<!-- auto-generated-start -->

## 機能概要
通知基盤。メール(Resend)+ アプリ内通知、購読 ON/OFF、配信履歴。Web Push 不採用。SEC-002 (PII マスク/Sentry beforeSend、論点-005) の実装担当。

## ファイル一覧（番号順）
| 番号 | ファイル | 種別 | 状態 | 最終更新 | 短い説明 |
|---|---|---|---|---|---|
| 001 | [001__shared_notification_SPEC.md](./001__shared_notification_SPEC.md) | SPEC | 設計済 | 2026-05-26 | Resend+アプリ内+購読+配信履歴+PII マスク(SEC-002) |
| 002 | [002__shared_notification_PLAN.md](./002__shared_notification_PLAN.md) | PLAN | 設計済 | 2026-05-26 | PII マスク最優先の 4 Phase、notifications/email_deliveries 追加 |
| 003 | [003__shared_notification_UNIT_TEST.md](./003__shared_notification_UNIT_TEST.md) | UNIT_TEST | 設計済 | 2026-05-26 | PII マスク(SEC-002)100%カバー、購読/送信/所有者分離 |
| 004 | (E2E は cross-cutting でスキップ。統合は inspection 側 E2E でカバー) | — | — | — | — |
| 101 | [101__shared_notification_IMPL_REPORT.md](./101__shared_notification_IMPL_REPORT.md) | IMPL_REPORT | 実装完了(core) | 2026-05-27 | PII マスク + 購読/送信/in-app、12テスト green。実Resendはrelease |
| 102 | [102__shared_notification_UNIT_TEST_REPORT.md](./102__shared_notification_UNIT_TEST_REPORT.md) | UNIT_TEST_REPORT | 実装完了 | 2026-05-27 | 12/12 green(SEC-002 PII 100%) |

## サブフォルダ（改修・バグ修正・クレーム判定履歴）
| パス | 種別 | issue/slug | 状態 | 概要 | INDEX |
|---|---|---|---|---|---|
| (なし) |

## 関連
- 親 concept: `../../concept.md` §1.3.2
- **依存**: _shared/db (優先度2, 基盤✅)
- 実装コード: §1.4 参照

## 機能性質タグ
- cross-cutting, auth-required (購読/通知は user-scoped)

<!-- auto-generated-end -->

<!-- user-edit-start -->
<!-- user-edit-end -->
