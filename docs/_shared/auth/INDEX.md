# auth (横断) ドキュメントインデックス

**最終更新**: 2026-05-26 20:40
**生成元**: /flow:concept (初期化) → /flow:feature (設計)

<!-- auto-generated-start -->

## 機能概要
認証基盤(ゲスト/段階的認証)。Clerk Anonymous → アカウント連携、データ引き継ぎ(O22)。サーバー側で userId を解決し withOwner(SEC-001) に供給。投げ銭はログイン不要。

## ファイル一覧（番号順）
| 番号 | ファイル | 種別 | 状態 | 最終更新 | 短い説明 |
|---|---|---|---|---|---|
| 001 | [001__shared_auth_SPEC.md](./001__shared_auth_SPEC.md) | SPEC | 設計済 | 2026-05-26 | Clerk ゲスト→段階的認証 + userId 解決 + O22 引き継ぎ |
| 002 | [002__shared_auth_PLAN.md](./002__shared_auth_PLAN.md) | PLAN | 設計済 | 2026-05-26 | interface→mock→実Clerk の 3 Phase |
| 003 | [003__shared_auth_UNIT_TEST.md](./003__shared_auth_UNIT_TEST.md) | UNIT_TEST | 設計済 | 2026-05-26 | userId 信用線(SEC-001)100%カバー、O22 継続検証 |
| 004 | (E2E は cross-cutting でスキップ。統合は機能側 E2E でカバー) | — | — | — | — |
| 101 | [101__shared_auth_IMPL_REPORT.md](./101__shared_auth_IMPL_REPORT.md) | IMPL_REPORT | 実装完了(core) | 2026-05-27 | userId信用線+getOrCreateUser+O22、7テスト green。実Clerkはrelease |
| 102 | [102__shared_auth_UNIT_TEST_REPORT.md](./102__shared_auth_UNIT_TEST_REPORT.md) | UNIT_TEST_REPORT | 実装完了 | 2026-05-27 | 7/7 green(SEC-001 信用線 100%) |

## サブフォルダ（改修・バグ修正・クレーム判定履歴）
| パス | 種別 | issue/slug | 状態 | 概要 | INDEX |
|---|---|---|---|---|---|
| (なし) |

## 関連
- 親 concept: `../../concept.md` §1.3.2
- **依存**: _shared/db (優先度2, 基盤✅)
- 実装コード: §1.4 参照

## 機能性質タグ
- cross-cutting, auth-required, stateful (ゲスト→アカウント)

<!-- auto-generated-end -->

<!-- user-edit-start -->
<!-- user-edit-end -->
