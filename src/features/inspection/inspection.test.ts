import { describe, it, expect, beforeEach, vi } from "vitest";
import { eq } from "drizzle-orm";
import { makeTestDb } from "@/db/test-helpers";
import { users, items, emailDeliveries } from "@/db/schema";
import { makeNotification, type EmailSender } from "@/services/notification";
import { makeInspection } from "./makeInspection";
import { getDueItems } from "./dueItems";
import type { Item } from "@/types/db";

type TestDb = Awaited<ReturnType<typeof makeTestDb>>;

let db: TestDb;
let userId: string;
let sendSpy: ReturnType<typeof vi.fn>;
let sender: EmailSender;
// DB の now() (実マシン時刻) と冪等の当日判定を揃えるため実時刻を基準にする
const NOW = new Date();

function soon(days: number): string {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

beforeEach(async () => {
  db = await makeTestDb();
  const [u] = await db
    .insert(users)
    .values({ clerkUserId: "insp" })
    .returning();
  userId = u!.id;
  sendSpy = vi.fn(async () => {});
  sender = { send: sendSpy as unknown as EmailSender["send"] };
});

describe("getDueItems (freshness 再利用)", () => {
  it("期限間近のみ抽出、check_only は除外", () => {
    const base = {
      userId,
      quantity: 1,
      storageLocation: null,
      photoUrl: null,
      replaceMonths: null,
      note: null,
      createdAt: NOW,
      updatedAt: NOW,
    };
    const list = [
      {
        ...base,
        id: "1",
        name: "水",
        category: "water",
        freshnessType: "expiry",
        expiresAt: soon(3),
      },
      {
        ...base,
        id: "2",
        name: "食料",
        category: "food",
        freshnessType: "expiry",
        expiresAt: soon(60),
      },
      {
        ...base,
        id: "3",
        name: "書類",
        category: "document",
        freshnessType: "check_only",
        expiresAt: null,
      },
    ] as unknown as Item[];
    const due = getDueItems(list, 14, NOW);
    expect(due.map((d) => d.id)).toEqual(["1"]);
  });
});

describe("runExpiryCheck (cron 冪等)", () => {
  beforeEach(async () => {
    await db
      .insert(items)
      .values({
        userId,
        name: "水",
        category: "water",
        freshnessType: "expiry",
        expiresAt: soon(5),
      });
  });

  it("U-N5: 購読ON + 期限間近 → 通知、email_deliveries 記録", async () => {
    const notification = makeNotification(db, sender);
    await notification.updateSettings(userId, { emailEnabled: true });
    const insp = makeInspection(db, notification);
    const r = await insp.runExpiryCheck(NOW);
    expect(r.notified).toBe(1);
    expect(sendSpy).toHaveBeenCalled();
  });

  it("U-E3 (R2): 当日2回目は冪等で skip(送信1回のみ)", async () => {
    const notification = makeNotification(db, sender);
    await notification.updateSettings(userId, { emailEnabled: true });
    const insp = makeInspection(db, notification);
    await insp.runExpiryCheck(NOW);
    const second = await insp.runExpiryCheck(NOW);
    expect(second.notified).toBe(0); // 冪等
    expect(sendSpy).toHaveBeenCalledTimes(1);
    const deliveries = await db
      .select()
      .from(emailDeliveries)
      .where(eq(emailDeliveries.userId, userId));
    expect(deliveries).toHaveLength(1);
  });
});

describe("recordInspection (owner)", () => {
  it("U-N6: 点検結果を記録 + listLogs", async () => {
    const insp = makeInspection(db, makeNotification(db, sender));
    await insp.recordInspection(userId, {
      total: 3,
      checked: 3,
      needsReplace: 0,
    });
    const logs = await insp.listLogs(userId);
    expect(logs).toHaveLength(1);
    expect((logs[0]!.summary as { total: number }).total).toBe(3);
  });
});
