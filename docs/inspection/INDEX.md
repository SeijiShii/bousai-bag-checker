# inspection ドキュメントインデックス

**最終更新**: 2026-05-27
**生成元**: /flow:concept (初期化) → /flow:feature (設計)

<!-- auto-generated-start -->

## 機能概要
期限リマインド + 季節点検モード(UC2, UC3)。Vercel Cron で期限チェック→notification トリガー。点検チェックリスト→inspection_log。

## ファイル一覧（番号順）
| 番号 | ファイル | 種別 | 状態 | 最終更新 | 短い説明 |
|---|---|---|---|---|---|
| 001 | [001_inspection_SPEC.md](./001_inspection_SPEC.md) | SPEC | 設計済 | 2026-05-27 | 期限リマインド cron + 季節点検 + inspection_log |
| 002 | [002_inspection_PLAN.md](./002_inspection_PLAN.md) | PLAN | 設計済 | 2026-05-27 | dueItems→cron/api→UI の 4 Phase |
| 003 | [003_inspection_UNIT_TEST.md](./003_inspection_UNIT_TEST.md) | UNIT_TEST | 設計済 | 2026-05-27 | dueItems 抽出 + cron 認可 + 所有者分離 |
| 004 | [004_inspection_E2E_TEST.md](./004_inspection_E2E_TEST.md) | E2E_TEST | 設計済 | 2026-05-27 | 季節点検ジャーニー + cron 通知 + L1/L2 |
| 905 | [905_inspection_SPEC_REVIEW.md](./905_inspection_SPEC_REVIEW.md) | SPEC_REVIEW | 完了 | 2026-05-27 | freshness import(R1)、cron 冪等(R2)、通知PII最小化(R3) |
| 101 | [101_inspection_IMPL_REPORT.md](./101_inspection_IMPL_REPORT.md) | IMPL_REPORT | 実装完了 | 2026-05-27 | 期限リマインドcron(冪等)+季節点検、7テスト green |
| 102 | [102_inspection_UNIT_TEST_REPORT.md](./102_inspection_UNIT_TEST_REPORT.md) | UNIT_TEST_REPORT | 実装完了 | 2026-05-27 | 7/7 green(R2冪等) |
| 103 | [103_inspection_E2E_REPORT.md](./103_inspection_E2E_REPORT.md) | E2E_REPORT | E2E green | 2026-05-27 | 点検チェックリスト→完了記録 1 spec pass(cron は unit) |

## サブフォルダ（改修・バグ修正・クレーム判定履歴）
| パス | 種別 | issue/slug | 状態 | 概要 | INDEX |
|---|---|---|---|---|---|
| (なし) |

## 関連
- 親 concept: `../concept.md` §1.3.1
- **依存**: inventory, _shared/notification (優先度4)
- 実装コード: §1.4 参照

## 機能性質タグ
- feature, auth-required, stateful (季節点検の進行状態)

<!-- auto-generated-end -->

<!-- user-edit-start -->
<!-- user-edit-end -->
