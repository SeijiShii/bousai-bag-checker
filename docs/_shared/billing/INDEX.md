# billing (横断) ドキュメントインデックス

**最終更新**: 2026-05-27
**生成元**: /flow:concept (初期化) → /flow:feature (設計)

<!-- auto-generated-start -->

## 機能概要
投げ銭基盤(100 円の任意支援)。Stripe 単発 Checkout + webhook 署名検証 → donation 記録。**機能アンロックなし**(全機能無料 — D-028)。

## ファイル一覧（番号順）
| 番号 | ファイル | 種別 | 状態 | 最終更新 | 短い説明 |
|---|---|---|---|---|---|
| 001 | [001__shared_billing_SPEC.md](./001__shared_billing_SPEC.md) | SPEC | 設計済 | 2026-05-27 | Stripe 100円 one-time + webhook + donation、アンロックなし |
| 002 | [002__shared_billing_PLAN.md](./002__shared_billing_PLAN.md) | PLAN | 設計済 | 2026-05-27 | 記録→Checkout→実Stripe の 3 Phase |
| 003 | [003__shared_billing_UNIT_TEST.md](./003__shared_billing_UNIT_TEST.md) | UNIT_TEST | 設計済 | 2026-05-27 | 署名検証/冪等/金額固定/アンロックしないこと重点 |
| 004 | (E2E は cross-cutting でスキップ。投げ銭フローは機能側 E2E + release 実キースモーク) | — | — | — | — |
| 101 | [101__shared_billing_IMPL_REPORT.md](./101__shared_billing_IMPL_REPORT.md) | IMPL_REPORT | 実装完了 | 2026-05-27 | 投げ銭Checkout+webhook冪等+アンロックなし、6テスト green |
| 102 | [102__shared_billing_UNIT_TEST_REPORT.md](./102__shared_billing_UNIT_TEST_REPORT.md) | UNIT_TEST_REPORT | 実装完了 | 2026-05-27 | 6/6 green(署名/冪等/D-028) |

## サブフォルダ（改修・バグ修正・クレーム判定履歴）
| パス | 種別 | issue/slug | 状態 | 概要 | INDEX |
|---|---|---|---|---|---|
| (なし) |

## 関連
- 親 concept: `../../concept.md` §1.3.2
- **依存**: _shared/db (優先度2、D-028 で auth 依存解消=投げ銭はログイン不要)
- 実装コード: §1.4 参照

## 機能性質タグ
- cross-cutting (投げ銭、ログイン不要)

<!-- auto-generated-end -->

<!-- user-edit-start -->
<!-- user-edit-end -->
