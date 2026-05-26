import { sql } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { donations } from '@/db/schema';
import type * as schema from '@/db/schema';
import type { PaymentGateway } from './paymentGateway';

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

// 投げ銭は 100 円固定。機能アンロックは伴わない (D-028)。
export const TIP_AMOUNT_YEN = 100;

export type WebhookResult = 'recorded' | 'duplicate' | 'invalid';

export function makeBilling(db: AnyDb, gateway: PaymentGateway) {
  return {
    /** 投げ銭 Checkout 作成。金額はサーバー強制(100円、クライアント値を信用しない)。ログイン不要。 */
    async createTipCheckout(userId: string | null = null) {
      return gateway.createCheckout(TIP_AMOUNT_YEN, userId);
    },

    /** webhook: 署名検証 → donation 記録(stripe_payment_id UNIQUE で冪等)。機能アンロックしない。 */
    async handleWebhook(rawBody: string, signature: string): Promise<WebhookResult> {
      const tip = gateway.verifyWebhook(rawBody, signature);
      if (!tip) return 'invalid';
      const rows = await db
        .insert(donations)
        .values({ userId: tip.userId, stripePaymentId: tip.paymentId, amount: tip.amount })
        .onConflictDoNothing({ target: donations.stripePaymentId })
        .returning({ id: donations.id });
      return rows.length > 0 ? 'recorded' : 'duplicate';
    },

    /** 投げ銭累計(任意記録、§4.6)。PII なし。 */
    async getTipTotal(): Promise<{ count: number; totalYen: number }> {
      const rows = await db
        .select({ count: sql<number>`count(*)::int`, total: sql<number>`coalesce(sum(amount),0)::int` })
        .from(donations);
      return { count: rows[0]?.count ?? 0, totalYen: rows[0]?.total ?? 0 };
    },
  };
}

export type BillingService = ReturnType<typeof makeBilling>;
