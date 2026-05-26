import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import type * as schema from '@/db/schema';
import { makeOwner } from '@/db/owner';
import type { Item } from '@/types/db';
import type { FreshnessStatus } from '@/lib/tokens';
import { itemInputSchema, type ItemInput } from './itemSchema';
import { computeFreshness } from './freshness';

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

export type ItemWithFreshness = Item & { freshness: FreshnessStatus };

/** inventory サービス。全 items アクセスは withOwner 経由(SEC-001)。入力は Zod 検証(SEC-003)。 */
export function makeInventory(db: AnyDb) {
  const withOwner = makeOwner(db);
  return {
    /** 検証 → 本人の item 作成。検証失敗は ZodError(機能側で 400)。 */
    async create(userId: string, input: unknown): Promise<Item> {
      const v: ItemInput = itemInputSchema.parse(input);
      return withOwner(userId).items.insert({
        name: v.name,
        category: v.category,
        quantity: v.quantity,
        storageLocation: v.storageLocation ?? null,
        freshnessType: v.freshnessType,
        expiresAt: v.expiresAt ?? null,
        replaceMonths: v.replaceMonths ?? null,
        note: v.note ?? null,
      });
    },

    /** 本人の item を鮮度付きで一覧。leadDays は notification 設定と連動(spec-review R4)。 */
    async listWithFreshness(userId: string, leadDays: number, now: Date = new Date()): Promise<ItemWithFreshness[]> {
      const items = await withOwner(userId).items.findMany();
      return items.map((i) => ({ ...i, freshness: computeFreshness(i, leadDays, now) }));
    },

    async remove(userId: string, id: string): Promise<boolean> {
      return withOwner(userId).items.remove(id);
    },
  };
}
