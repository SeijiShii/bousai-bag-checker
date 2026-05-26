import { describe, it, expect, beforeEach, vi } from 'vitest';
import { makeTestDb } from '@/db/test-helpers';
import { feedback as feedbackTable } from '@/db/schema';
import { makeFeedback, type FeedbackNotifier } from './makeFeedback';
import { feedbackInputSchema } from './feedbackSchema';
import { InMemoryRateLimiter, allowAllRateLimiter } from '@/services/ratelimit';

type TestDb = Awaited<ReturnType<typeof makeTestDb>>;

let db: TestDb;
let notifier: FeedbackNotifier & { notifyBug: ReturnType<typeof vi.fn> };

beforeEach(async () => {
  db = await makeTestDb();
  notifier = { notifyBug: vi.fn(async () => {}) };
});

describe('feedbackInputSchema', () => {
  it('U-E3: bug で payload なし → invalid', () => {
    expect(feedbackInputSchema.safeParse({ type: 'bug' }).success).toBe(false);
  });
  it('reaction で reaction なし → invalid', () => {
    expect(feedbackInputSchema.safeParse({ type: 'reaction' }).success).toBe(false);
  });
});

describe('makeFeedback.submit', () => {
  it('U-N1: reaction をゲスト送信(user_id null)', async () => {
    const fb = makeFeedback(db, allowAllRateLimiter, notifier);
    expect(await fb.submit({ type: 'reaction', reaction: 'up' }, 'ip1')).toBe('ok');
    const rows = await db.select().from(feedbackTable);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.userId).toBeNull();
  });

  it('U-N2/P1: bug 送信は PII scrub + 運用通知', async () => {
    const fb = makeFeedback(db, allowAllRateLimiter, notifier);
    await fb.submit({ type: 'bug', payload: '連絡先 a@b.com で落ちる' }, 'ip1', { route: '/items', ua: 'x' });
    const rows = await db.select().from(feedbackTable);
    expect(JSON.stringify(rows[0]!.payload)).toContain('***@***'); // メールマスク
    expect(JSON.stringify(rows[0]!.payload)).not.toContain('a@b.com');
    expect(notifier.notifyBug).toHaveBeenCalled();
  });

  it('U-E1: レート超過 → rate_limited(挿入しない)', async () => {
    const rl = new InMemoryRateLimiter(1, 60_000);
    const fb = makeFeedback(db, rl, notifier);
    expect(await fb.submit({ type: 'reaction', reaction: 'up' }, 'ipX')).toBe('ok');
    expect(await fb.submit({ type: 'reaction', reaction: 'up' }, 'ipX')).toBe('rate_limited');
    expect(await db.select().from(feedbackTable)).toHaveLength(1);
  });

  it('U-P2: context に PII を残さない(scrub)', async () => {
    const fb = makeFeedback(db, allowAllRateLimiter, notifier);
    await fb.submit({ type: 'reaction', reaction: 'up' }, 'ip1', { route: '/x', ua: 'mail z@w.com' });
    const rows = await db.select().from(feedbackTable);
    expect(JSON.stringify(rows[0]!.context)).not.toContain('z@w.com');
  });
});
