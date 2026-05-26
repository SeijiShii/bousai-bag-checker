import { describe, it, expect, beforeEach } from 'vitest';
import { makeTestDb } from '@/db/test-helpers';
import { users, items } from '@/db/schema';
import { makeShopping } from './makeShopping';

type TestDb = Awaited<ReturnType<typeof makeTestDb>>;

let db: TestDb;
let userA: string;
let userB: string;
const NOW = new Date();

function soon(days: number): string {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

beforeEach(async () => {
  db = await makeTestDb();
  const [a] = await db.insert(users).values({ clerkUserId: 'a' }).returning();
  const [b] = await db.insert(users).values({ clerkUserId: 'b' }).returning();
  userA = a!.id;
  userB = b!.id;
});

describe('makeShopping.generate (重複防止 R2)', () => {
  it('U-N1: 期限切れ/近い item を TODO 化、fresh は除外', async () => {
    await db.insert(items).values([
      { userId: userA, name: '水', category: 'water', freshnessType: 'expiry', expiresAt: soon(-1) }, // expired
      { userId: userA, name: '食料', category: 'food', freshnessType: 'expiry', expiresAt: soon(5) }, // warn
      { userId: userA, name: '余裕', category: 'other', freshnessType: 'expiry', expiresAt: soon(90) }, // fresh
    ]);
    const sl = makeShopping(db);
    const created = await sl.generate(userA, 14, NOW);
    expect(created).toHaveLength(2);
    expect(created.find((c) => c.name === '水')!.reason).toBe('expired');
    expect(created.find((c) => c.name === '食料')!.reason).toBe('insufficient');
  });

  it('U-R2: 2回 generate しても重複しない(既存未購入とマージ)', async () => {
    await db.insert(items).values({ userId: userA, name: '水', category: 'water', freshnessType: 'expiry', expiresAt: soon(-1) });
    const sl = makeShopping(db);
    await sl.generate(userA, 14, NOW);
    await sl.generate(userA, 14, NOW);
    expect(await sl.list(userA)).toHaveLength(1);
  });
});

describe('購入管理 + 所有者分離', () => {
  it('U-N: addManual + setBought', async () => {
    const sl = makeShopping(db);
    const item = await sl.addManual(userA, 'ラップ');
    expect(item.reason).toBe('manual');
    const updated = await sl.setBought(userA, item.id, true);
    expect(updated!.isBought).toBe(true);
    expect(updated!.boughtAt).not.toBeNull();
  });

  it('U-E1: 他人の TODO は setBought/remove できない(IDOR)', async () => {
    const sl = makeShopping(db);
    const item = await sl.addManual(userA, 'ラップ');
    expect(await sl.setBought(userB, item.id, true)).toBeNull();
    expect(await sl.remove(userB, item.id)).toBe(false);
    expect(await sl.remove(userA, item.id)).toBe(true);
  });
});
