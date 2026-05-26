# _shared/billing 単体テスト計画 (横断基盤)

> **入力**: `./001__shared_billing_SPEC.md`, `./002__shared_billing_PLAN.md`
> **最終更新**: 2026-05-27

---

## 1. テストケース一覧

### 1.1 正常系
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| U-N1 | handleWebhook | 正しい署名 + checkout.session.completed | donation 1件作成 (amount=100) |
| U-N2 | handleWebhook | userId 付き | donation.user_id にひも付け |
| U-N3 | handleWebhook | userId なし (ゲスト) | donation.user_id=null で記録 |
| U-N4 | createTipCheckout | {} | amount=100 の Checkout URL (Stripe mock) |
| U-N5 | getTipTotal | donation 3件×100 | 合計 300 (PII なし) |

### 1.2 異常系
| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| U-E1 | handleWebhook | 署名検証失敗 | 400、donation を作らない、PII 非ログ (SEC-002) |
| U-E2 | handleWebhook | 同一 stripe_payment_id 2回 | UNIQUE 冪等吸収 (1件のみ) |
| U-E3 | createTipCheckout | クライアントが amount=1 を送る | **無視して 100 円固定** (サーバー強制) |
| U-E4 | /api/tip/checkout | レート超過 | 429 |

### 1.3 境界値 / 規約 (アンロックしないことが最重点)
| ID | 対象 | 境界 | 期待振る舞い |
|---|---|---|---|
| U-P1 | handleWebhook 後 | ユーザー状態 | **plan/権限/機能アクセスが一切変わらない** (D-028、機能アンロックなし) |
| U-P2 | donation レコード | フィールド | PII (メール等) を持たない (user_id 任意のみ) |

## 2. Mock 方針

| 対象 | 方針 | 理由 |
|---|---|---|
| Stripe SDK | **PaymentGateway interface を mock 注入** | 実 Stripe を呼ばず署名検証/Checkout を再現 (no-key) |
| 署名検証 | mock verify (成功/失敗を制御) | BL-E1 テスト |
| DB | pglite or mock | donations UNIQUE / 冪等検証 |

## 3. カバレッジ目標
| 種別 | 目標 | 根拠 |
|---|---|---|
| 行カバレッジ | 80% | concept 継承 |
| 分岐カバレッジ | 70% | concept 継承 |
| **webhook 署名検証 + 冪等** | **必須** | 決済の整合性 (BL-E1/E2) |
| **機能アンロックしないこと** | **必須** | D-028、投げ銭で権限が変わらないことを明示検証 |

## 4. 既存ユーティリティ依存
- `_shared/db` の donations。

## 5. テスト実行環境
- フレームワーク: vitest
- Stripe: PaymentGateway mock (no-key)。実課金スモークは release で別途 (B-4)
- 実行コマンド (例示): テストランナー実行

## 6. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (署名検証/冪等/金額固定/アンロックしないことを重点検証) | /flow:feature |
