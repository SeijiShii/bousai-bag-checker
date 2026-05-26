import { and, eq } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { items, inspectionLogs, shoppingItems } from "./schema";
import type * as schema from "./schema";

// SEC-001 所有者強制の唯一の窓口。Neon は RLS 非対応のため、アプリ層で全クエリに user_id を強制する。
// user-scoped テーブル (items / inspection_logs / shopping_items) のみ対象。
// donations / feedback / notification_settings は別 (nullable or 1-per-user) のため本ヘルパ対象外。

// neon-serverless と pglite の両 drizzle インスタンスを受けられる緩い型。
type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

type OwnedTable = typeof items | typeof inspectionLogs | typeof shoppingItems;

function ownedRepo<T extends OwnedTable>(db: AnyDb, table: T, userId: string) {
  type Row = T["$inferSelect"];
  type InsertValues = Omit<T["$inferInsert"], "userId">;

  // union table 上でのクエリビルダ型解決を避けるため内部は any 経由。
  // 型安全は public メソッドシグネチャ (Row / InsertValues) が担保する。
  const t = table as typeof items; // 代表型 (id + userId を持つ)
  const dbq = db as AnyDb;

  return {
    /** 本人の全行。 */
    findMany: async (): Promise<Row[]> => {
      const rows = await dbq.select().from(t).where(eq(t.userId, userId));
      return rows as unknown as Row[];
    },
    /** id + user_id の複合一致。他人の id を渡しても null (IDOR 防止)。 */
    findById: async (id: string): Promise<Row | null> => {
      const rows = await dbq
        .select()
        .from(t)
        .where(and(eq(t.id, id), eq(t.userId, userId)))
        .limit(1);
      return (rows[0] as unknown as Row | undefined) ?? null;
    },
    /** user_id を自動付与して挿入。 */
    insert: async (values: InsertValues): Promise<Row> => {
      const rows = await dbq
        .insert(t)
        .values({ ...(values as object), userId } as typeof items.$inferInsert)
        .returning();
      return rows[0] as unknown as Row;
    },
    /** id + user_id 複合で更新。他人の行は 0 行更新 (null)。 */
    update: async (
      id: string,
      patch: Partial<InsertValues>,
    ): Promise<Row | null> => {
      const rows = await dbq
        .update(t)
        .set(patch as Partial<typeof items.$inferInsert>)
        .where(and(eq(t.id, id), eq(t.userId, userId)))
        .returning();
      return (rows[0] as unknown as Row | undefined) ?? null;
    },
    /** id + user_id 複合で削除。他人の行は false。 */
    remove: async (id: string): Promise<boolean> => {
      const rows = await dbq
        .delete(t)
        .where(and(eq(t.id, id), eq(t.userId, userId)))
        .returning();
      return rows.length > 0;
    },
  };
}

/** db を束縛して withOwner(userId) を返す。app は getDb()、テストは pglite を注入。 */
export function makeOwner(db: AnyDb) {
  return function withOwner(userId: string) {
    if (!userId)
      throw new Error("withOwner: userId is required (auth が解決した値のみ)");
    return {
      items: ownedRepo(db, items, userId),
      inspectionLogs: ownedRepo(db, inspectionLogs, userId),
      shoppingItems: ownedRepo(db, shoppingItems, userId),
    };
  };
}

export type WithOwner = ReturnType<typeof makeOwner>;
