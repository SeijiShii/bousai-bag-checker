# i18n (横断) ドキュメントインデックス

**最終更新**: 2026-05-27
**生成元**: /flow:concept (初期化) → /flow:feature (設計) → /flow:tdd (実装完了)
**状態**: 実装完了 (unit green、E2E は /flow:e2e で実行)

<!-- auto-generated-start -->

## 機能概要 (短縮、詳細は README.md)
多言語基盤(4 言語: ja 正本/en/zh-Hans/ko)。react-i18next + カタログ + ロケール検出 + 言語切替 UI + 日付/数値整形 + 全 UI 文字列キー化。法務長文は JA 正本(対象外)。

## ファイル一覧（番号順）
| 番号 | ファイル | 種別 | 状態 | 最終更新 | 短い説明 |
|---|---|---|---|---|---|
| 001 | [001__shared_i18n_SPEC.md](./001__shared_i18n_SPEC.md) | SPEC | 設計済 | 2026-05-27 | 4 言語/react-i18next、提供 IF + カタログ構造 + 文字列抽出インベントリ(校正4件反映) |
| 002 | [002__shared_i18n_PLAN.md](./002__shared_i18n_PLAN.md) | PLAN | 設計済 | 2026-05-27 | 5 Phase (基盤→翻訳→Switcher→t()置換→法務注記) |
| 003 | [003__shared_i18n_UNIT_TEST.md](./003__shared_i18n_UNIT_TEST.md) | UNIT_TEST | 設計済 | 2026-05-27 | 検出/正規化/フォールバック/キー集合一致(品質ゲート) |
| 004 | [004__shared_i18n_E2E_TEST.md](./004__shared_i18n_E2E_TEST.md) | E2E_TEST | 設計済 | 2026-05-27 | 言語切替ジャーニー S1-S7 (切替/永続/検出/法務JA正本/enumラベル) |
| 905 | [905__shared_i18n_SPEC_REVIEW.md](./905__shared_i18n_SPEC_REVIEW.md) | SPEC_REVIEW | 完了 | 2026-05-27 | R1抽出漏れ7キー/R2 aria interpolation/R3 Zod=キー格納→001反映 |
| 101 | [101__shared_i18n_IMPL_REPORT.md](./101__shared_i18n_IMPL_REPORT.md) | IMPL_REPORT | 実装完了 | 2026-05-27 | 基盤+4ロケール+Switcher+全UI t()化+法務JA正本、156 green |
| 102 | [102__shared_i18n_UNIT_TEST_REPORT.md](./102__shared_i18n_UNIT_TEST_REPORT.md) | UNIT_TEST_REPORT | 実装完了 | 2026-05-27 | i18n 11 + 全体 156 green、キー集合一致ゲート |

## サブフォルダ（改修・バグ修正・クレーム判定履歴）
| パス | 種別 | issue/slug | 状態 | 概要 | INDEX |
|---|---|---|---|---|---|
| (なし) |

## 関連
- 親 concept: `../../concept.md` §1.3.2 i18n 行
- **依存**: (なし、基盤 優先度1)
- **被依存**: 全 UI (screens/components/features)
- 実装コード: `src/i18n/` 等

## 機能性質タグ
- cross-cutting (i18n 基盤、全 UI 横断)

<!-- auto-generated-end -->

<!-- user-edit-start -->
<!-- user-edit-end -->
