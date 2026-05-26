# ui (横断) ドキュメントインデックス

**最終更新**: 2026-05-26 20:38
**生成元**: /flow:concept (初期化) → /flow:feature (設計)

<!-- auto-generated-start -->

## 機能概要
UI 基盤・デザイントークン。design-system.md(ティールグリーン) SoT を実装に落とし、shadcn/ui + Tailwind トークン + 基本コンポーネント + lucide/自作 SVG イラスト + O41 入口導線を全機能に提供。

## ファイル一覧（番号順）
| 番号 | ファイル | 種別 | 状態 | 最終更新 | 短い説明 |
|---|---|---|---|---|---|
| 001 | [001__shared_ui_SPEC.md](./001__shared_ui_SPEC.md) | SPEC | 設計済 | 2026-05-26 | トークン + 基本コンポーネント + lucide/SVG + InfoButton(O41) |
| 002 | [002__shared_ui_PLAN.md](./002__shared_ui_PLAN.md) | PLAN | 設計済 | 2026-05-26 | 12ファイル + 3 Phase (tokens→base→layout/illust) |
| 003 | [003__shared_ui_UNIT_TEST.md](./003__shared_ui_UNIT_TEST.md) | UNIT_TEST | 設計済 | 2026-05-26 | トークン/a11y/絵文字不使用検証。視覚回帰は --review-only |
| 004 | (E2E は cross-cutting でスキップ。視覚レビューは /flow:design --review-only) | — | — | — | — |
| 101 | [101__shared_ui_IMPL_REPORT.md](./101__shared_ui_IMPL_REPORT.md) | IMPL_REPORT | 実装完了 | 2026-05-27 | トークン + 基本コンポーネント、13テスト green |
| 102 | [102__shared_ui_UNIT_TEST_REPORT.md](./102__shared_ui_UNIT_TEST_REPORT.md) | UNIT_TEST_REPORT | 実装完了 | 2026-05-27 | 13/13 green(絵文字不使用/a11y/3状態色) |

## サブフォルダ（改修・バグ修正・クレーム判定履歴）
| パス | 種別 | issue/slug | 状態 | 概要 | INDEX |
|---|---|---|---|---|---|
| (なし) |

## 関連
- 親 concept: `../../concept.md` §1.3.2
- **依存**: (なし) (優先度1, 基盤✅)
- 実装コード: §1.4 参照

## 機能性質タグ
- cross-cutting (UI 基盤、副作用なし)

<!-- auto-generated-end -->

<!-- user-edit-start -->
<!-- user-edit-end -->
