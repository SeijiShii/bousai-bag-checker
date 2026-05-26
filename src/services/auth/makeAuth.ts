import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { users } from "@/db/schema";
import type * as schema from "@/db/schema";
import {
  type AuthClient,
  type SessionResolver,
  UnauthorizedError,
} from "./authClient";

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

/**
 * db + SessionResolver を注入して AuthClient を構築。
 * getAuthUserId が SEC-001 の唯一の信用入口 (リクエストボディの user_id は信用しない)。
 * O22: Clerk が anonymous→permanent を同一 userId で継続するため、users.clerk_user_id 維持でデータ引き継ぎ。
 */
export function makeAuth(db: AnyDb, session: SessionResolver): AuthClient {
  async function getOrCreateUser(clerkUserId: string): Promise<string> {
    if (!clerkUserId)
      throw new Error("getOrCreateUser: clerkUserId is required");
    // upsert: 既存 clerk_user_id なら updatedAt 更新、無ければ作成 (UNIQUE で冪等)
    const rows = await db
      .insert(users)
      .values({ clerkUserId })
      .onConflictDoUpdate({
        target: users.clerkUserId,
        set: { updatedAt: new Date() },
      })
      .returning({ id: users.id });
    return rows[0]!.id;
  }

  async function getAuthUserId(req: unknown): Promise<string | null> {
    const clerkUserId = await session.resolveClerkUserId(req);
    if (!clerkUserId) return null;
    return getOrCreateUser(clerkUserId);
  }

  async function requireUser(req: unknown): Promise<string> {
    const userId = await getAuthUserId(req);
    if (!userId) throw new UnauthorizedError();
    return userId;
  }

  return { getAuthUserId, requireUser, getOrCreateUser };
}
