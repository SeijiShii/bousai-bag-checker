# _shared/billing 変更計画書 (Stripe SDK 実 wiring)

## 1. 既存ファイル変更一覧

| ファイル | 変更内容 | リスク | 関連 SPEC § |
|---|---|---|---|
| `api/_lib/composition.ts` | gateway 注入を `getGateway()` 関数経由で追加 (env 未設定なら undefined → tip/webhook 503) | 低 | §2.2, §7.3 |

## 2. 新規ファイル一覧

| ファイル | 責務 | 依存 | LOC 見積 |
|---|---|---|---|
| `src/services/billing/stripeGateway.ts` | `makeStripeGateway(config)` factory | `stripe` | ~50 |
| `src/services/billing/stripeGateway.test.ts` | mock Stripe で unit テスト | vitest + mock | ~100 |

## 3. 削除ファイル一覧
(なし)

## 4. マイグレーション要否
- DB スキーマ変更: ❌
- 既存データ変換: ❌
- 設定ファイル変更: ❌

→ **MIGRATION 不要**

## 5. 実装 Phase 分割

### Phase 1: `stripe` インストール
- `npm install stripe`
- **バージョン**: `^17.x.x` 系 (現行安定版、Node.js 18+ 対応) <!-- spec-review R1: major 上げ別 revise、signature 変動 retrofit リスクを限定 (auth R2 と同 pattern) -->

### Phase 2: `stripeGateway.ts` 実装 (TDD)
- RED: stripeGateway.test.ts (mock Stripe client、createCheckout / verifyWebhook 各成功・失敗ケース)
- GREEN: factory 実装
- IMPROVE: PII-safe error log (signature 失敗時 null 返却のみ)

### Phase 3: `composition.ts` gateway 注入
- `getGateway()` 関数追加 (env undefined なら gateway=undefined)
- `makeApiCore(db, { gateway: getGateway() })` に変更
- makeBilling は gateway undefined を非対応 = handler 側で 503 にする整合性確認 (既存 apiCore 経由)

### Phase 4: 全テスト維持確認
- typecheck pass
- 168 + 新規 5-7 tests = 全 green

## 6. 依存関係順序
Phase 1 → 2 → 3 → 4 (順次)

## 7. ロールアウト計画
| ステップ | 内容 | 期日 | 検証 |
|---|---|---|---|
| 1 | 実装完了 + unit green | 2026-05-28 | npm test |
| 2 | Stripe test key で .env.development.local FILL | release Phase 1 | env 確認 |
| 3 | ローカル動作確認 (実機スマホで Checkout 開く) | release Phase 2 | 実機目視 |
| 4 | preview deploy | release Phase 3 | preview URL で確認 |
| 5 | production live key swap + 実課金 B-4 | release §3.1 | 100円疎通 1 回 |

## 8. リスク・注意点
- `stripe` SDK は重量級 dep (Node.js 用フルクライアント)、サーバー側のみ使用 (フロント import 禁止 = SEC-005)
- raw body 取得が必要 = `api/stripe-webhook.ts` の `config.api.bodyParser = false` 設定済確認
- success/cancel URL 固定の場合 deploy 後に動作変更 = SPEC §8 で記録済

## 9. DoD
- [ ] stripeGateway.ts + test 追加
- [ ] composition.ts に getGateway() 追加
- [ ] typecheck + 168+ tests green
- [ ] `stripe` deps 追加
- [ ] AI_LOG セッション完了

## 10. 更新履歴
| 2026-05-28 | 初版 | /flow:revise |
