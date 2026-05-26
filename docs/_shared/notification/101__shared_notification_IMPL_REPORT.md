# 実装レポート: _shared/notification

## 実装日時
2026-05-27 (JST) / **モード**: feature (cross-cutting, core)

## 関連ドキュメント
- 001/002/003 (_shared/notification) / [AI_LOG](../../AI_LOG/D20260527_023_tdd__shared_notification.md)

## 変更一覧
### Phase 1 (最優先): PII マスク (SEC-002 / 論点-005)
- `src/services/notification/pii.ts`: `scrubPII`(再帰、メール/PII キー除去)+ `sentryBeforeSend`(event scrub)
### Phase 2: db スキーマ拡張 + 購読/in-app
- `src/db/{enums,schema}.ts`: notifications / email_deliveries テーブル + enum 追加、migration 再生成 (6 TYPE / 9 TABLE)
- `src/services/notification/makeNotification.ts`: getSettings/updateSettings(upsert)/createInApp(PII scrub)/listInApp/markRead(owner)/sendEmail(購読+quiet_hours → sent/skipped/failed + email_deliveries 記録)
### Phase 3.5 (deferred, O35)
- 実 Resend(EmailSender 実装)+ Sentry 初期化への sentryBeforeSend 配線は release(実キー)。現状は EmailSender 注入で core 完全テスト。

## 実装計画からの差分
| 項目 | 内容 |
|---|---|
| db 拡張 | notifications/email_deliveries を schema に追加(SPEC §3.1 どおり) |
| deferred | 実 Resend/Sentry 配線は release。RESEND_API_KEY/SENTRY_DSN の .env 追記も release |

## PR Description
### 概要
通知基盤 core。SEC-002 PII マスク(法令必須)を最優先実装し、購読 ON/OFF/quiet_hours を尊重したメール/アプリ内通知を injectable に。
### テスト
12 テスト green(PII scrub 5 + 購読/送信/in-app 7)。typecheck clean。
