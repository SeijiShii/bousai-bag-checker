# E2E テストレポート: inventory

- **状態**: E2E green
- **FW**: Playwright (@playwright/test, channel:chrome) / 実行: `npm run test:e2e` / 対象: ローカル dev (keyless memory backend, seed)
- **last_updated**: 2026-05-27

## journey 別結果 (004 由来)
| journey | spec | 結果 |
|---|---|---|
| UC1 一覧 + 鮮度 StatusChip | e2e/inventory.spec.ts | pass |
| UC2-S1 追加→保存→反映 | 〃 | pass |
| UC2-S3 name 空でエラー(保存されない) | 〃 | pass |
| UC3-S1 削除で消える | 〃 | pass |

## カバー外 (別レイヤーでカバー)
- **UC3-S2 IDOR** (他人の item id を API 直叩き→404): memory backend は単一ユーザーのため UI E2E 対象外。**apiCore.test.ts の SEC-001 ケース (他人id→false/null) でカバー済**。

## flaky / quarantine
- なし (初回全 green)

## metrics
metrics: { e2e_specs: 4, pass: 4, fail: 0, flaky: 0 }
