import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type * as schema from "@/db/schema";
import { makeInventory, type ItemWithFreshness } from "@/features/inventory";
import { makeShopping } from "@/features/shopping-list";
import { makeInspection } from "@/features/inspection";
import {
  makeFeedback,
  feedbackInputSchema,
  type FeedbackNotifier,
} from "@/features/feedback";
import {
  makeNotification,
  type EmailSender,
} from "@/services/notification/makeNotification";
import { makeBilling } from "@/services/billing/makeBilling";
import type { PaymentGateway } from "@/services/billing/paymentGateway";
import { allowAllRateLimiter, type RateLimiter } from "@/services/ratelimit";
import type { ShoppingItem } from "@/types/db";
import type {
  InspectionSummary,
  NotificationSettings,
} from "@/services/backend/port";

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

const noopSender: EmailSender = { send: async () => {} };

export interface ApiCoreDeps {
  /** メール送信 (実 Resend は release で注入、既定は no-op)。 */
  sender?: EmailSender;
  /** 公開 EP レート制限 (既定 allow-all、本番は InMemory/Upstash)。 */
  rateLimiter?: RateLimiter;
  /** 投げ銭ゲートウェイ (実 Stripe は release で注入)。未注入なら tip/webhook は不可。 */
  gateway?: PaymentGateway;
  /** バグ報告の運用通知 (既定 no-op)。 */
  feedbackNotifier?: FeedbackNotifier;
}

/**
 * /api/* の framework 非依存コア。
 * userId は api 層 (auth seam = SEC-001 の唯一の信用入口) が解決して渡す。リクエストボディの user_id は信用しない。
 * 全データアクセスは services の withOwner 経由 (IDOR 防止)。
 */
export function makeApiCore(db: AnyDb, deps: ApiCoreDeps = {}) {
  const notification = makeNotification(db, deps.sender ?? noopSender);
  const inventory = makeInventory(db);
  const shopping = makeShopping(db);
  const inspection = makeInspection(db, notification);
  const feedback = makeFeedback(
    db,
    deps.rateLimiter ?? allowAllRateLimiter,
    deps.feedbackNotifier,
  );
  const billing = deps.gateway ? makeBilling(db, deps.gateway) : null;

  async function leadDaysFor(userId: string): Promise<number> {
    return (await notification.getSettings(userId)).leadDays;
  }

  return {
    // 品目
    async listItems(userId: string): Promise<ItemWithFreshness[]> {
      return inventory.listWithFreshness(userId, await leadDaysFor(userId));
    },
    async createItem(userId: string, body: unknown) {
      return inventory.create(userId, body); // zod 検証 (SEC-003) + insert
    },
    /** false = 他人/不在 → 呼び出し側で 404 (SEC-001 の IDOR 不可視化)。 */
    async removeItem(userId: string, id: string): Promise<boolean> {
      return inventory.remove(userId, id);
    },

    // 点検
    async recordInspection(userId: string, summary: InspectionSummary) {
      return inspection.recordInspection(
        userId,
        summary as unknown as Record<string, unknown>,
      );
    },

    // 買い物
    async listShopping(userId: string): Promise<ShoppingItem[]> {
      return shopping.list(userId);
    },
    async generateShopping(userId: string): Promise<ShoppingItem[]> {
      return shopping.generate(userId, await leadDaysFor(userId));
    },
    /** null = 他人/不在 → 404 (SEC-001)。 */
    async setShoppingBought(userId: string, id: string, isBought: boolean) {
      return shopping.setBought(userId, id, isBought);
    },

    // フィードバック (公開 EP、PII scrub + レート制限は service 内)
    async submitFeedback(
      userId: string | null,
      body: unknown,
      clientKey: string,
      context = {},
    ) {
      const parsed = feedbackInputSchema.parse(body);
      return feedback.submit(parsed, clientKey, context, userId);
    },

    // 設定
    async getSettings(userId: string): Promise<NotificationSettings> {
      const s = await notification.getSettings(userId);
      return {
        emailEnabled: s.emailEnabled,
        inappEnabled: s.inappEnabled,
        leadDays: s.leadDays,
        quietHoursStart: s.quietHoursStart ?? null,
        quietHoursEnd: s.quietHoursEnd ?? null,
      };
    },
    async updateSettings(userId: string, patch: Partial<NotificationSettings>) {
      return notification.updateSettings(userId, patch);
    },

    // 投げ銭 (D-028 無料・任意支援、金額はサーバー強制)
    async createTipCheckout(userId: string | null) {
      if (!billing) throw new Error("billing gateway not configured");
      return billing.createTipCheckout(userId);
    },
    async handleStripeWebhook(rawBody: string, signature: string) {
      if (!billing) throw new Error("billing gateway not configured");
      return billing.handleWebhook(rawBody, signature);
    },

    // Cron (Vercel Cron → 期限チェック通知、冪等 R2)
    async runExpiryCheck(now?: Date) {
      return inspection.runExpiryCheck(now);
    },
  };
}

export type ApiCore = ReturnType<typeof makeApiCore>;
