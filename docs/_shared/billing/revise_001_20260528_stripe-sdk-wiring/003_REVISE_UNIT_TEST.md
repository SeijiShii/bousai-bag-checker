# _shared/billing 単体テスト計画 (Stripe SDK 実 wiring)

## 1. 追加テストケース

### 1.1 正常系
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| S-001 | `createCheckout(100, "user_abc")` 成功 | mock Stripe が `{ id: "cs_xxx", url: "https://checkout.stripe.com/..." }` 返す | `{ url, sessionId: "cs_xxx" }` 返却 |
| S-002 | `createCheckout(100, null)` ゲスト | metadata.userId 含まない call | sessionId 返却 |
| S-003 | `verifyWebhook` 署名成功 + checkout.session.completed + paid | mock event | VerifiedTip 返却 (paymentId/amount/userId) |
| S-004 | metadata.userId なしの session | webhook event | VerifiedTip.userId = null |

### 1.2 異常系
| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| S-101 | `verifyWebhook` 署名失敗 | `stripe.webhooks.constructEvent` が throw | null 返却 (PII なし) |
| S-102 | event.type ≠ `checkout.session.completed` | 別 event | null 返却 |
| S-103 | payment_status ≠ `paid` (例: unpaid) | session.payment_status='unpaid' | null 返却 |

### 1.3 境界値
| ID | 対象 | 境界 | 期待振る舞い |
|---|---|---|---|
| S-201 | amount_total が undefined | event | VerifiedTip.amount = 0 |

## 2. 修正テストケース
| ID | 対象 | 修正前 | 修正後 | 理由 |
|---|---|---|---|---|
| (なし) | 既存 makeBilling.test.ts | mock PaymentGateway 直接 inject | 同左 (変更不要) | interface 不変 |

## 3. 削除テストケース
(なし)

## 4. リグレッション強化
- 既存 makeBilling.test.ts / api/stripe-webhook.test.ts (もしあれば) 全 green 維持

## 5. Mock 方針差分
| 対象 | 前回 | 今回 | 理由 |
|---|---|---|---|
| `stripe` SDK | (未使用) | `vi.mock('stripe')` で `Stripe` class を mock 化 (`checkout.sessions.create` + `webhooks.constructEvent`) | unit で実 Stripe call 不可、vi.hoisted 推奨 (clerkAuthClient と同 pattern) |

## 6. カバレッジ目標
| 種別 | 目標 | 根拠 |
|---|---|---|
| 行 | 90%+ | factory 全 path 網羅 |
| 分岐 | 100% (4 分岐: 署名失敗/event type/payment_status/metadata) | 全 case 網羅 |

## 7. 更新履歴
| 2026-05-28 | 初版 | /flow:revise |
