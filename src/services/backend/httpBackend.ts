import type { Backend } from './port';
import type { ShoppingItem } from '@/types/db';
import { toCsv } from '@/features/shopping-list';

class ApiError extends Error {
  constructor(
    readonly status: number,
    path: string,
  ) {
    super(`API ${path} が失敗しました (${status})`);
    this.name = 'ApiError';
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'content-type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new ApiError(res.status, path);
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/**
 * 本番 Backend: /api/* (Vercel Functions → apiCore → services → Neon) を fetch で呼ぶ。
 * SEC-001 は api 層の auth seam が担保。exportShoppingCsv は listShopping + toCsv をクライアントで実行。
 */
export function makeHttpBackend(): Backend {
  return {
    listItems: () => api('/items'),
    createItem: (input) =>
      api('/items', { method: 'POST', body: JSON.stringify(input) }).then(() => undefined),
    removeItem: (id) =>
      api(`/items?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).then(() => undefined),

    recordInspection: (summary) =>
      api('/inspection', { method: 'POST', body: JSON.stringify(summary) }).then(() => undefined),

    listShopping: () => api('/shopping'),
    generateShopping: () => api('/shopping/generate', { method: 'POST' }),
    setShoppingBought: (id, isBought) =>
      api(`/shopping?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ isBought }),
      }).then(() => undefined),
    exportShoppingCsv: async () => {
      const items = await api<ShoppingItem[]>('/shopping');
      return toCsv(items.map((s) => ({ name: s.name, reason: s.reason, isBought: s.isBought })));
    },

    submitFeedback: (input) =>
      api('/feedback', { method: 'POST', body: JSON.stringify(input) }).then(() => undefined),

    getSettings: () => api('/settings'),
    updateSettings: (patch) =>
      api('/settings', { method: 'PATCH', body: JSON.stringify(patch) }).then(() => undefined),

    createTipCheckout: () => api('/tip', { method: 'POST' }),
  };
}
