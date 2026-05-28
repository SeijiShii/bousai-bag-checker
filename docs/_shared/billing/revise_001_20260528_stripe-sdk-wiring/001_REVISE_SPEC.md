# _shared/billing 変更仕様書 (Stripe SDK 実 wiring)

> **改修種別**: 拡張 (release seam 完成、auth 革新と同形パターン)
> **issue / slug**: 001 / stripe-sdk-wiring
> **基準 SPEC**: `../001__shared_billing_SPEC.md`
> **最終更新**: 2026-05-28
> **タグ**: billing / Stripe / O35 inject seam

## 1. 変更概要

`PaymentGateway` interface (`src/services/billing/paymentGateway.ts`) は完成済だが、`composition.ts` 内 `makeApiCore` の `gateway` 注入が release 待ちのコメント状態。本改修で **`stripe` SDK を使う `makeStripeGateway` factory を実装**し、composition.ts で注入する。これにより `/api/billing/checkout` + `/api/stripe-webhook` が実稼働可能に。

## 2. 変更前 vs 変更後

### 2.1 UC 変更
| UC ID | 変更前 | 変更後 | 理由 |
|---|---|---|---|
| createCheckout | gateway 未注入で実装上動作不可 | Stripe Checkout Session API 経由で実 url 返却 | release seam 完成 |
| verifyWebhook | 同上 | Stripe webhook signature 検証 (`stripe.webhooks.constructEvent`) → 成功時 `VerifiedTip` 返却 | 同上 |

### 2.2 入出力変更
| 対象 | 変更前 | 変更後 | 互換性 |
|---|---|---|---|
| composition.ts gateway 注入 | コメント `// gateway: makeStripeGateway(...)` | `makeStripeGateway({ secretKey, webhookSecret, ... })` invoke | 完全互換 (interface 不変) |

### 2.3 データモデル変更
変更なし (donations table は既存)。

### 2.4 バリデーション・エラー変更
| 対象 | 変更前 | 変更後 |
|---|---|---|
| webhook 署名失敗 | gateway 未注入 (動作不可) | `verifyWebhook` が null 返却 → handler が 400 (既存) |

## 3. 影響範囲

| 対象 | 影響度 | 説明 |
|---|---|---|
| `src/services/billing/stripeGateway.ts` (新規) | 高 | `makeStripeGateway` factory + Stripe SDK adapter |
| `src/services/billing/stripeGateway.test.ts` (新規) | 高 | mock Stripe client での unit test |
| `api/_lib/composition.ts` | 中 | gateway 注入 1 箇所追加 |
| `api/stripe-webhook.ts` | なし | composition 経由なので呼び出し変化なし |
| `package.json` | 低 | `stripe` deps 追加 |

<!-- spec-review R3 同形: 後続 _shared/notification (Resend SDK) revise でも同 factory pattern 踏襲 -->

## 4. 後方互換性
- **互換維持**: ✅ (interface 不変、seam 内部実装のみ追加注入)

## 5. ロールバック方針
- **コード revert で戻せる**: ✅ (1 commit = stripeGateway.ts + composition.ts 2 ファイル変更)
- **DB ロールバック**: 不要

## 6. リリース戦略
- **方式**: 一括 (seam 1 箇所注入のため段階展開不要)
- **検証**: test mode key (`sk_test_*` + `whsec_*` test) で Phase 2 ローカル動作確認 → preview deploy → production live キーへ swap (release.md §3.1)

## 7. 詳細仕様 (新仕様)

### 7.1 `makeStripeGateway` factory

```typescript
import Stripe from 'stripe';
import type { PaymentGateway, CheckoutSession, VerifiedTip } from './paymentGateway';

export interface StripeConfig {
  secretKey: string;          // STRIPE_SECRET_KEY (sk_test_* / sk_live_*)
  webhookSecret: string;      // STRIPE_WEBHOOK_SECRET (whsec_*)
  successUrl: string;         // checkout 成功時の戻り URL
  cancelUrl: string;          // checkout キャンセル時の戻り URL
}

export function makeStripeGateway(config: StripeConfig): PaymentGateway {
  const stripe = new Stripe(config.secretKey);
  return {
    async createCheckout(amountYen, userId) {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price_data: { currency: 'jpy', product_data: { name: '投げ銭' }, unit_amount: amountYen }, quantity: 1 }],
        success_url: config.successUrl,
        cancel_url: config.cancelUrl,
        metadata: userId ? { userId } : {},
      });
      return { url: session.url!, sessionId: session.id };
    },
    verifyWebhook(rawBody, signature): VerifiedTip | null {
      try {
        const event = stripe.webhooks.constructEvent(rawBody, signature, config.webhookSecret);
        if (event.type !== 'checkout.session.completed') return null;
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status !== 'paid') return null;
        return {
          paymentId: session.id,
          amount: session.amount_total ?? 0,
          userId: (session.metadata?.userId as string) ?? null,
        };
      } catch {
        // SEC-002 PII-safe: signature 不正 or 改竄、内容は出さない
        return null;
      }
    },
  };
}
```

### 7.2 env 要件

| env var | 必須 | 値の prefix | source |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | 必須 | `sk_test_*` / `sk_live_*` | Stripe dashboard API keys |
| `STRIPE_WEBHOOK_SECRET` | 必須 | `whsec_*` | Stripe dashboard → Webhooks → endpoint signing secret |
| `STRIPE_SUCCESS_URL` | 必須 | URL | request origin から構築可、env で固定でも可 |
| `STRIPE_CANCEL_URL` | 必須 | URL | 同上 |

(success/cancel URL は env でなく request origin 由来導出が perspectives O53 推奨だが本 SPEC では env で簡素化、後続改善余地)

### 7.3 composition.ts 改修

```typescript
import { makeStripeGateway } from "../../src/services/billing/stripeGateway";

function getGateway() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return undefined; // gateway 未設定なら tip/webhook 無効化 (handler 側で 503)
  }
  return makeStripeGateway({
    secretKey, webhookSecret,
    successUrl: process.env.STRIPE_SUCCESS_URL ?? 'https://example.invalid/success',
    cancelUrl: process.env.STRIPE_CANCEL_URL ?? 'https://example.invalid/cancel',
  });
}

// composition() 内:
core: makeApiCore(db, { gateway: getGateway(), /* sender, rateLimiter は別 revise */ }),
```

## 8. 未決事項
- 現時点で論点なし (2026-05-28)。success/cancel URL の origin 由来導出 (O53) は別 revise で扱う。

## 9. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-28 | 初版作成 | /flow:revise |
