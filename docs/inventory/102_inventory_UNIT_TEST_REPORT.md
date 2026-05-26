# 単体テストレポート: inventory

## 実施日時
2026-05-27 (JST) / vitest 2.1.9 + pglite + jsdom

## テスト結果 (18 件)
| 区分 | 件数 | 主な検証 |
|---|---|---|
| freshness | 7 | expiry/replace_guide/check_only × fresh/warn/expired、当日境界=warn、isDue |
| service | 5 | create(default/ZodError×2)、listWithFreshness、remove IDOR(SEC-001) |
| UI | 6 | ItemList(表示/EmptyState/削除)、ItemForm(送信/検証エラー/動的フィールド) |

## サマリー
| 計画 | 追加 | 合計 | 成功 | 成功率 |
|---|---|---|---|---|
| 18 | 0 | 18 | 18 | 100% |

> 所有者分離(SEC-001)100% + freshness 3種×3段階網羅。TDD で当日期限バグを検出・修正。
