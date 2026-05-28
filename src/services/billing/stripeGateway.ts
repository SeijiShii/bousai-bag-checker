import Stripe from 'stripe';
import type { PaymentGateway, CheckoutSession, VerifiedTip } from './paymentGateway';

/**
 * Stripe SDK 注入用 factory (release seam の実装、O35)。
 * composition.ts の gateway 注入ポイントから呼ばれ、makeApiCore に渡される。
 * keyless テストは stripeGateway.test.ts で stripe を mock する。
 */
export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  successUrl: string;
  cancelUrl: string;
}

export function makeStripeGateway(config: StripeConfig): PaymentGateway {
  // <!-- spec-review R2: apiVersion 明示 pin (stripe@22 latest = 2026-05-27.dahlia)、破壊変更回避 -->
  const stripe = new Stripe(config.secretKey, { apiVersion: '2026-05-27.dahlia' });

  return {
    async createCheckout(amountYen: number, userId: string | null): Promise<CheckoutSession> {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'jpy',
              product_data: { name: '投げ銭' },
              unit_amount: amountYen,
            },
            quantity: 1,
          },
        ],
        success_url: config.successUrl,
        cancel_url: config.cancelUrl,
        metadata: userId ? { userId } : {},
      });
      return { url: session.url ?? '', sessionId: session.id };
    },

    verifyWebhook(rawBody: string, signature: string): VerifiedTip | null {
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
        // SEC-002 PII-safe: 署名失敗 or 改竄、err 本文に PII を含むため出さない
        return null;
      }
    },
  };
}
