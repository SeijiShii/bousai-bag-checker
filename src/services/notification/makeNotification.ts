import { and, eq } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { notificationSettings, notifications, emailDeliveries } from '@/db/schema';
import type * as schema from '@/db/schema';
import type { NotificationType } from '@/db/enums';
import { scrubPII } from './pii';

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

/** 実 Resend の抽象 (injectable、O35)。userId のユーザーへメール送信。テストは mock。 */
export interface EmailSender {
  send(userId: string, template: string, data: Record<string, unknown>): Promise<void>;
}

const DEFAULT_SETTINGS = { emailEnabled: false, inappEnabled: true, leadDays: 14 };

function inQuietHours(now: Date, start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  const hm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  // start<end は通常範囲、start>end は折返し (夜跨ぎ)
  return start <= end ? hm >= start && hm < end : hm >= start || hm < end;
}

export function makeNotification(db: AnyDb, sender: EmailSender) {
  return {
    async getSettings(userId: string) {
      const rows = await db
        .select()
        .from(notificationSettings)
        .where(eq(notificationSettings.userId, userId))
        .limit(1);
      return rows[0] ?? { userId, ...DEFAULT_SETTINGS, quietHoursStart: null, quietHoursEnd: null };
    },

    async updateSettings(userId: string, patch: Partial<typeof DEFAULT_SETTINGS> & { quietHoursStart?: string | null; quietHoursEnd?: string | null }) {
      const rows = await db
        .insert(notificationSettings)
        .values({ userId, ...patch })
        .onConflictDoUpdate({ target: notificationSettings.userId, set: { ...patch, updatedAt: new Date() } })
        .returning();
      return rows[0]!;
    },

    async createInApp(userId: string, type: NotificationType, title: string, body: string) {
      // title/body に PII を残さない (SEC-002): 呼び出し側が品目名等を入れる場合に備え scrub
      const rows = await db
        .insert(notifications)
        .values({ userId, type, title: scrubPII(title), body: scrubPII(body) })
        .returning();
      return rows[0]!;
    },

    async listInApp(userId: string) {
      return db.select().from(notifications).where(eq(notifications.userId, userId));
    },

    async markRead(userId: string, id: string): Promise<boolean> {
      const rows = await db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
        .returning();
      return rows.length > 0;
    },

    /** 購読確認 → Resend 送信 → 配信履歴記録。OFF/quiet は skipped。失敗は failed。 */
    async sendEmail(userId: string, template: string, data: Record<string, unknown>, now: Date = new Date()) {
      const settings = await this.getSettings(userId);
      if (!settings.emailEnabled || inQuietHours(now, settings.quietHoursStart, settings.quietHoursEnd)) {
        await db.insert(emailDeliveries).values({ userId, template, status: 'skipped' });
        return 'skipped' as const;
      }
      try {
        await sender.send(userId, template, scrubPII(data));
        await db.insert(emailDeliveries).values({ userId, template, status: 'sent' });
        return 'sent' as const;
      } catch {
        // PII を含めずに failed 記録 (SEC-002)
        await db.insert(emailDeliveries).values({ userId, template, status: 'failed' });
        return 'failed' as const;
      }
    },
  };
}

export type NotificationService = ReturnType<typeof makeNotification>;
