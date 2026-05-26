import { describe, it, expect } from "vitest";
import { makeMemoryBackend } from "./memoryBackend";

const NOW = new Date("2026-05-27T09:00:00+09:00");
const iso = (offsetDays: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

describe("makeMemoryBackend (keyless データ層)", () => {
  it("createItem → listItems で鮮度付きで返る", async () => {
    const b = makeMemoryBackend({ now: () => NOW });
    await b.createItem({
      name: "保存水",
      category: "water",
      quantity: 1,
      freshnessType: "expiry",
      expiresAt: iso(400),
    });
    await b.createItem({
      name: "非常食",
      category: "food",
      quantity: 1,
      freshnessType: "expiry",
      expiresAt: iso(-1),
    });
    const items = await b.listItems();
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.name === "保存水")?.freshness).toBe("fresh");
    expect(items.find((i) => i.name === "非常食")?.freshness).toBe("expired");
  });

  it("createItem はバリデーション (name 空) で reject", async () => {
    const b = makeMemoryBackend({ now: () => NOW });
    await expect(
      b.createItem({
        name: "",
        category: "water",
        quantity: 1,
        freshnessType: "expiry",
        expiresAt: iso(10),
      }),
    ).rejects.toBeTruthy();
  });

  it("removeItem で一覧から消える", async () => {
    const b = makeMemoryBackend({ now: () => NOW });
    await b.createItem({
      name: "水",
      category: "water",
      quantity: 1,
      freshnessType: "expiry",
      expiresAt: iso(400),
    });
    const [item] = await b.listItems();
    await b.removeItem(item!.id);
    expect(await b.listItems()).toHaveLength(0);
  });

  it("generateShopping: fresh は除外、expired/warn を起こす + 重複防止 (R2)", async () => {
    const b = makeMemoryBackend({ now: () => NOW });
    await b.createItem({
      name: "fresh水",
      category: "water",
      quantity: 1,
      freshnessType: "expiry",
      expiresAt: iso(400),
    });
    await b.createItem({
      name: "期限切れ食",
      category: "food",
      quantity: 1,
      freshnessType: "expiry",
      expiresAt: iso(-3),
    });
    const first = await b.generateShopping();
    expect(first.map((s) => s.name)).toEqual(["期限切れ食"]);
    const second = await b.generateShopping(); // 2 回目は重複生成しない
    expect(second).toHaveLength(0);
    expect(await b.listShopping()).toHaveLength(1);
  });

  it("setShoppingBought / exportShoppingCsv", async () => {
    const b = makeMemoryBackend({ now: () => NOW });
    await b.createItem({
      name: "電池",
      category: "other",
      quantity: 1,
      freshnessType: "expiry",
      expiresAt: iso(-1),
    });
    const [gen] = await b.generateShopping();
    await b.setShoppingBought(gen!.id, true);
    expect((await b.listShopping())[0]!.isBought).toBe(true);
    const csv = await b.exportShoppingCsv();
    expect(csv).toContain("品目,理由,購入済");
    expect(csv).toContain("電池");
  });

  it("updateSettings の leadDays が鮮度判定に効く", async () => {
    const b = makeMemoryBackend({ now: () => NOW });
    await b.createItem({
      name: "水",
      category: "water",
      quantity: 1,
      freshnessType: "expiry",
      expiresAt: iso(20),
    });
    expect((await b.listItems())[0]!.freshness).toBe("fresh"); // leadDays=14 では先
    await b.updateSettings({ leadDays: 30 });
    expect((await b.listItems())[0]!.freshness).toBe("warn"); // leadDays=30 で警告圏内
  });

  it("createTipCheckout は URL を返す (無料・任意支援 D-028)", async () => {
    const b = makeMemoryBackend();
    expect((await b.createTipCheckout()).url).toMatch(/^https?:\/\//);
  });

  it("seed=true でデモ品目3件 (fresh/warn/expired)", async () => {
    const b = makeMemoryBackend({ seed: true, now: () => NOW });
    const items = await b.listItems();
    expect(items).toHaveLength(3);
    const statuses = new Set(items.map((i) => i.freshness));
    expect(statuses.has("expired")).toBe(true);
  });
});
