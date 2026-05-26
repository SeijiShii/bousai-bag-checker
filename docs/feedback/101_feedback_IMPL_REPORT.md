# 実装レポート: feedback

## 実装日時
2026-05-27 (JST) / **モード**: feature

## 関連ドキュメント
- 001-004 + 905 / [AI_LOG](../AI_LOG/D20260527_028_tdd_feedback.md)

## 変更一覧
- `feedbackSchema.ts`(Zod): type=reaction/bug 別必須
- `makeFeedback.ts`: submit(ゲスト可)→ レート制限(RateLimiter 再利用 R1)→ **scrubPII(notification 再利用 R2、SEC-002)** → feedback 挿入 → bug は運用通知(injectable)
- `FeedbackWidget.tsx`: 👍/👎 + バグ報告フォーム(控えめ、O40)

## 実装計画からの差分
| 項目 | 内容 |
|---|---|
| 再利用 | レート制限(R1)/scrubPII(R2)を横断サービスから import(重複なし) |
| 後段 | /api/feedback エンドポイント配線は app shell bootstrap、bot(Turnstile)実鍵は release |

## PR Description
### 概要
ゲスト送信の 👍/👎 + バグ報告。公開EP のレート制限(SEC-004)+ 送信前 PII scrub(SEC-002)。
### テスト
8 テスト green(schema 2 + submit 4[ゲスト/scrub/rate/context] + widget 2)。typecheck clean。
