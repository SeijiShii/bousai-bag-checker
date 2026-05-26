import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { feedback } from '@/db/schema';
import type * as schema from '@/db/schema';
import type { RateLimiter } from '@/services/ratelimit';
import { scrubPII } from '@/services/notification';

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

export type SubmitResult = 'ok' | 'rate_limited' | 'invalid';

export interface FeedbackContext {
  route?: string;
  version?: string;
  ua?: string;
}

/** 運用通知の抽象 (任意、injectable)。バグ報告を運用チャンネルへ。 */
export interface FeedbackNotifier {
  notifyBug(payload: Record<string, unknown>): Promise<void>;
}

const noopNotifier: FeedbackNotifier = { notifyBug: async () => {} };

/**
 * feedback 送信。ゲスト可(公開EP)。レート制限/bot(SEC-004)+ 送信前 PII scrub(SEC-002)。
 * input は feedbackInputSchema 準拠を期待(safeParse で検証)。
 */
export function makeFeedback(db: AnyDb, rateLimiter: RateLimiter, notifier: FeedbackNotifier = noopNotifier) {
  return {
    async submit(
      parsedInput: { type: 'reaction' | 'bug'; reaction?: 'up' | 'down'; payload?: string },
      clientKey: string,
      context: FeedbackContext = {},
      userId: string | null = null,
    ): Promise<SubmitResult> {
      if (!(await rateLimiter.allow(clientKey))) return 'rate_limited';

      // 送信前 PII scrub (SEC-002): payload / context から PII を除去
      const payload = scrubPII(
        parsedInput.type === 'bug' ? { text: parsedInput.payload } : { reaction: parsedInput.reaction },
      );
      const safeContext = scrubPII({ route: context.route, version: context.version, ua: context.ua });

      await db.insert(feedback).values({ userId, type: parsedInput.type, payload, context: safeContext });
      if (parsedInput.type === 'bug') await notifier.notifyBug(payload);
      return 'ok';
    },
  };
}

export type FeedbackService = ReturnType<typeof makeFeedback>;
