import { getDb } from "../../src/db/client";
import { makeAuth } from "../../src/services/auth/makeAuth";
import type {
  AuthClient,
  SessionResolver,
} from "../../src/services/auth/authClient";
import { makeApiCore, type ApiCore } from "../../src/server/api/apiCore";

/**
 * Release (P4.7) で実 Clerk を注入する seam。
 * keyless ビルド/typecheck は通り、実行時に未設定なら明確に失敗する (@clerk 配線は release)。
 */
const releaseSessionResolver: SessionResolver = {
  async resolveClerkUserId() {
    throw new Error(
      "SessionResolver 未設定: release (P4.7) で @clerk セッション検証を配線してください",
    );
  },
};

let cached: { core: ApiCore; auth: AuthClient } | undefined;

/**
 * /api/* の合成ルート。getDb (Neon) + apiCore + auth を組み立てる。
 * gateway (Stripe) / sender (Resend) / rateLimiter (Upstash) は release で注入 (未注入なら tip/webhook は不可)。
 */
export function composition(): { core: ApiCore; auth: AuthClient } {
  if (!cached) {
    const db = getDb();
    cached = {
      core: makeApiCore(db, {
        // release 注入ポイント:
        // gateway: makeStripeGateway(process.env.STRIPE_SECRET_KEY!, ...),
        // sender: makeResendSender(process.env.RESEND_API_KEY!),
        // rateLimiter: makeUpstashRateLimiter(...),
      }),
      auth: makeAuth(db, releaseSessionResolver),
    };
  }
  return cached;
}
