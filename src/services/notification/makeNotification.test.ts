import { describe, it, expect, beforeEach, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { makeTestDb } from '@/db/test-helpers';
import { users, emailDeliveries } from '@/db/schema';
import { makeNotification, type EmailSender } from './makeNotification';

type TestDb = Awaited<ReturnType<typeof makeTestDb>>;

let db: TestDb;
let userId: string;
let sent: Array<{ userId: string; template: string; data: Record<string, unknown> }>;
let sender: EmailSender;
let failNext: boolean;

beforeEach(async () => {
  db = await makeTestDb();
  const [u] = await db.insert(users).values({ clerkUserId: 'clerk_n' }).returning();
  userId = u!.id;
  sent = [];
  failNext = false;
  sender = {
    send: vi.fn(async (uid: string, template: string, data: Record<string, unknown>) => {
      if (failNext) throw new Error('resend down');
      sent.push({ userId: uid, template, data });
    }),
  };
});

describe('settings', () => {
  it('U-N6: 未設定はデフォルト (email OFF / inapp ON / lead 14)', async () => {
    const n = makeNotification(db, sender);
    const s = await n.getSettings(userId);
    expect(s.emailEnabled).toBe(false);
    expect(s.inappEnabled).toBe(true);
    expect(s.leadDays).toBe(14);
  });

  it('updateSettings は upsert', async () => {
    const n = makeNotification(db, sender);
    await n.updateSettings(userId, { emailEnabled: true, leadDays: 7 });
    const s = await n.getSettings(userId);
    expect(s.emailEnabled).toBe(true);
    expect(s.leadDays).toBe(7);
  });
});

describe('sendEmail (購読確認 + 配信履歴)', () => {
  it('U-N2: 購読 OFF → 送信せず skipped', async () => {
    const n = makeNotification(db, sender);
    const result = await n.sendEmail(userId, 'expiry', { itemName: '水' });
    expect(result).toBe('skipped');
    expect(sender.send).not.toHaveBeenCalled();
    const logs = await db.select().from(emailDeliveries).where(eq(emailDeliveries.userId, userId));
    expect(logs[0]!.status).toBe('skipped');
  });

  it('U-N1: 購読 ON → 送信 sent + PII scrub', async () => {
    const n = makeNotification(db, sender);
    await n.updateSettings(userId, { emailEnabled: true });
    const result = await n.sendEmail(userId, 'expiry', { email: 'a@b.com', itemName: '水' });
    expect(result).toBe('sent');
    expect(sent[0]!.data).toEqual({ email: '[REDACTED]', itemName: '水' }); // SEC-002 scrub
  });

  it('U-N3: quiet_hours 内は skipped', async () => {
    const n = makeNotification(db, sender);
    await n.updateSettings(userId, { emailEnabled: true, quietHoursStart: '22:00', quietHoursEnd: '07:00' });
    const at2am = new Date('2026-05-27T02:00:00');
    expect(await n.sendEmail(userId, 'expiry', {}, at2am)).toBe('skipped');
  });

  it('U-E1: 送信失敗 → failed 記録、PII 非ログ', async () => {
    const n = makeNotification(db, sender);
    await n.updateSettings(userId, { emailEnabled: true });
    failNext = true;
    expect(await n.sendEmail(userId, 'expiry', { email: 'a@b.com' })).toBe('failed');
    const logs = await db.select().from(emailDeliveries).where(eq(emailDeliveries.userId, userId));
    expect(logs.some((l) => l.status === 'failed')).toBe(true);
  });
});

describe('in-app 通知 (所有者)', () => {
  it('U-N4/N5: createInApp → listInApp → markRead', async () => {
    const n = makeNotification(db, sender);
    const created = await n.createInApp(userId, 'expiry_reminder', '点検どうぞ', '水がそろそろ');
    const list = await n.listInApp(userId);
    expect(list).toHaveLength(1);
    expect(await n.markRead(userId, created.id)).toBe(true);
    // 他人の id は false
    expect(await n.markRead('00000000-0000-0000-0000-000000000000', created.id)).toBe(false);
  });
});
