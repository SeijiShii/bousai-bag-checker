# feedback ドキュメントインデックス

**最終更新**: 2026-05-27
**生成元**: /flow:concept (初期化) → /flow:feature (設計)

<!-- auto-generated-start -->

## 機能概要
好き嫌い(👍/👎) + バグ報告ウィジェット(UC5, perspectives O40)。送信前 PII scrub(SEC-002)+ レート制限/bot 対策(SEC-004)。MVP は自前 DB + 運用通知(論点-002 案A)。

## ファイル一覧（番号順）
| 番号 | ファイル | 種別 | 状態 | 最終更新 | 短い説明 |
|---|---|---|---|---|---|
| 001 | [001_feedback_SPEC.md](./001_feedback_SPEC.md) | SPEC | 設計済 | 2026-05-27 | 👍/👎+バグ報告+PII scrub+レート制限/bot |
| 002 | [002_feedback_PLAN.md](./002_feedback_PLAN.md) | PLAN | 設計済 | 2026-05-27 | scrub→api→UI の 3 Phase |
| 003 | [003_feedback_UNIT_TEST.md](./003_feedback_UNIT_TEST.md) | UNIT_TEST | 設計済 | 2026-05-27 | PII scrub + レート制限/bot 重点 |
| 004 | [004_feedback_E2E_TEST.md](./004_feedback_E2E_TEST.md) | E2E_TEST | 設計済 | 2026-05-27 | 送信ジャーニー + レート + PII 非混入 + L1/L2 |
| 905 | (spec-review 未) | — | 未 | — | tdd 着手前に /flow:spec-review |

## サブフォルダ（改修・バグ修正・クレーム判定履歴）
| パス | 種別 | issue/slug | 状態 | 概要 | INDEX |
|---|---|---|---|---|---|
| (なし) |

## 関連
- 親 concept: `../concept.md` §1.3.1
- **依存**: _shared/db, _shared/auth (優先度3)
- 実装コード: §1.4 参照

## 機能性質タグ
- feature, analytics

<!-- auto-generated-end -->

<!-- user-edit-start -->
<!-- user-edit-end -->
