import type { ItemInput, ItemWithFreshness } from '@/features/inventory';
import type { FeedbackInput } from '@/features/feedback';
import type { ShoppingItem } from '@/types/db';

export interface NotificationSettings {
  emailEnabled: boolean;
  inappEnabled: boolean;
  leadDays: number;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

export interface InspectionSummary {
  total: number;
  checked: number;
  needsReplace: number;
}

/**
 * 画面が使うデータ操作の抽象 (現在ユーザーにスコープ済み、userId 引数なし)。
 * - dev / E2E: memoryBackend (keyless, in-memory)
 * - 本番: httpBackend (/api/* → Vercel Functions → services → Neon)
 *
 * SEC-001 (所有者分離) は api 層 (getAuthUserId + withOwner) で担保。memoryBackend は単一 dev ユーザー。
 */
export interface Backend {
  // 品目 (inventory)
  listItems(): Promise<ItemWithFreshness[]>;
  createItem(input: ItemInput): Promise<void>;
  removeItem(id: string): Promise<void>;
  // 点検 (inspection)
  recordInspection(summary: InspectionSummary): Promise<void>;
  // 買い物 (shopping-list)
  listShopping(): Promise<ShoppingItem[]>;
  generateShopping(): Promise<ShoppingItem[]>;
  setShoppingBought(id: string, isBought: boolean): Promise<void>;
  exportShoppingCsv(): Promise<string>;
  // フィードバック (feedback)
  submitFeedback(input: FeedbackInput): Promise<void>;
  // 設定 (notification)
  getSettings(): Promise<NotificationSettings>;
  updateSettings(patch: Partial<NotificationSettings>): Promise<void>;
  // 投げ銭 (billing, D-028 無料・任意支援)
  createTipCheckout(): Promise<{ url: string }>;
}
