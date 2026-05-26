# 単体テストレポート: inspection

## 実施日時
2026-05-27 (JST) / vitest 2.1.9 + pglite + jsdom

## テスト結果 (7 件)
| # | 検証 | 結果 |
|---|---|---|
| dueItems | 期限間近抽出、check_only 除外 | ✅ |
| U-N5 | 購読ON+期限間近 → 通知+配信記録 | ✅ |
| U-E3 (R2) | 当日2回目は冪等で skip(送信1回) | ✅ |
| U-N6 | recordInspection + listLogs(owner) | ✅ |
| Checklist | 完了→summary+全グリーン / 空 / expired計上 (3) | ✅ |

## サマリー
| 計画 | 追加 | 合計 | 成功 | 成功率 |
|---|---|---|---|---|
| 7 | 0 | 7 | 7 | 100% |

> cron 冪等性(R2、当日重複抑制)+ freshness 再利用 を重点。テストは DB now() と実時刻を揃えて決定的に。
