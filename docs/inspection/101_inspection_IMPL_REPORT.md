# 実装レポート: inspection

## 実装日時
2026-05-27 (JST) / **モード**: feature

## 関連ドキュメント
- 001-004 + 905 / [AI_LOG](../AI_LOG/D20260527_029_tdd_inspection.md)

## 変更一覧
- `dueItems.ts`: inventory.isDue(freshness)再利用(R1)。check_only 除外
- `makeInspection.ts`: runExpiryCheck(cron、全ユーザー → notification、**当日重複抑制=冪等 R2**、1ユーザー失敗で継続、PII なし)/recordInspection/listLogs(owner)
- `InspectionChecklist.tsx`: チェック → 完了 → inspection_log + 「全部グリーン」

## 実装計画からの差分
| 項目 | 内容 |
|---|---|
| 冪等(R2) | email_deliveries に当日 expiry_reminder があれば再通知しない(in-app 含む) |
| 後段 | Vercel Cron 配線(CRON_SECRET)は app shell bootstrap/release |

## PR Description
### 概要
期限リマインド(日次 cron、冪等)+ 季節点検チェックリスト。freshness は inventory から再利用。
### テスト
7 テスト green(dueItems / cron 通知+冪等 / 点検記録 / Checklist UI)。typecheck clean。
