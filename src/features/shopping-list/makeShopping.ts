import { and, eq } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { shoppingItems } from '@/db/schema';
import type * as schema from '@/db/schema';
import { makeOwner } from '@/db/owner';
import { computeFreshness } from '@/features/inventory';
import type { ShoppingItem } from '@/types/db';

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

/** 買い物 TODO (無料、D-028)。全アクセス withOwner(SEC-001)。 */
export function makeShopping(db: AnyDb) {
  const withOwner = makeOwner(db);
  return {
    /** 期限切れ/近い items → shopping_item に起こす。既存の未購入(同 item_id)とマージし重複生成しない(R2)。 */
    async generate(userId: string, leadDays: number, now: Date = new Date()): Promise<ShoppingItem[]> {
      const items = await withOwner(userId).items.findMany();
      const existing = await db
        .select()
        .from(shoppingItems)
        .where(and(eq(shoppingItems.userId, userId), eq(shoppingItems.isBought, false)));
      const existingItemIds = new Set(existing.map((s) => s.itemId).filter((x): x is string => !!x));

      const created: ShoppingItem[] = [];
      for (const item of items) {
        const f = computeFreshness(item, leadDays, now);
        if (f === 'fresh') continue;
        if (existingItemIds.has(item.id)) continue; // 重複防止 (R2)
        const reason = f === 'expired' ? 'expired' : 'insufficient';
        const row = await withOwner(userId).shoppingItems.insert({ itemId: item.id, name: item.name, reason });
        created.push(row);
      }
      return created;
    },

    async addManual(userId: string, name: string): Promise<ShoppingItem> {
      return withOwner(userId).shoppingItems.insert({ name, reason: 'manual', itemId: null });
    },

    async list(userId: string): Promise<ShoppingItem[]> {
      return withOwner(userId).shoppingItems.findMany();
    },

    /** 購入チェック切替。本人のみ(IDOR防止)。 */
    async setBought(userId: string, id: string, isBought: boolean): Promise<ShoppingItem | null> {
      return withOwner(userId).shoppingItems.update(id, { isBought, boughtAt: isBought ? new Date() : null });
    },

    async remove(userId: string, id: string): Promise<boolean> {
      return withOwner(userId).shoppingItems.remove(id);
    },
  };
}

export type ShoppingService = ReturnType<typeof makeShopping>;
