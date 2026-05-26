# _shared/billing 実装計画書 (横断基盤)

> **入力**: `./001__shared_billing_SPEC.md`, `../../concept.md` §1.4 / §4.3 / §6
> **最終更新**: 2026-05-27

---

## 1. 実装対象ファイル一覧

| ファイル | 責務 | 依存 | LOC 見積 |
|---|---|---|---|
| `src/services/billing/tipClient.ts` | **TipClient interface** (createTipCheckout/handleWebhook/getTipTotal) | — | 40 |
| `src/services/billing/stripeTipClient.ts` | 実装版 (Stripe SDK 注入) | stripe, db | 110 |
| `api/tip/checkout.ts` | POST /api/tip/checkout (レート制限 + Checkout Session 作成) | billing | 50 |
| `api/stripe/webhook.ts` | POST /api/stripe/webhook (署名検証 → donation 記録) | billing, db | 70 |
| `src/services/billing/index.ts` | 公開エクスポート | 上記 | 10 |

## 2. 実装 Phase 分割 (/flow:tdd 連携、injectable + interface default = O35)

### Phase 1 (RED→GREEN→IMPROVE): TipClient interface + donation 記録ロジック (mock)
- 対象: `tipClient.ts` interface + webhook→donation 記録ロジック (mock Stripe verify + mock db)
- テスト対象: 署名検証成功で donation 1 件作成、冪等 (UNIQUE)、検証失敗で記録しない、PII 非保持
- ゴール: 投げ銭記録ロジックが mock で通る (機能アンロックしないことも検証)

### Phase 2: Checkout 作成ロジック (金額固定、mock Stripe)
- 対象: createTipCheckout (amount=100 サーバー強制、クライアント金額無視)
- テスト対象: amount=100 固定、userId 任意紐付け、checkout URL 返却
- ゴール: Checkout 作成が金額固定で通る

### Phase 3.5: app/api bootstrap (SDK 統合、O35)
- 対象: `stripeTipClient.ts` (実 Stripe Inject) + `api/tip/checkout.ts` + `api/stripe/webhook.ts` (raw body + 署名検証) + レート制限
- `.env.example` に `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` 追記 (実キー書かない、サーバー専用)
- ゴール: sandbox (Stripe test モード or mock) で投げ銭フロー green。実キースモークは release で B-4 まとめ確認

## 3. 依存関係順序
```
db(donations) → tipClient interface → 記録/Checkout ロジック
  → stripeTipClient (実装) + api endpoints (checkout/webhook) + レート制限
```
依存先: _shared/db (設計済)。

## 4. 既存ファイルへの影響
- なし (新規エンドポイント + サービス)。

## 5. 横断フォルダへの追加・変更
| 横断フォルダ | 追加・変更内容 |
|---|---|
| _shared/db | donations 挿入 (webhook 経由) |
| _shared/legal | 投げ銭前確認文 + 特商法/投げ銭表記 (O43) |
| _shared/ui | 投げ銭ボタン + 完了画面 (機能側で配置) |

## 6. リスク・注意点
- **webhook 署名検証必須** (BL-E1): raw body + Stripe-Signature。検証なしは重大リスク。
- **金額サーバー強制** (BL): クライアントから金額を信用しない (100円固定)。
- **冪等性** (BL-E2): stripe_payment_id UNIQUE で二重記録防止。
- **機能アンロックしない** (D-028): donation 記録のみ、plan/権限を絶対に変更しない。テストで担保。
- **SECRET の VITE_ 露出禁止** (SEC-005)。**Live 鍵注意 / test モード優先** (charter 課金安全)。実課金スモークは release で B-4 まとめ確認。

## 7. 完了の定義 (DoD)
- [ ] webhook 署名検証 → donation 記録 (冪等、PII なし、機能アンロックなし)
- [ ] createTipCheckout が amount=100 固定 (クライアント金額無視)
- [ ] checkout レート制限 (SEC-004)
- [ ] 実 Stripe Inject + 2 エンドポイントが sandbox (test モード) で green
- [ ] 単体テストカバレッジ 80%/70% (署名検証 + 冪等 + アンロックしないこと重点)
- [ ] 実課金スモークは release で B-4 まとめ確認 (本 Phase では mock/test)

## 8. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (記録→Checkout→実Stripe の 3 Phase、投げ銭・アンロックなし) | /flow:feature |
