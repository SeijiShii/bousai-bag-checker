# service-info (横断) ドキュメントインデックス

**最終更新**: 2026-05-27
**生成元**: /flow:concept (初期化) → /flow:feature (設計)

<!-- auto-generated-start -->

## 機能概要
service-hub 連携(O48)。GET /api/service-info(アプリ層指標を HUB が pull、契約 SoT=service-hub)。MVP は最小スキーマ先行(論点-003)、共有トークン+レート制限+PII 非混入。

## ファイル一覧（番号順）
| 番号 | ファイル | 種別 | 状態 | 最終更新 | 短い説明 |
|---|---|---|---|---|---|
| 001 | [001__shared_service-info_SPEC.md](./001__shared_service-info_SPEC.md) | SPEC | 設計済 | 2026-05-27 | MVP 最小スキーマ + 認可スコープ(SEC-004) + PII 非混入 |
| 002 | [002__shared_service-info_PLAN.md](./002__shared_service-info_PLAN.md) | PLAN | 設計済 | 2026-05-27 | 集計 + 認可エンドポイントの 2 Phase |
| 003 | [003__shared_service-info_UNIT_TEST.md](./003__shared_service-info_UNIT_TEST.md) | UNIT_TEST | 設計済 | 2026-05-27 | PII 非混入 + 認可スコープ重点 |
| 004 | (E2E は cross-cutting でスキップ。スモーク/契約テストでカバー) | — | — | — | — |
| 101 | [101__shared_service-info_IMPL_REPORT.md](./101__shared_service-info_IMPL_REPORT.md) | IMPL_REPORT | 実装完了 | 2026-05-27 | MVP最小+認可+PII非混入+共通レート制限、7テスト green |
| 102 | [102__shared_service-info_UNIT_TEST_REPORT.md](./102__shared_service-info_UNIT_TEST_REPORT.md) | UNIT_TEST_REPORT | 実装完了 | 2026-05-27 | 7/7 green(SEC-004+PII) |

## サブフォルダ（改修・バグ修正・クレーム判定履歴）
| パス | 種別 | issue/slug | 状態 | 概要 | INDEX |
|---|---|---|---|---|---|
| (なし) |

## 関連
- 親 concept: `../../concept.md` §1.3.2
- **依存**: _shared/db (優先度2)
- 実装コード: §1.4 参照

## 機能性質タグ
- cross-cutting (API エンドポイント、HUB 間トークン認可)

<!-- auto-generated-end -->

<!-- user-edit-start -->
<!-- user-edit-end -->
