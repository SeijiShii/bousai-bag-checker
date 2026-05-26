# feedback 実装計画書

> **入力**: `./001_feedback_SPEC.md`, `../concept.md` §1.4 / §4.3
> **最終更新**: 2026-05-27

---

## 1. 実装対象ファイル一覧 (src/features/feedback/)

| ファイル | 責務 | 依存 | LOC 見積 |
|---|---|---|---|
| `feedbackSchema.ts` | Zod 入力スキーマ + PII scrub | zod, notification(pii) | 60 |
| `api/feedback.ts` | POST /api/feedback (レート制限 + bot + scrub + 挿入 + 通知) | db, notification | 90 |
| `FeedbackWidget.tsx` | 👍/👎 + バグ報告ウィジェット (控えめ) | ui | 110 |
| `useFeedback.ts` | 送信フック | — | 40 |

## 2. 実装 Phase 分割 (/flow:tdd 連携)

### Phase 1 (RED→GREEN→IMPROVE): feedbackSchema + PII scrub
- 対象: `feedbackSchema.ts` (notification の scrubPII を流用)
- テスト対象: type/reaction/payload 検証、PII (メール等) が payload から除去される
- ゴール: 入力検証 + PII scrub が通る (SEC-002)

### Phase 2: API (レート制限 + bot + 挿入 + 通知)
- 対象: `api/feedback.ts`
- テスト対象: ゲスト送信可、レート超過 429、bot 判定、feedback 挿入 (user_id nullable)、運用通知(mock)
- ゴール: 公開エンドポイントが保護 + scrub + 記録 (SEC-004)

### Phase 3: UI (FeedbackWidget/useFeedback)
- 対象: ウィジェット (控えめ、非侵襲)
- テスト対象: 👍/👎 送信、バグ報告フォーム、送信完了表示、レート時の文言
- ゴール: ウィジェットが render + 送信操作。視覚は /flow:design --review-only

## 3. 依存関係順序
```
db(feedback) + notification(scrubPII/運用通知) + ui → feedbackSchema → api → UI
```
依存先: db/ui/notification (設計済)。

## 4. 既存ファイルへの影響
- 全画面に控えめな FeedbackWidget を配置 (共通レイアウト)。

## 5. 横断フォルダへの追加・変更
| 横断フォルダ | 追加・変更内容 |
|---|---|
| _shared/db | feedback 挿入 (スキーマ既存) |
| _shared/notification | scrubPII 流用 + 運用チャンネル通知 |

## 6. リスク・注意点
- **SEC-004 (論点-007 feedback 部分)**: ゲスト送信=公開エンドポイント。レート制限 + bot 対策 (Turnstile/honeypot) 必須。スパム/DB 肥大防止。
- **SEC-002**: payload を送信前に scrub。PII を DB/ログに残さない。
- **bot 対策**: Turnstile (Cloudflare) or honeypot。鍵が要る場合は env (sandbox は mock)。
- O40 運用シグナルは控えめ・非侵襲 (charter 非煽り)。

## 7. 完了の定義 (DoD)
- [ ] feedbackSchema + PII scrub が通る (SEC-002)
- [ ] API が ゲスト送信 + レート制限 + bot + 挿入 + 通知
- [ ] FeedbackWidget が 👍/👎 + バグ報告を送信
- [ ] 単体テストカバレッジ 80%/70% (PII scrub + レート制限重点)
- [ ] E2E (004) は /flow:e2e で green

## 8. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (scrub→api→UI の 3 Phase) | /flow:feature |
