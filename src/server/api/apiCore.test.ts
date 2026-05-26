import { describe, it, expect, beforeEach } from 'vitest';
import { makeTestDb } from '@/db/test-helpers';
import { users } from '@/db/schema';
import { makeApiCore, type ApiCore } from './apiCore';
import type { PaymentGateway } from '@/services/billing/paymentGateway';

const fakeGateway: PaymentGateway = {
  createCheckout: async (amountYen) => ({ url: `https://stripe.test/cs?amt=${amountYen}`, sessionId: 'cs_test' }),
  verifyWebhook: () => null,
};

const iso = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

describe('apiCore (PGlite, SEC-001 所有者分離)', () => {
  let core: ApiCore;
  let alice: string;
  let bob: string;

  beforeEach(async () => {
    const db = await makeTestDb();
    const [a] = await db.insert(users).values({ clerkUserId: 'alice' }).returning();
    const [b] = await db.insert(users).values({ clerkUserId: 'bob' }).returning();
    alice = a!.id;
    bob = b!.id;
    core = makeApiCore(db, { gateway: fakeGateway });
  });

  it('createItem → listItems (鮮度付き、所有者のみ)', async () => {
    await core.createItem(alice, { name: '保存水', category: 'water', freshnessType: 'expiry', expiresAt: iso(400) });
    const aliceItems = await core.listItems(alice);
    expect(aliceItems).toHaveLength(1);
    expect(aliceItems[0]!.freshness).toBe('fresh');
    // bob からは見えない
    expect(await core.listItems(bob)).toHaveLength(0);
  });

  it('removeItem: 他人の id は false (IDOR 不可、404 相当)', async () => {
    await core.createItem(alice, { name: '電池', category: 'other', freshnessType: 'expiry', expiresAt: iso(10) });
    const [item] = await core.listItems(alice);
    // bob が alice の item を消そうとしても false
    expect(await core.removeItem(bob, item!.id)).toBe(false);
    expect(await core.listItems(alice)).toHaveLength(1);
    // 所有者なら true
    expect(await core.removeItem(alice, item!.id)).toBe(true);
    expect(await core.listItems(alice)).toHaveLength(0);
  });

  it('generateShopping: 期限切れ/近い品目を TODO 化 (settings.leadDays 連動)', async () => {
    await core.createItem(alice, { name: 'fresh水', category: 'water', freshnessType: 'expiry', expiresAt: iso(400) });
    await core.createItem(alice, { name: '期限切れ食', category: 'food', freshnessType: 'expiry', expiresAt: iso(-2) });
    const gen = await core.generateShopping(alice);
    expect(gen.map((s) => s.name)).toEqual(['期限切れ食']);
    expect(await core.generateShopping(alice)).toHaveLength(0); // 重複防止 (R2)
  });

  it('setShoppingBought: 他人の id は null (SEC-001)', async () => {
    await core.createItem(alice, { name: '水', category: 'water', freshnessType: 'expiry', expiresAt: iso(-1) });
    const [s] = await core.generateShopping(alice);
    expect(await core.setShoppingBought(bob, s!.id, true)).toBeNull();
    expect(await core.setShoppingBought(alice, s!.id, true)).not.toBeNull();
  });

  it('getSettings 既定 + updateSettings', async () => {
    expect((await core.getSettings(alice)).leadDays).toBe(14);
    await core.updateSettings(alice, { leadDays: 30, emailEnabled: true });
    const s = await core.getSettings(alice);
    expect(s.leadDays).toBe(30);
    expect(s.emailEnabled).toBe(true);
  });

  it('recordInspection を記録できる', async () => {
    await expect(
      core.recordInspection(alice, { total: 3, checked: 3, needsReplace: 1 }),
    ).resolves.toBeTruthy();
  });

  it('submitFeedback: バリデーション + 記録 (PII scrub は service 内)', async () => {
    const r = await core.submitFeedback(alice, { type: 'reaction', reaction: 'up' }, 'ip-1');
    expect(r).toBe('ok');
  });

  it('createTipCheckout: 金額サーバー強制 (100円)、URL を返す (D-028 アンロックなし)', async () => {
    const { url } = await core.createTipCheckout(alice);
    expect(url).toContain('amt=100');
  });
});
