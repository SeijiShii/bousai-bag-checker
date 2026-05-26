# inspection E2E テスト計画

> **入力**: `./001_inspection_SPEC.md`, `../concept.md` §1.1
> **最終更新**: 2026-05-27
> **実行**: /flow:e2e (unit 完了後)。ローカル headless = Class A。

---

## 1. ユーザージャーニー

### UC3: 季節点検モード（concept §1.1 #3）
| シナリオ ID | 前提 | 操作ステップ | 期待結果 |
|---|---|---|---|
| UC3-S1 (happy) | items 数件 | 点検タブ→チェックリスト→各品目チェック→完了 | inspection_log 記録 + 「全部グリーン」サマリ |
| UC3-S2 (resume) | 点検中で離脱 | 再度開く | チェック状態が保持され再開 |
| UC3-S3 (empty) | items 0件 | 点検タブ | EmptyState |

### UC2: 期限リマインド (cron) — 自動化対象
| シナリオ ID | 前提 | 操作ステップ | 期待結果 |
|---|---|---|---|
| UC2-S1 | 期限間近 item + 購読 ON | cron expiry-check 実行 (テスト起動) | 該当ユーザーに通知トリガー (mock sender で検証) |
| UC2-S2 | 購読 OFF | cron 実行 | 送信 skipped |

> cron は E2E では「テスト用に手動起動 + mock sender」で検証 (実メール送信はしない、Class A)。実メールは release の実キースモークで軽く確認。

## 2. 環境要件
| 項目 | 要件 |
|---|---|
| ブラウザ | Chromium (主) / WebKit |
| 画面サイズ | モバイル (主) |
| 認証 | ゲスト/アカウント |
| cron | テスト起動 + mock sender (実メールなし) |
| 通知 | mock (Resend を呼ばない) |

## 3. データセットアップ
### 3.1 Seed
- テストユーザー + items (期限間近/余裕/check_only/replace_guide) + notification_settings
### 3.2 Cleanup
- inspection_log / items / ユーザー破棄

## 4. タグ別追加シナリオ
- stateful: 点検中→離脱→再開 (UC3-S2) を必須。
- cron: 購読 ON/OFF/quiet_hours の分岐 (UC2)。

## 5. レイアウト・ビジュアル検証 (perspectives O34)
- **Level 1 (snapshot)**: ✅ ダッシュボード/チェックリスト/完了サマリ
- **Level 2 (意味的)**: ✅ 鮮度サマリの色(トークン)、「全部グリーン」の達成表示、チェックリストの縦並び
- **Level 3 (AI Vision)**: ❌ 非採用 (視覚総合は /flow:design --review-only)

## 6. 期待 KPI
| 指標 | 目標 |
|---|---|
| シナリオ成功率 | 100% |
| cron 通知トリガー | 購読状態に応じ正しく sent/skipped |
| L1/L2 | 差分0 / pass 100% |

## 7. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (季節点検ジャーニー + cron 通知 + L1/L2) | /flow:feature |
