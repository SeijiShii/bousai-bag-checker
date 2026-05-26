# 単体テストレポート: _shared/notification

## 実施日時
2026-05-27 (JST) / vitest 2.1.9 + pglite (EmailSender mock, no-key)

## テスト結果
| # | テストケース | 結果 |
|---|---|---|
| U-P1 | scrubPII メール/PII キー除去 | ✅ |
| U-P2 | token/authorization/storage_location REDACTED | ✅ |
| — | 再帰スクラブ(ネスト/配列) | ✅ |
| U-P4 | sentryBeforeSend event scrub | ✅ |
| U-N6 | settings デフォルト | ✅ |
| — | updateSettings upsert | ✅ |
| U-N2 | sendEmail 購読OFF → skipped | ✅ |
| U-N1 | sendEmail 購読ON → sent + PII scrub | ✅ |
| U-N3 | quiet_hours → skipped | ✅ |
| U-E1 | 送信失敗 → failed(PII 非ログ) | ✅ |
| U-N4/N5 | createInApp/listInApp/markRead(owner) | ✅ |

## サマリー
| 計画 | 追加 | 合計 | 成功 | 成功率 |
|---|---|---|---|---|
| 12 | 0 | 12 | 12 | 100% |

> PII マスク (SEC-002、法令必須) を最重点で 100% カバー(メール/トークン/保管場所/再帰/Sentry event)。
