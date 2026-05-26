# db (横断) ドキュメントインデックス

**最終更新**: 2026-05-26 20:32
**生成元**: /flow:concept (初期化) → /flow:feature (設計)

<!-- auto-generated-start -->

## 機能概要
DB スキーマ・マイグレーション基盤。Neon(Postgres) 7 テーブル・Drizzle スキーマ・インデックス + 所有者強制クエリヘルパ withOwner (SEC-001) を全機能に提供。

## ファイル一覧（番号順）
| 番号 | ファイル | 種別 | 状態 | 最終更新 | 短い説明 |
|---|---|---|---|---|---|
| 001 | [001__shared_db_SPEC.md](./001__shared_db_SPEC.md) | SPEC | 設計済 | 2026-05-26 | 7テーブル + withOwner 所有者強制 + 投げ銭(donations) |
| 002 | [002__shared_db_PLAN.md](./002__shared_db_PLAN.md) | PLAN | 設計済 | 2026-05-26 | src/db/ 9ファイル + 4 Phase (schema→client→withOwner→migrate) |
| 003 | [003__shared_db_UNIT_TEST.md](./003__shared_db_UNIT_TEST.md) | UNIT_TEST | 設計済 | 2026-05-26 | 所有者分離(SEC-001)を100%カバー、pglite で制約検証 |
| 004 | (E2E は cross-cutting のためスキップ。統合テストは機能側 E2E でカバー) | — | — | — | — |

## サブフォルダ（改修・バグ修正・クレーム判定履歴）
| パス | 種別 | issue/slug | 状態 | 概要 | INDEX |
|---|---|---|---|---|---|
| (なし) |

## 関連
- 親 concept: `../../concept.md` §1.3.2
- **依存**: (なし) (優先度1, 基盤✅)
- 実装コード: §1.4 参照

## 機能性質タグ
- cross-cutting, auth-required (所有者分離 SEC-001)

<!-- auto-generated-end -->

<!-- user-edit-start -->
<!-- user-edit-end -->
