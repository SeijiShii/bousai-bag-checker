import { describe, it, expect, beforeEach } from 'vitest';
import { makeTestDb } from './test-helpers';
import { makeOwner } from './owner';
import { users, donations } from './schema';

type TestDb = Awaited<ReturnType<typeof makeTestDb>>;

let db: TestDb;
let withOwner: ReturnType<typeof makeOwner>;
let userA: string;
let userB: string;

beforeEach(async () => {
  db = await makeTestDb();
  withOwner = makeOwner(db);
  const [a] = await db.insert(users).values({ clerkUserId: 'clerk_a' }).returning();
  const [b] = await db.insert(users).values({ clerkUserId: 'clerk_b' }).returning();
  userA = a!.id;
  userB = b!.id;
});

describe('schema defaults', () => {
  it('U-N1: item は quantity=1 / freshness_type=expiry が default', async () => {
    const item = await withOwner(userA).items.insert({ name: '水', category: 'water' });
    expect(item.quantity).toBe(1);
    expect(item.freshnessType).toBe('expiry');
    expect(item.userId).toBe(userA);
  });
});

describe('withOwner 所有者分離 (SEC-001)', () => {
  it('U-N3/N4: insert は user_id 付与、findMany は本人のみ', async () => {
    await withOwner(userA).items.insert({ name: '非常食', category: 'food' });
    await withOwner(userA).items.insert({ name: '乾電池', category: 'battery' });
    await withOwner(userB).items.insert({ name: '他人の水', category: 'water' });

    const aItems = await withOwner(userA).items.findMany();
    const bItems = await withOwner(userB).items.findMany();
    expect(aItems).toHaveLength(2);
    expect(bItems).toHaveLength(1);
    expect(aItems.every((i) => i.userId === userA)).toBe(true);
  });

  it('U-N5: findById は本人の id で取得できる', async () => {
    const created = await withOwner(userA).items.insert({ name: '水', category: 'water' });
    const found = await withOwner(userA).items.findById(created.id);
    expect(found?.id).toBe(created.id);
  });

  it('U-E1: 他人の id を findById → null (IDOR 防止)', async () => {
    const aItem = await withOwner(userA).items.insert({ name: '水', category: 'water' });
    const asB = await withOwner(userB).items.findById(aItem.id);
    expect(asB).toBeNull();
  });

  it('U-E2: 他人の行を update → null (0 行)', async () => {
    const aItem = await withOwner(userA).items.insert({ name: '水', category: 'water' });
    const updated = await withOwner(userB).items.update(aItem.id, { quantity: 99 });
    expect(updated).toBeNull();
    // 本人の行は更新できる
    const ok = await withOwner(userA).items.update(aItem.id, { quantity: 5 });
    expect(ok?.quantity).toBe(5);
  });

  it('U-E3: 他人の行を remove → false、本人は true', async () => {
    const aItem = await withOwner(userA).items.insert({ name: '水', category: 'water' });
    expect(await withOwner(userB).items.remove(aItem.id)).toBe(false);
    expect(await withOwner(userA).items.remove(aItem.id)).toBe(true);
    expect(await withOwner(userA).items.findMany()).toHaveLength(0);
  });

  it('U-B4: userId 空文字は拒否', () => {
    expect(() => withOwner('')).toThrow();
  });
});

describe('donations (投げ銭、user_id nullable・冪等)', () => {
  it('U-N6: user_id=null でゲスト投げ銭を記録', async () => {
    const [d] = await db
      .insert(donations)
      .values({ stripePaymentId: 'pi_guest_1', amount: 100 })
      .returning();
    expect(d!.userId).toBeNull();
    expect(d!.amount).toBe(100);
  });

  it('U-N7: 同一 stripe_payment_id の二重記録は UNIQUE で拒否 (冪等)', async () => {
    await db.insert(donations).values({ stripePaymentId: 'pi_dup', amount: 100 });
    await expect(
      db.insert(donations).values({ stripePaymentId: 'pi_dup', amount: 100 }),
    ).rejects.toThrow();
  });
});
