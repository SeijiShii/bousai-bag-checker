# E2E テストレポート: shopping-list

- **状態**: E2E green
- **FW**: Playwright (@playwright/test, channel:chrome) / 実行: `npm run test:e2e` / 対象: ローカル dev (keyless memory backend, seed)
- **last_updated**: 2026-05-27

## journey 別結果 (004 由来)
| journey | spec | 結果 |
|---|---|---|
| UC4-S1 生成で期限切れ/近い品目が TODO 化 | e2e/shopping.spec.ts | pass |
| UC4-S2 購入チェックで購入済 | 〃 | pass |
| UC4-S6 課金導線が無い (無料 D-028) | 〃 | pass |

## カバー外
- CSV エクスポートの中身検証は unit (csvExport.test / httpBackend.test) でカバー。E2E はボタン存在まで。

## flaky / quarantine
- なし

## metrics
metrics: { e2e_specs: 3, pass: 3, fail: 0, flaky: 0 }
