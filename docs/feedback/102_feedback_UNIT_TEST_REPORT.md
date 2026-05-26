# 単体テストレポート: feedback

## 実施日時
2026-05-27 (JST) / vitest 2.1.9 + pglite + jsdom

## テスト結果 (8 件)
| # | 検証 | 結果 |
|---|---|---|
| schema | bug/reaction の必須検証 (2) | ✅ |
| U-N1 | reaction ゲスト送信(user_id null) | ✅ |
| U-N2/P1 | bug の PII scrub + 運用通知 | ✅ |
| U-E1 | レート超過 → rate_limited(挿入なし) | ✅ |
| U-P2 | context の PII scrub | ✅ |
| widget | 👍送信+お礼 / バグ報告送信 (2) | ✅ |

## サマリー
| 計画 | 追加 | 合計 | 成功 | 成功率 |
|---|---|---|---|---|
| 8 | 0 | 8 | 8 | 100% |

> SEC-002 PII scrub(payload/context)+ SEC-004 レート制限を重点。GA4 不採用、PII を analytics に残さない。
