# E2E テストレポート: feedback

- **状態**: E2E green
- **FW**: Playwright (@playwright/test, channel:chrome) / 実行: `npm run test:e2e` / 対象: ローカル dev (keyless memory backend, seed)
- **last_updated**: 2026-05-27

## journey 別結果 (004 由来)
| journey | spec | 結果 |
|---|---|---|
| UC5-S1 👍 リアクション送信 → お礼 | e2e/feedback.spec.ts | pass |
| UC5-S2 不具合報告 → 入力 → 送信 → お礼 | 〃 | pass |
| 投げ銭の価格透明性 (100円・機能変わらない O43) | 〃 | pass |

## 実装上の補足
- FeedbackWidget はどの画面にも未マウントだったため、**設定画面に「ご意見・不具合」セクションとしてマウント**(E2E 到達性確保)。unit (screens.test) でもマウント回帰を保護。

## カバー外 (別レイヤー)
- **PII scrub (SEC-002) / レート制限 (SEC-004)**: service 内 (makeFeedback)。unit (feedback.test) でカバー。

## flaky / quarantine
- なし

## metrics
metrics: { e2e_specs: 3, pass: 3, fail: 0, flaky: 0 }
