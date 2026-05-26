# 実装レポート: _shared/billing

## 実装日時
2026-05-27 (JST) / **モード**: feature (cross-cutting)

## 関連ドキュメント
- 001/002/003 (_shared/billing) / [AI_LOG](../../AI_LOG/D20260527_026_tdd__shared_billing.md)

## 変更一覧
- `src/services/billing/paymentGateway.ts`: PaymentGateway interface(createCheckout/verifyWebhook、injectable、実 Stripe は release)
- `src/services/billing/makeBilling.ts`: createTipCheckout(TIP_AMOUNT_YEN=100 サーバー強制)/handleWebhook(署名検証→donation 冪等)/getTipTotal
- 機能アンロックなし(D-028): users に plan/unlock カラムを持たない=構造的に不能

## 実装計画からの差分
| 項目 | 内容 |
|---|---|
| injectable | 実 Stripe SDK + webhook 署名鍵は release(実キー)。実課金スモークは release B-4 |
| 冪等 | stripe_payment_id UNIQUE + onConflictDoNothing で二重 webhook を duplicate |

## PR Description
### 概要
100円投げ銭の Checkout + webhook。金額サーバー強制・冪等・機能アンロックなし(社会善アプリ、D-028)。
### テスト
6 テスト green(金額固定 / 署名検証 / 冪等 / アンロックしないこと / 累計)。typecheck clean。
