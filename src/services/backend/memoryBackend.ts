import type { Item, ShoppingItem } from '@/types/db';
import type { ShoppingReason } from '@/db/enums';
import { computeFreshness, itemInputSchema, type ItemWithFreshness } from '@/features/inventory';
import { toCsv } from '@/features/shopping-list';
import type { Backend, InspectionSummary, NotificationSettings } from './port';

const DEV_USER = 'dev-user';

const DEFAULT_SETTINGS: NotificationSettings = {
  emailEnabled: false,
  inappEnabled: true,
  leadDays: 14,
  quietHoursStart: null,
  quietHoursEnd: null,
};

export interface MemoryBackendOptions {
  /** dev/デモ用の初期品目を投入する (E2E は通常 false で空から開始)。 */
  seed?: boolean;
  /** テスト用の時刻注入。 */
  now?: () => Date;
}

/** dev/デモ用シード: fresh / warn(期限間近) / expired の 3 品目。 */
function seedItems(today: Date): Item[] {
  const iso = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  };
  const base = (over: Partial<Item>): Item => ({
    id: crypto.randomUUID(),
    userId: DEV_USER,
    name: '',
    category: 'water',
    quantity: 1,
    storageLocation: null,
    photoUrl: null,
    freshnessType: 'expiry',
    expiresAt: null,
    replaceMonths: null,
    note: null,
    createdAt: today,
    updatedAt: today,
    ...over,
  });
  return [
    base({ name: '保存水 2L', category: 'water', expiresAt: iso(400) }),
    base({ name: '非常食(アルファ米)', category: 'food', expiresAt: iso(5) }),
    base({ name: 'モバイルバッテリー', category: 'other', expiresAt: iso(-10) }),
  ];
}

/**
 * keyless インメモリ Backend (dev / E2E)。
 * pure ドメイン関数 (computeFreshness / toCsv / itemInputSchema) を再利用し、DB を持たずに画面を駆動する。
 */
export function makeMemoryBackend(opts: MemoryBackendOptions = {}): Backend {
  const now = opts.now ?? (() => new Date());
  let items: Item[] = opts.seed ? seedItems(now()) : [];
  let shopping: ShoppingItem[] = [];
  let settings: NotificationSettings = { ...DEFAULT_SETTINGS };

  const withFreshness = (item: Item): ItemWithFreshness => ({
    ...item,
    freshness: computeFreshness(item, settings.leadDays, now()),
  });

  return {
    async listItems() {
      return items.map(withFreshness);
    },

    async createItem(input) {
      const parsed = itemInputSchema.parse(input);
      const ts = now();
      items = [
        ...items,
        {
          id: crypto.randomUUID(),
          userId: DEV_USER,
          name: parsed.name,
          category: parsed.category,
          quantity: parsed.quantity,
          storageLocation: parsed.storageLocation ?? null,
          photoUrl: null,
          freshnessType: parsed.freshnessType,
          expiresAt: parsed.expiresAt ?? null,
          replaceMonths: parsed.replaceMonths ?? null,
          note: parsed.note ?? null,
          createdAt: ts,
          updatedAt: ts,
        },
      ];
    },

    async removeItem(id) {
      items = items.filter((i) => i.id !== id);
      // FK は本番 set null。dev も追従。
      shopping = shopping.map((s) => (s.itemId === id ? { ...s, itemId: null } : s));
    },

    async recordInspection(_summary: InspectionSummary) {
      // dev は no-op (本番は inspection_logs に記録)。
    },

    async listShopping() {
      return shopping;
    },

    async generateShopping() {
      const existingItemIds = new Set(
        shopping.filter((s) => !s.isBought).map((s) => s.itemId).filter((x): x is string => !!x),
      );
      const created: ShoppingItem[] = [];
      for (const item of items) {
        const f = computeFreshness(item, settings.leadDays, now());
        if (f === 'fresh') continue;
        if (existingItemIds.has(item.id)) continue; // 重複防止 (R2)
        const reason: ShoppingReason = f === 'expired' ? 'expired' : 'insufficient';
        created.push({
          id: crypto.randomUUID(),
          userId: DEV_USER,
          itemId: item.id,
          name: item.name,
          reason,
          isBought: false,
          boughtAt: null,
          createdAt: now(),
        });
      }
      shopping = [...shopping, ...created];
      return created;
    },

    async setShoppingBought(id, isBought) {
      shopping = shopping.map((s) =>
        s.id === id ? { ...s, isBought, boughtAt: isBought ? now() : null } : s,
      );
    },

    async exportShoppingCsv() {
      return toCsv(shopping.map((s) => ({ name: s.name, reason: s.reason, isBought: s.isBought })));
    },

    async submitFeedback(_input) {
      // dev は no-op (本番は feedback テーブル + 運用通知)。
    },

    async getSettings() {
      return { ...settings };
    },

    async updateSettings(patch) {
      settings = { ...settings, ...patch };
    },

    async createTipCheckout() {
      // dev は擬似 URL (本番は Stripe Checkout)。
      return { url: 'https://example.test/checkout/dev-tip' };
    },
  };
}
