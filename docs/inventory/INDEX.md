# inventory ドキュメントインデックス

**最終更新**: 2026-05-27
**生成元**: /flow:concept (初期化) → /flow:feature (設計)

<!-- auto-generated-start -->

## 機能概要
品目登録・編集・一覧(UC1)。期限/数量/保管場所/写真 + カテゴリ別 3種 freshness(論点-001 案A)。他機能(inspection/shopping-list)から参照される基盤機能。

## ファイル一覧（番号順）
| 番号 | ファイル | 種別 | 状態 | 最終更新 | 短い説明 |
|---|---|---|---|---|---|
| 001 | [001_inventory_SPEC.md](./001_inventory_SPEC.md) | SPEC | 設計済 | 2026-05-27 | 品目CRUD+写真+3種freshness+withOwner |
| 002 | [002_inventory_PLAN.md](./002_inventory_PLAN.md) | PLAN | 設計済 | 2026-05-27 | freshness→repo→api→UI の 4 Phase |
| 003 | [003_inventory_UNIT_TEST.md](./003_inventory_UNIT_TEST.md) | UNIT_TEST | 設計済 | 2026-05-27 | freshness 3種×3段階 + 所有者分離100% |
| 004 | [004_inventory_E2E_TEST.md](./004_inventory_E2E_TEST.md) | E2E_TEST | 設計済 | 2026-05-27 | CRUD ジャーニー + IDOR + L1/L2 視覚検証 |
| 905 | [905_inventory_SPEC_REVIEW.md](./905_inventory_SPEC_REVIEW.md) | SPEC_REVIEW | 完了 | 2026-05-27 | greenfield 設計レビュー: freshness/itemSchema 共有・写真 server proxy・lead_days 連動 (R1-R5) |
| 101 | [101_inventory_IMPL_REPORT.md](./101_inventory_IMPL_REPORT.md) | IMPL_REPORT | 実装完了 | 2026-05-27 | freshness+schema+CRUD+UI、18テスト green |
| 102 | [102_inventory_UNIT_TEST_REPORT.md](./102_inventory_UNIT_TEST_REPORT.md) | UNIT_TEST_REPORT | 実装完了 | 2026-05-27 | 18/18 green(SEC-001 100%+freshness網羅) |

## サブフォルダ（改修・バグ修正・クレーム判定履歴）
| パス | 種別 | issue/slug | 状態 | 概要 | INDEX |
|---|---|---|---|---|---|
| (なし) |

## 関連
- 親 concept: `../concept.md` §1.3.1
- **依存**: _shared/db, _shared/auth, _shared/ui (優先度3, 基盤✅)
- 実装コード: §1.4 参照

## 機能性質タグ
- feature, auth-required

<!-- auto-generated-end -->

<!-- user-edit-start -->
<!-- user-edit-end -->
