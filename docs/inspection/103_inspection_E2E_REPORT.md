# E2E テストレポート: inspection

- **状態**: E2E green
- **FW**: Playwright (@playwright/test, channel:chrome) / 実行: `npm run test:e2e` / 対象: ローカル dev (keyless memory backend, seed)
- **last_updated**: 2026-05-27

## journey 別結果 (004 由来)
| journey | spec | 結果 |
|---|---|---|
| 季節点検チェックリスト → 1件確認 → 完了で記録メッセージ | e2e/inspection.spec.ts | pass |

## カバー外 (別レイヤー)
- **期限チェック cron 冪等 (R2)**: サーバー cron (api/cron/expiry-check + inspection.runExpiryCheck)。unit (inspection.test の alreadyNotifiedToday) でカバー。UI E2E 対象外。

## flaky / quarantine
- なし

## metrics
metrics: { e2e_specs: 1, pass: 1, fail: 0, flaky: 0 }
