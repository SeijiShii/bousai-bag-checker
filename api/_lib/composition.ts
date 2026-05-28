import { getDb } from "../../src/db/client";
import { makeAuth } from "../../src/services/auth/makeAuth";
import type {
  AuthClient,
  SessionResolver,
} from "../../src/services/auth/authClient";
import { makeClerkSessionResolver } from "../../src/services/auth/clerkAuthClient";
import { makeStripeGateway } from "../../src/services/billing/stripeGateway";
import type { PaymentGateway } from "../../src/services/billing/paymentGateway";
import { makeApiCore, type ApiCore } from "../../src/server/api/apiCore";

/**
 * Clerk SessionResolver を env から組み立てる (release Phase で配線、revise_001)。
 * env 未設定なら起動時に fail-fast (composition 呼び出し時点で明確エラー)。
 */
function getSessionResolver(): SessionResolver {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY env not set");
  }
  return makeClerkSessionResolver({
    secretKey,
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  });
}

/**
 * Stripe PaymentGateway を env から組み立てる (release Phase で配線、billing/revise_001)。
 * env 未設定時は undefined を返し、makeApiCore 側で gateway 未注入を許容
 * (tip/webhook handler 側で 503 にする想定)。
 */
function getGateway(): PaymentGateway | undefined {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return undefined;
  }
  return makeStripeGateway({
    secretKey,
    webhookSecret,
    successUrl:
      process.env.STRIPE_SUCCESS_URL ?? "https://example.invalid/success",
    cancelUrl:
      process.env.STRIPE_CANCEL_URL ?? "https://example.invalid/cancel",
  });
}

let cached: { core: ApiCore; auth: AuthClient } | undefined;

/**
 * /api/* の合成ルート。getDb (Neon) + apiCore + auth を組み立てる。
 * sender (Resend) / rateLimiter (Upstash) は後続 revise で注入予定。
 */
export function composition(): { core: ApiCore; auth: AuthClient } {
  if (!cached) {
    const db = getDb();
    cached = {
      core: makeApiCore(db, {
        gateway: getGateway(),
        // 後続 revise 注入ポイント:
        // sender: makeResendSender(process.env.RESEND_API_KEY!),
        // rateLimiter: makeUpstashRateLimiter(...),
      }),
      auth: makeAuth(db, getSessionResolver()),
    };
  }
  return cached;
}
