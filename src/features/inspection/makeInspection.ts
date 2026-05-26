import { and, eq, gte, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { users, items, inspectionLogs, emailDeliveries } from "@/db/schema";
import type * as schema from "@/db/schema";
import type { NotificationService } from "@/services/notification";
import { getDueItems } from "./dueItems";

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

const EXPIRY_TEMPLATE = "expiry_reminder";

export function makeInspection(db: AnyDb, notification: NotificationService) {
  /** 当日すでに expiry_reminder の通知試行(sent/skipped 問わず)があるか (cron 多重起動耐性、spec-review R2)。
   *  in-app の重複も防ぐため status を問わず「当日 1 回」に制限。 */
  async function alreadyNotifiedToday(
    userId: string,
    dayStart: Date,
  ): Promise<boolean> {
    const rows = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(emailDeliveries)
      .where(
        and(
          eq(emailDeliveries.userId, userId),
          eq(emailDeliveries.template, EXPIRY_TEMPLATE),
          gte(emailDeliveries.createdAt, dayStart),
        ),
      );
    return (rows[0]?.c ?? 0) > 0;
  }

  return {
    /** 日次 cron: 全ユーザーの期限間近 items を抽出 → 通知。冪等(当日重複送信抑制)。1ユーザー失敗で継続。 */
    async runExpiryCheck(
      now: Date = new Date(),
    ): Promise<{ notified: number; skipped: number }> {
      const dayStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      );
      const allUsers = await db.select({ id: users.id }).from(users);
      let notified = 0;
      let skipped = 0;
      for (const u of allUsers) {
        try {
          const settings = await notification.getSettings(u.id);
          const userItems = await db
            .select()
            .from(items)
            .where(eq(items.userId, u.id));
          const due = getDueItems(userItems, settings.leadDays, now);
          if (due.length === 0) {
            skipped += 1;
            continue;
          }
          if (await alreadyNotifiedToday(u.id, dayStart)) {
            skipped += 1;
            continue;
          }
          // 通知本文に保管場所等 PII を含めない (件数のみ、SEC-002)
          await notification.createInApp(
            u.id,
            "expiry_reminder",
            "そろそろ点検どうぞ",
            `${due.length} 件の点検時期が近づいています`,
          );
          const r = await notification.sendEmail(
            u.id,
            EXPIRY_TEMPLATE,
            { dueCount: due.length },
            now,
          );
          if (r === "sent") notified += 1;
          else skipped += 1;
        } catch {
          skipped += 1; // 1 ユーザー失敗で他を止めない
        }
      }
      return { notified, skipped };
    },

    /** 季節点検の完了記録 (withOwner 相当、本人のみ)。 */
    async recordInspection(userId: string, summary: Record<string, unknown>) {
      const rows = await db
        .insert(inspectionLogs)
        .values({ userId, summary })
        .returning();
      return rows[0]!;
    },

    async listLogs(userId: string) {
      return db
        .select()
        .from(inspectionLogs)
        .where(eq(inspectionLogs.userId, userId));
    },
  };
}

export type InspectionService = ReturnType<typeof makeInspection>;
