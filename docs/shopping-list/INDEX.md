# shopping-list ドキュメントインデックス

**最終更新**: 2026-05-27
**生成元**: /flow:concept (初期化) → /flow:feature (設計)

<!-- auto-generated-start -->

## 機能概要
期限切れ/不足分から買い物 TODO リスト生成 + 購入状況管理(UC4)。無料機能(D-028)。CSV エクスポートはインジェクションエスケープ(SEC-003)。

## ファイル一覧（番号順）
| 番号 | ファイル | 種別 | 状態 | 最終更新 | 短い説明 |
|---|---|---|---|---|---|
| 001 | [001_shopping-list_SPEC.md](./001_shopping-list_SPEC.md) | SPEC | 設計済 | 2026-05-27 | TODO 生成+購入管理+CSV安全、無料 |
| 002 | [002_shopping-list_PLAN.md](./002_shopping-list_PLAN.md) | PLAN | 設計済 | 2026-05-27 | generate/csv→repo/api→UI の 3 Phase |
| 003 | [003_shopping-list_UNIT_TEST.md](./003_shopping-list_UNIT_TEST.md) | UNIT_TEST | 設計済 | 2026-05-27 | CSV インジェクション + 所有者分離重点 |
| 004 | [004_shopping-list_E2E_TEST.md](./004_shopping-list_E2E_TEST.md) | E2E_TEST | 設計済 | 2026-05-27 | TODO 生成/購入/エクスポート + 無料確認 + IDOR |
| 905 | [905_shopping-list_SPEC_REVIEW.md](./905_shopping-list_SPEC_REVIEW.md) | SPEC_REVIEW | 完了 | 2026-05-27 | freshness import(R1)、generate 重複防止マージ(R2) |
| 101 | [101_shopping-list_IMPL_REPORT.md](./101_shopping-list_IMPL_REPORT.md) | IMPL_REPORT | 実装完了 | 2026-05-27 | TODO生成(重複防止)+購入管理+CSV安全、11テスト green |
| 102 | [102_shopping-list_UNIT_TEST_REPORT.md](./102_shopping-list_UNIT_TEST_REPORT.md) | UNIT_TEST_REPORT | 実装完了 | 2026-05-27 | 11/11 green(R2/R3/SEC-001) |
| 103 | [103_shopping-list_E2E_REPORT.md](./103_shopping-list_E2E_REPORT.md) | E2E_REPORT | E2E green | 2026-05-27 | UC4 生成/購入/無料 3 spec pass |

## サブフォルダ（改修・バグ修正・クレーム判定履歴）
| パス | 種別 | issue/slug | 状態 | 概要 | INDEX |
|---|---|---|---|---|---|
| (なし) |

## 関連
- 親 concept: `../concept.md` §1.3.1
- **依存**: inventory (優先度4)
- 実装コード: §1.4 参照

## 機能性質タグ
- feature, auth-required

<!-- auto-generated-end -->

<!-- user-edit-start -->
<!-- user-edit-end -->
