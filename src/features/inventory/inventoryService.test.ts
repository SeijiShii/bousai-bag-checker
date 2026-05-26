import { describe, it, expect, beforeEach } from 'vitest';
import { ZodError } from 'zod';
import { makeTestDb } from '@/db/test-helpers';
import { users } from '@/db/schema';
import { makeInventory } from './inventoryService';

type TestDb = Awaited<ReturnType<typeof makeTestDb>>;

let db: TestDb;
let userA: string;
let userB: string;

beforeEach(async () => {
  db = await makeTestDb();
  const [a] = await db.insert(users).values({ clerkUserId: 'a' }).returning();
  const [b] = await db.insert(users).values({ clerkUserId: 'b' }).returning();
  userA = a!.id;
  userB = b!.id;
});

describe('makeInventory.create (Zod 検証 + withOwner)', () => {
  it('U-N: 有効入力 → default 適用で作成', async () => {
    const inv = makeInventory(db);
    const item = await inv.create(userA, { name: '水', category: 'water', expiresAt: '2026-12-31' });
    expect(item.quantity).toBe(1);
    expect(item.freshnessType).toBe('expiry');
    expect(item.userId).toBe(userA);
  });

  it('U-E3: name 空 → ZodError(400 相当)', async () => {
    const inv = makeInventory(db);
    await expect(inv.create(userA, { name: '', category: 'water', expiresAt: '2026-12-31' })).rejects.toBeInstanceOf(ZodError);
  });

  it('U-E4: freshness=expiry で expires_at なし → ZodError', async () => {
    const inv = makeInventory(db);
    await expect(inv.create(userA, { name: '水', category: 'water' })).rejects.toBeInstanceOf(ZodError);
  });
});

describe('listWithFreshness + 所有者分離', () => {
  it('鮮度付きで本人の item のみ一覧', async () => {
    const inv = makeInventory(db);
    await inv.create(userA, { name: '水', category: 'water', expiresAt: '2020-01-01' }); // 期限切れ
    await inv.create(userB, { name: '他人', category: 'food', expiresAt: '2030-01-01' });
    const list = await inv.listWithFreshness(userA, 14, new Date('2026-05-27'));
    expect(list).toHaveLength(1);
    expect(list[0]!.freshness).toBe('expired');
  });

  it('U-E1: remove は他人の item を消せない(IDOR)', async () => {
    const inv = makeInventory(db);
    const item = await inv.create(userA, { name: '水', category: 'water', expiresAt: '2026-12-31' });
    expect(await inv.remove(userB, item.id)).toBe(false);
    expect(await inv.remove(userA, item.id)).toBe(true);
  });
});
